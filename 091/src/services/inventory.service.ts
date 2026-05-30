import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus } from '../constants/material.constants';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import Material from '../models/material.model';
import InventoryLedger, { LedgerType } from '../models/inventory-ledger.model';
import MaterialCategory from '../models/material-category.model';
import User from '../models/user.model';

export interface InventoryQueryDto {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  materialId?: number;
  startDate?: string;
  endDate?: string;
  type?: LedgerType;
}

export interface StockOutDto {
  materialId: number;
  quantity: number;
  operatorId: number;
  remarks?: string;
}

export interface InventorySummary {
  categoryId: number;
  categoryName: string;
  totalStock: number;
  inbound: number;
  outbound: number;
  loss: number;
}

class InventoryService {
  async getLedgers(query: InventoryQueryDto): Promise<{ list: InventoryLedger[]; total: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.materialId) where.materialId = query.materialId;
    if (query.type) where.type = query.type;
    if (query.startDate && query.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(query.startDate), new Date(query.endDate)],
      };
    }

    const { count, rows } = await InventoryLedger.findAndCountAll({
      where,
      include: [
        { model: MaterialCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Material, as: 'material', attributes: ['id', 'name', 'batchNo'] },
        { model: User, as: 'operator', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return { list: rows, total: count };
  }

  async getCategorySummary(startDate?: string, endDate?: string): Promise<InventorySummary[]> {
    const categories = await MaterialCategory.findAll({ where: { isActive: true } });
    const summaries: InventorySummary[] = [];

    for (const category of categories) {
      const where: any = { categoryId: category.id };
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const ledgers = await InventoryLedger.findAll({ where });

      const inbound = ledgers
        .filter((l) => l.type === LedgerType.INBOUND)
        .reduce((sum, l) => sum + Number(l.quantity), 0);

      const outbound = ledgers
        .filter((l) => l.type === LedgerType.OUTBOUND)
        .reduce((sum, l) => sum + Number(l.quantity), 0);

      const loss = ledgers
        .filter((l) => l.type === LedgerType.PROCESS_LOSS)
        .reduce((sum, l) => sum + Number(l.quantity), 0);

      const materials = await Material.findAll({ where: { categoryId: category.id } });
      const totalStock = materials.reduce((sum, m) => sum + Number(m.quantity), 0);

      summaries.push({
        categoryId: category.id,
        categoryName: category.name,
        totalStock,
        inbound,
        outbound,
        loss,
      });
    }

    return summaries;
  }

  async stockOut(stockOutDto: StockOutDto): Promise<InventoryLedger> {
    const material = await Material.findByPk(stockOutDto.materialId);
    if (!material) {
      throw new NotFoundException('原料不存在');
    }

    if (material.isLocked) {
      throw new BadRequestException(`该批次已被锁定，无法出库${material.lockReason ? `：${material.lockReason}` : ''}`);
    }

    if (material.status === MaterialStatus.FAILED) {
      throw new BadRequestException('不合格批次禁止出库');
    }

    if (material.quantity < stockOutDto.quantity) {
      throw new BadRequestException('库存不足');
    }

    return await sequelize.transaction(async (t: Transaction) => {
      const beforeQuantity = material.quantity;
      const afterQuantity = material.quantity - stockOutDto.quantity;

      await material.update({ quantity: afterQuantity }, { transaction: t });

      const ledger = await InventoryLedger.create(
        {
          categoryId: material.categoryId,
          materialId: material.id,
          batchNo: material.batchNo,
          type: LedgerType.OUTBOUND,
          quantity: stockOutDto.quantity,
          beforeQuantity,
          afterQuantity,
          operatorId: stockOutDto.operatorId,
          remarks: stockOutDto.remarks || '出库',
        },
        { transaction: t }
      );

      return ledger;
    });
  }

  async getMaterialLedgers(materialId: number): Promise<InventoryLedger[]> {
    return await InventoryLedger.findAll({
      where: { materialId },
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
      order: [['createdAt', 'ASC']],
    });
  }
}

export default new InventoryService();
