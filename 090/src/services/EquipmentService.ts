import Equipment from '../models/Equipment';
import EquipmentCategory from '../models/EquipmentCategory';
import { EquipmentStatus, PageResult, OperationModule, OperationType, EquipmentWarning, WarningLevel, AdminRole } from '../types';
import { BadRequestError, NotFoundError, ConflictError } from '../middleware/errorHandler';
import { OperationLogService } from './OperationLogService';
import { Request } from 'express';
import sequelize from '../config/database';
import { Op, Transaction } from 'sequelize';

export interface CreateEquipmentParams {
  equipmentNo: string;
  name: string;
  categoryId: number;
  brand: string;
  model: string;
  manufactureYear: number;
  storeId: number;
  dailyRent: number;
  deposit: number;
  inspectionCycleMonths?: number;
  lastInspectionDate?: Date;
  remark?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface UpdateEquipmentParams {
  id: number;
  name?: string;
  categoryId?: number;
  brand?: string;
  model?: string;
  manufactureYear?: number;
  storeId?: number;
  dailyRent?: number;
  deposit?: number;
  inspectionCycleMonths?: number;
  lastInspectionDate?: Date;
  status?: EquipmentStatus;
  remark?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface EquipmentQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  equipmentNo?: string;
  name?: string;
  brand?: string;
  model?: string;
  categoryId?: number;
  storeId?: number;
  status?: EquipmentStatus;
  hasWarning?: boolean;
}

export class EquipmentService {
  private static async checkCategoryStatus(categoryId: number, transaction?: Transaction): Promise<void> {
    const category = await EquipmentCategory.findByPk(categoryId, { transaction });
    if (!category) {
      throw new BadRequestError('装备类目不存在');
    }
    if (category.status === 0) {
      throw new BadRequestError('该类目已停产，无法新增或修改装备');
    }
    if (category.parentId) {
      await this.checkCategoryStatus(category.parentId, transaction);
    }
  }

  static async create(params: CreateEquipmentParams): Promise<Equipment> {
    const transaction = await sequelize.transaction();

    try {
      await this.checkCategoryStatus(params.categoryId, transaction);

      const existing = await Equipment.findOne({
        where: { equipmentNo: params.equipmentNo },
        transaction
      });
      if (existing) {
        throw new ConflictError('装备编号已存在');
      }

      const equipment = await Equipment.create({
        equipmentNo: params.equipmentNo,
        name: params.name,
        categoryId: params.categoryId,
        brand: params.brand,
        model: params.model,
        manufactureYear: params.manufactureYear,
        storeId: params.storeId,
        dailyRent: params.dailyRent,
        deposit: params.deposit,
        inspectionCycleMonths: params.inspectionCycleMonths || 12,
        lastInspectionDate: params.lastInspectionDate,
        status: EquipmentStatus.IN_STOCK,
        remark: params.remark
      }, { transaction });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.CREATE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: params.storeId,
        afterData: equipment.toJSON(),
        remark: '新增装备',
        req: params.req
      });

      await transaction.commit();
      return equipment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(params: UpdateEquipmentParams): Promise<Equipment> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(params.id, { transaction });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      const beforeData = equipment.toJSON();

      if (params.categoryId) {
        await this.checkCategoryStatus(params.categoryId, transaction);
      }

      await equipment.update({
        name: params.name,
        categoryId: params.categoryId,
        brand: params.brand,
        model: params.model,
        manufactureYear: params.manufactureYear,
        storeId: params.storeId,
        dailyRent: params.dailyRent,
        deposit: params.deposit,
        inspectionCycleMonths: params.inspectionCycleMonths,
        lastInspectionDate: params.lastInspectionDate,
        status: params.status,
        remark: params.remark
      }, { transaction });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.UPDATE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: params.storeId || equipment.storeId,
        beforeData,
        afterData: equipment.toJSON(),
        remark: '更新装备信息',
        req: params.req
      });

      await transaction.commit();
      return equipment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async delete(id: number, operatorId: number, operatorName: string, req?: Request): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(id, { transaction });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status !== EquipmentStatus.IN_STOCK) {
        throw new BadRequestError('只有在库状态的装备才能删除');
      }

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.DELETE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId,
        operatorName,
        storeId: equipment.storeId,
        beforeData: equipment.toJSON(),
        remark: '删除装备',
        req
      });

      await equipment.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getById(id: number): Promise<Equipment | null> {
    return await Equipment.findByPk(id, {
      include: [{ model: EquipmentCategory, as: 'category', attributes: ['id', 'name'] }]
    });
  }

  static async getList(params: EquipmentQueryParams, userRole?: AdminRole, userStoreId?: number): Promise<PageResult<Equipment>> {
    const { page, pageSize, keyword, equipmentNo, name, brand, model, categoryId, storeId, status, hasWarning } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (userRole !== AdminRole.SUPER_ADMIN && userStoreId) {
      where.storeId = userStoreId;
    } else if (storeId) {
      where.storeId = storeId;
    }

    if (equipmentNo) where.equipmentNo = { [Op.like]: `%${equipmentNo}%` };
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (brand) where.brand = { [Op.like]: `%${brand}%` };
    if (model) where.model = { [Op.like]: `%${model}%` };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    if (keyword) {
      where[Op.or] = [
        { equipmentNo: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
        { model: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (hasWarning) {
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      where[Op.and] = sequelize.literal(`
        (status != '${EquipmentStatus.SCRAPPED}') AND (
          lastInspectionDate IS NULL OR
          DATE_ADD(lastInspectionDate, INTERVAL inspectionCycleMonths MONTH) <= '${thirtyDaysLater.toISOString()}'
        )
      `);
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [{ model: EquipmentCategory, as: 'category', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async generateEquipmentNo(prefix: string = 'EQ'): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    const lastEquipment = await Equipment.findOne({
      where: { equipmentNo: { [Op.like]: `${prefix}${dateStr}%` } },
      order: [['equipmentNo', 'DESC']]
    });

    let sequence = 1;
    if (lastEquipment) {
      const match = lastEquipment.equipmentNo.match(/\d{4}$/);
      if (match) {
        sequence = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${dateStr}${String(sequence).padStart(4, '0')}`;
  }

  static async lockForRent(id: number, operatorId: number, operatorName: string, req?: Request): Promise<Equipment> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(id, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status !== EquipmentStatus.IN_STOCK) {
        throw new BadRequestError('只有在库状态的装备才能租借');
      }

      const beforeData = equipment.toJSON();

      await equipment.update({ status: EquipmentStatus.RESERVED }, { transaction });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId,
        operatorName,
        storeId: equipment.storeId,
        beforeData,
        afterData: equipment.toJSON(),
        remark: '装备锁定用于租借',
        req
      });

      await transaction.commit();
      return equipment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async unlock(id: number, operatorId: number, operatorName: string, req?: Request): Promise<Equipment> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(id, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status !== EquipmentStatus.RESERVED) {
        throw new BadRequestError('只有预定状态的装备才能解锁');
      }

      const beforeData = equipment.toJSON();

      await equipment.update({ status: EquipmentStatus.IN_STOCK }, { transaction });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId,
        operatorName,
        storeId: equipment.storeId,
        beforeData,
        afterData: equipment.toJSON(),
        remark: '解锁装备',
        req
      });

      await transaction.commit();
      return equipment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getEquipmentWarnings(storeId?: number): Promise<EquipmentWarning[]> {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const where: any = {
      status: { [Op.ne]: EquipmentStatus.SCRAPPED }
    };

    if (storeId) {
      where.storeId = storeId;
    }

    const equipments = await Equipment.findAll({ where });

    const warnings: EquipmentWarning[] = [];

    for (const equipment of equipments) {
      if (!equipment.lastInspectionDate) {
        warnings.push({
          equipmentId: equipment.id,
          equipmentNo: equipment.equipmentNo,
          name: equipment.name,
          type: 'inspection',
          level: WarningLevel.WARNING,
          message: '未进行过安全检测',
          daysRemaining: 0
        });
        continue;
      }

      const inspectionCycleMonths = equipment.inspectionCycleMonths || 12;
      const nextInspectionDate = new Date(equipment.lastInspectionDate);
      nextInspectionDate.setMonth(nextInspectionDate.getMonth() + inspectionCycleMonths);

      const daysRemaining = Math.ceil((nextInspectionDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

      if (daysRemaining <= 0) {
        warnings.push({
          equipmentId: equipment.id,
          equipmentNo: equipment.equipmentNo,
          name: equipment.name,
          type: 'inspection',
          level: WarningLevel.DANGER,
          message: `检测已超期 ${Math.abs(daysRemaining)} 天`,
          dueDate: nextInspectionDate,
          daysRemaining
        });
      } else if (daysRemaining <= 7) {
        warnings.push({
          equipmentId: equipment.id,
          equipmentNo: equipment.equipmentNo,
          name: equipment.name,
          type: 'inspection',
          level: WarningLevel.WARNING,
          message: `检测将在 ${daysRemaining} 天后到期`,
          dueDate: nextInspectionDate,
          daysRemaining
        });
      } else if (daysRemaining <= 30) {
        warnings.push({
          equipmentId: equipment.id,
          equipmentNo: equipment.equipmentNo,
          name: equipment.name,
          type: 'inspection',
          level: WarningLevel.REMIND,
          message: `检测将在 ${daysRemaining} 天后到期`,
          dueDate: nextInspectionDate,
          daysRemaining
        });
      }
    }

    return warnings;
  }

  static async getStats(storeId?: number): Promise<{ total: number; inStock: number; rented: number; maintenance: number; scrapped: number; warningCount: number }> {
    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }

    const [total, inStock, rented, maintenance, scrapped, warnings] = await Promise.all([
      Equipment.count({ where }),
      Equipment.count({ where: { ...where, status: EquipmentStatus.IN_STOCK } }),
      Equipment.count({ where: { ...where, status: EquipmentStatus.RENTED } }),
      Equipment.count({ where: { ...where, status: EquipmentStatus.IN_MAINTENANCE } }),
      Equipment.count({ where: { ...where, status: EquipmentStatus.SCRAPPED } }),
      this.getEquipmentWarnings(storeId)
    ]);

    return {
      total,
      inStock,
      rented,
      maintenance,
      scrapped,
      warningCount: warnings.length
    };
  }
}
