import { v4 as uuidv4 } from 'uuid';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { MaterialStatus } from '../constants/material.constants';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import Material, { IMaterialAttributes } from '../models/material.model';
import MaterialCategory from '../models/material-category.model';
import InventoryLedger, { LedgerType } from '../models/inventory-ledger.model';
import User from '../models/user.model';
import ProcessRecord from '../models/process-record.model';

export interface CreateMaterialDto {
  categoryId: number;
  name: string;
  origin: string;
  harvestYear: number;
  processTech: string;
  moistureContent: number;
  quantity: number;
  unit: string;
  agingDays?: number;
  warehouseLocation?: string;
  remarks?: string;
}

export interface UpdateMaterialDto {
  categoryId?: number;
  name?: string;
  origin?: string;
  harvestYear?: number;
  processTech?: string;
  moistureContent?: number;
  quantity?: number;
  unit?: string;
  status?: MaterialStatus;
  agingDays?: number;
  warehouseLocation?: string;
  remarks?: string;
  isLocked?: boolean;
}

export interface MaterialQueryDto {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  status?: MaterialStatus;
  origin?: string;
  batchNo?: string;
  keyword?: string;
  harvestYearMin?: number;
  harvestYearMax?: number;
  moistureContentMin?: number;
  moistureContentMax?: number;
  quantityMin?: number;
  quantityMax?: number;
  minAgingEndDate?: string;
  maxAgingEndDate?: string;
  isLocked?: boolean;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class MaterialService {
  generateBatchNo(): string {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = uuidv4().substring(0, 6).toUpperCase();
    return `XC${dateStr}${random}`;
  }

  private async checkCategorySealed(categoryId: number): Promise<boolean> {
    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) return false;
    
    if (category.isSealed) return true;
    
    if (category.parentId) {
      return await this.checkCategorySealed(category.parentId);
    }
    
    return false;
  }

  async create(createDto: CreateMaterialDto, userId: number): Promise<Material> {
    const category = await MaterialCategory.findByPk(createDto.categoryId);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const isSealed = await this.checkCategorySealed(createDto.categoryId);
    if (isSealed) {
      throw new BadRequestException('该类目或父级类目已停采封存，无法新增原料');
    }

    const batchNo = this.generateBatchNo();

    const material = await Material.create({
      ...createDto,
      batchNo,
      status: MaterialStatus.GOOD,
      isAgingReminded: false,
      createdBy: userId,
    });

    await InventoryLedger.create({
      categoryId: material.categoryId,
      materialId: material.id,
      batchNo: material.batchNo,
      type: LedgerType.INBOUND,
      quantity: material.quantity,
      beforeQuantity: 0,
      afterQuantity: material.quantity,
      operatorId: userId,
      remarks: '原料入库',
    });

    return material;
  }

  async findAll(query: MaterialQueryDto): Promise<{ list: Material[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const where: any = {};
    
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;
    if (query.origin) where.origin = { [Op.like]: `%${query.origin}%` };
    if (query.batchNo) where.batchNo = { [Op.like]: `%${query.batchNo}%` };
    if (query.isLocked !== undefined) where.isLocked = query.isLocked;
    
    if (query.harvestYearMin || query.harvestYearMax) {
      where.harvestYear = {};
      if (query.harvestYearMin) where.harvestYear[Op.gte] = query.harvestYearMin;
      if (query.harvestYearMax) where.harvestYear[Op.lte] = query.harvestYearMax;
    }
    
    if (query.moistureContentMin || query.moistureContentMax) {
      where.moistureContent = {};
      if (query.moistureContentMin) where.moistureContent[Op.gte] = query.moistureContentMin;
      if (query.moistureContentMax) where.moistureContent[Op.lte] = query.moistureContentMax;
    }
    
    if (query.quantityMin || query.quantityMax) {
      where.quantity = {};
      if (query.quantityMin) where.quantity[Op.gte] = query.quantityMin;
      if (query.quantityMax) where.quantity[Op.lte] = query.quantityMax;
    }
    
    if (query.minAgingEndDate || query.maxAgingEndDate) {
      where.agingEndDate = {};
      if (query.minAgingEndDate) where.agingEndDate[Op.gte] = new Date(query.minAgingEndDate);
      if (query.maxAgingEndDate) where.agingEndDate[Op.lte] = new Date(query.maxAgingEndDate);
    }
    
    if (query.keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${query.keyword}%` } },
        { batchNo: { [Op.like]: `%${query.keyword}%` } },
        { origin: { [Op.like]: `%${query.keyword}%` } },
        { processTech: { [Op.like]: `%${query.keyword}%` } },
      ];
    }

    const order: any[] = [];
    if (query.sortField) {
      order.push([query.sortField, query.sortOrder || 'DESC']);
    }
    order.push(['createdAt', 'DESC']);

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [
        { model: MaterialCategory, as: 'category', attributes: ['id', 'name', 'code', 'type'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
      ],
      order,
      limit: pageSize,
      offset,
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async findOne(id: number): Promise<Material> {
    const material = await Material.findByPk(id, {
      include: [
        { model: MaterialCategory, as: 'category' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
      ],
    });
    if (!material) {
      throw new NotFoundException('原料不存在');
    }
    return material;
  }

  async update(id: number, updateDto: UpdateMaterialDto, userId: number): Promise<Material> {
    const material = await this.findOne(id);

    if (updateDto.categoryId) {
      const category = await MaterialCategory.findByPk(updateDto.categoryId);
      if (!category) {
        throw new NotFoundException('类目不存在');
      }
      
      const isSealed = await this.checkCategorySealed(updateDto.categoryId);
      if (isSealed) {
        throw new BadRequestException('目标类目或父级类目已停采封存，无法移动到该类目');
      }
    }

    await material.update(updateDto);
    return material;
  }

  async updateStatus(id: number, status: MaterialStatus, userId: number): Promise<Material> {
    const material = await this.findOne(id);
    await material.update({ status });
    return material;
  }

  async startAging(id: number, agingDays: number, userId: number): Promise<Material> {
    const material = await this.findOne(id);
    const now = new Date();
    const endDate = new Date(now.getTime() + agingDays * 24 * 60 * 60 * 1000);

    await material.update({
      status: MaterialStatus.SEALED,
      agingDays,
      agingStartDate: now,
      agingEndDate: endDate,
      isAgingReminded: false,
    });

    return material;
  }

  async getTraceability(batchNo: string): Promise<any> {
    const material = await Material.findOne({
      where: { batchNo },
      include: [{ model: MaterialCategory, as: 'category' }],
    });
    if (!material) {
      throw new NotFoundException('批次不存在');
    }

    const ledgers = await InventoryLedger.findAll({
      where: { batchNo },
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
      order: [['createdAt', 'ASC']],
    });

    return {
      material,
      ledgers,
    };
  }

  async toggleLock(id: number, isLocked: boolean, userId: number, reason?: string): Promise<Material> {
    const material = await this.findOne(id);
    
    if (isLocked && material.status === MaterialStatus.FAILED) {
      throw new BadRequestException('不合格批次已自动锁定');
    }
    
    await material.update({ 
      isLocked,
      lockReason: reason,
      lockedAt: isLocked ? new Date() : null,
      lockedBy: isLocked ? userId : null,
    });
    
    return material;
  }

  async getOriginStats(): Promise<any[]> {
    const result = await Material.findAll({
      attributes: [
        'origin',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      ],
      group: ['origin'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      where: { isActive: true },
    });
    
    return result;
  }

  async getStatusStats(): Promise<any[]> {
    const result = await Material.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      ],
      group: ['status'],
      where: { isActive: true },
    });
    
    return result;
  }
}

export default new MaterialService();
