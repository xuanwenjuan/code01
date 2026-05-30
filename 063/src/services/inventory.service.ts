import InventoryCheck, { InventoryCheckStatus } from '../models/InventoryCheck';
import InventoryCheckItem, { CheckResultType } from '../models/InventoryCheckItem';
import Material from '../models/Material';
import StockLog, { StockLogType } from '../models/StockLog';
import { BusinessError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export interface CreateInventoryCheckRequest {
  warehouseId: number;
  checkDate: string;
  operatorId: number;
  remark?: string;
}

export interface UpdateInventoryCheckRequest {
  id: number;
  items: Array<{
    materialId: number;
    actualQuantity: number;
  }>;
}

class InventoryService {
  async create(request: CreateInventoryCheckRequest) {
    const t = await sequelize.transaction();

    try {
      const checkNo = `INV${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const inventoryCheck = await InventoryCheck.create(
        {
          checkNo,
          warehouseId: request.warehouseId,
          checkDate: new Date(request.checkDate),
          operatorId: request.operatorId,
          status: InventoryCheckStatus.DRAFT,
          remark: request.remark,
          totalProfitQuantity: 0,
          totalLossQuantity: 0,
          totalProfitAmount: 0,
          totalLossAmount: 0
        },
        { transaction: t }
      );

      const materials = await Material.findAll({
        where: { warehouseId: request.warehouseId, status: 1 },
        transaction: t
      });

      for (const material of materials) {
        await InventoryCheckItem.create(
          {
            inventoryCheckId: inventoryCheck.id,
            materialId: material.id,
            systemQuantity: material.stockQuantity,
            actualQuantity: material.stockQuantity,
            differenceQuantity: 0,
            resultType: CheckResultType.NORMAL,
            unitPrice: material.unitPrice,
            differenceAmount: 0
          },
          { transaction: t }
        );
      }

      await t.commit();
      return inventoryCheck;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateItems(request: UpdateInventoryCheckRequest) {
    const t = await sequelize.transaction();

    try {
      const inventoryCheck = await InventoryCheck.findByPk(request.id, { transaction: t });
      if (!inventoryCheck) {
        throw new BusinessError('盘点单不存在', 404);
      }
      if (inventoryCheck.status !== InventoryCheckStatus.DRAFT) {
        throw new BusinessError('只能修改草稿状态的盘点单', 400);
      }

      let totalProfitQuantity = 0;
      let totalLossQuantity = 0;
      let totalProfitAmount = 0;
      let totalLossAmount = 0;

      for (const item of request.items) {
        const checkItem = await InventoryCheckItem.findOne({
          where: { inventoryCheckId: request.id, materialId: item.materialId },
          transaction: t
        });

        if (checkItem) {
          const differenceQuantity = item.actualQuantity - checkItem.systemQuantity;
          const differenceAmount = differenceQuantity * parseFloat(checkItem.unitPrice as any);

          let resultType = CheckResultType.NORMAL;
          if (differenceQuantity > 0) {
            resultType = CheckResultType.PROFIT;
            totalProfitQuantity += differenceQuantity;
            totalProfitAmount += differenceAmount;
          } else if (differenceQuantity < 0) {
            resultType = CheckResultType.LOSS;
            totalLossQuantity += Math.abs(differenceQuantity);
            totalLossAmount += Math.abs(differenceAmount);
          }

          await checkItem.update(
            {
              actualQuantity: item.actualQuantity,
              differenceQuantity,
              resultType,
              differenceAmount
            },
            { transaction: t }
          );
        }
      }

      await inventoryCheck.update(
        {
          totalProfitQuantity,
          totalLossQuantity,
          totalProfitAmount,
          totalLossAmount
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async confirm(id: number) {
    const inventoryCheck = await InventoryCheck.findByPk(id);
    if (!inventoryCheck) {
      throw new BusinessError('盘点单不存在', 404);
    }
    if (inventoryCheck.status !== InventoryCheckStatus.DRAFT) {
      throw new BusinessError('只能确认草稿状态的盘点单', 400);
    }

    return inventoryCheck.update({ status: InventoryCheckStatus.CONFIRMED });
  }

  async complete(id: number, operatorId: number) {
    const t = await sequelize.transaction();

    try {
      const inventoryCheck = await InventoryCheck.findByPk(id, { transaction: t });
      if (!inventoryCheck) {
        throw new BusinessError('盘点单不存在', 404);
      }
      if (inventoryCheck.status !== InventoryCheckStatus.CONFIRMED) {
        throw new BusinessError('只能完成已确认状态的盘点单', 400);
      }

      const items = await InventoryCheckItem.findAll({
        where: { inventoryCheckId: id },
        transaction: t
      });

      for (const item of items) {
        if (item.differenceQuantity !== 0) {
          const material = await Material.findByPk(item.materialId, { transaction: t });
          if (material) {
            const beforeQuantity = material.stockQuantity;
            const afterQuantity = item.actualQuantity;

            await material.update({ stockQuantity: afterQuantity }, { transaction: t });

            const logType = item.differenceQuantity > 0 ? StockLogType.CHECK_IN : StockLogType.CHECK_OUT;
            const logNo = `CK${Date.now()}${Math.floor(Math.random() * 1000)}`;
            
            await StockLog.create(
              {
                logNo,
                materialId: item.materialId,
                warehouseId: inventoryCheck.warehouseId,
                type: logType,
                quantity: Math.abs(item.differenceQuantity),
                beforeQuantity,
                afterQuantity,
                operatorId,
                relatedId: inventoryCheck.id,
                relatedType: 'inventory_check',
                remark: `盘点单 ${inventoryCheck.checkNo} 差异调整`
              },
              { transaction: t }
            );
          }
        }
      }

      await inventoryCheck.update(
        { status: InventoryCheckStatus.COMPLETED },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    return InventoryCheck.findByPk(id, {
      include: [
        { model: require('../models/Warehouse').default, as: 'warehouse' },
        {
          model: InventoryCheckItem,
          as: 'items',
          include: [{ model: Material, as: 'material' }]
        }
      ]
    });
  }

  async getList(params: {
    warehouseId?: number;
    status?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }
    if (params.status !== undefined) {
      where.status = params.status;
    }
    if (params.startDate && params.endDate) {
      where.checkDate = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)]
      };
    }

    return InventoryCheck.findAll({
      where,
      include: [
        { model: require('../models/Warehouse').default, as: 'warehouse' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async recordLoss(materialId: number, quantity: number, operatorId: number, remark?: string) {
    const t = await sequelize.transaction();

    try {
      const material = await Material.findByPk(materialId, { transaction: t });
      if (!material) {
        throw new BusinessError('物资不存在', 404);
      }
      if (material.stockQuantity < quantity) {
        throw new BusinessError('库存不足', 400);
      }

      const beforeQuantity = material.stockQuantity;
      const afterQuantity = beforeQuantity - quantity;

      await material.update({ stockQuantity: afterQuantity }, { transaction: t });

      const logNo = `LOSS${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await StockLog.create(
        {
          logNo,
          materialId,
          warehouseId: material.warehouseId,
          type: StockLogType.LOSS,
          quantity,
          beforeQuantity,
          afterQuantity,
          operatorId,
          remark
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new InventoryService();