import MaintenanceRecord from '../models/MaintenanceRecord';
import Equipment from '../models/Equipment';
import { MaintenanceStatus, MaintenanceType, EquipmentStatus, PageResult, OperationModule, OperationType, AdminRole } from '../types';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { OperationLogService } from './OperationLogService';
import { Request } from 'express';
import sequelize from '../config/database';
import { Op, Transaction } from 'sequelize';

export interface CreateMaintenanceParams {
  equipmentId: number;
  storeId: number;
  type: MaintenanceType;
  startDate: Date;
  estimatedEndDate?: Date;
  estimatedCost?: number;
  description?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface CompleteMaintenanceParams {
  recordId: number;
  endDate?: Date;
  actualCost?: number;
  result?: string;
  remark?: string;
  operatorId: number;
  operatorName: string;
  req?: Request;
}

export interface MaintenanceQueryParams {
  page: number;
  pageSize: number;
  recordNo?: string;
  equipmentId?: number;
  storeId?: number;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  startDate?: Date;
  endDate?: Date;
}

export class MaintenanceService {
  private static readonly statusTransitions: Map<MaintenanceStatus, MaintenanceStatus[]> = new Map([
    [MaintenanceStatus.PENDING, [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED]],
    [MaintenanceStatus.IN_PROGRESS, [MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED]],
    [MaintenanceStatus.COMPLETED, []],
    [MaintenanceStatus.CANCELLED, []]
  ]);

  private static canTransition(currentStatus: MaintenanceStatus, nextStatus: MaintenanceStatus): boolean {
    const allowedStatuses = this.statusTransitions.get(currentStatus) || [];
    return allowedStatuses.includes(nextStatus);
  }

  private static async validateTransition(record: MaintenanceRecord, nextStatus: MaintenanceStatus): Promise<void> {
    if (!this.canTransition(record.status as MaintenanceStatus, nextStatus)) {
      throw new BadRequestError(`维保状态不允许从 ${record.status} 变更为 ${nextStatus}`);
    }
  }

  static async generateRecordNo(prefix: string = 'MR'): Promise<string> {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    const lastRecord = await MaintenanceRecord.findOne({
      where: { recordNo: { [Op.like]: `${prefix}${dateStr}%` } },
      order: [['recordNo', 'DESC']]
    });

    let sequence = 1;
    if (lastRecord) {
      const match = lastRecord.recordNo.match(/\d{4}$/);
      if (match) {
        sequence = parseInt(match[0]) + 1;
      }
    }

    return `${prefix}${dateStr}${String(sequence).padStart(4, '0')}`;
  }

  static async create(params: CreateMaintenanceParams): Promise<MaintenanceRecord> {
    const transaction = await sequelize.transaction();

    try {
      const equipment = await Equipment.findByPk(params.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      if (equipment.status === EquipmentStatus.IN_MAINTENANCE) {
        throw new BadRequestError('装备已在维保中');
      }

      const recordNo = await this.generateRecordNo();

      const record = await MaintenanceRecord.create({
        recordNo,
        equipmentId: params.equipmentId,
        storeId: params.storeId,
        type: params.type,
        startDate: params.startDate,
        estimatedEndDate: params.estimatedEndDate,
        estimatedCost: params.estimatedCost,
        description: params.description,
        status: MaintenanceStatus.PENDING,
        createdBy: params.operatorId
      }, { transaction });

      await OperationLogService.create({
        module: OperationModule.MAINTENANCE,
        type: OperationType.CREATE,
        targetId: record.id,
        targetName: record.recordNo,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: params.storeId,
        afterData: record.toJSON(),
        remark: '创建维保记录',
        req: params.req
      });

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async startMaintenance(id: number, operatorId: number, operatorName: string, req?: Request): Promise<MaintenanceRecord> {
    const transaction = await sequelize.transaction();

    try {
      const record = await MaintenanceRecord.findByPk(id, { transaction, lock: true });
      if (!record) {
        throw new NotFoundError('维保记录不存在');
      }

      await this.validateTransition(record, MaintenanceStatus.IN_PROGRESS);

      const equipment = await Equipment.findByPk(record.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      const beforeRecordData = record.toJSON();
      const beforeEquipmentData = equipment.toJSON();

      await record.update({ 
        status: MaintenanceStatus.IN_PROGRESS,
        handledBy: operatorId
      }, { transaction });

      await equipment.update({ status: EquipmentStatus.IN_MAINTENANCE }, { transaction });

      await OperationLogService.create({
        module: OperationModule.MAINTENANCE,
        type: OperationType.MAINTENANCE_START,
        targetId: record.id,
        targetName: record.recordNo,
        operatorId,
        operatorName,
        storeId: record.storeId,
        beforeData: beforeRecordData,
        afterData: record.toJSON(),
        remark: '开始维保',
        req
      });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId,
        operatorName,
        storeId: equipment.storeId,
        beforeData: beforeEquipmentData,
        afterData: equipment.toJSON(),
        remark: '装备进入维保状态',
        req
      });

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async complete(params: CompleteMaintenanceParams): Promise<MaintenanceRecord> {
    const transaction = await sequelize.transaction();

    try {
      const record = await MaintenanceRecord.findByPk(params.recordId, { transaction, lock: true });
      if (!record) {
        throw new NotFoundError('维保记录不存在');
      }

      await this.validateTransition(record, MaintenanceStatus.COMPLETED);

      const equipment = await Equipment.findByPk(record.equipmentId, { transaction, lock: true });
      if (!equipment) {
        throw new NotFoundError('装备不存在');
      }

      const beforeRecordData = record.toJSON();
      const beforeEquipmentData = equipment.toJSON();

      await record.update({ 
        status: MaintenanceStatus.COMPLETED,
        endDate: params.endDate || new Date(),
        actualCost: params.actualCost,
        result: params.result,
        remark: params.remark
      }, { transaction });

      await equipment.update({ status: EquipmentStatus.IN_STOCK }, { transaction });

      await OperationLogService.create({
        module: OperationModule.MAINTENANCE,
        type: OperationType.MAINTENANCE_COMPLETE,
        targetId: record.id,
        targetName: record.recordNo,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: record.storeId,
        beforeData: beforeRecordData,
        afterData: record.toJSON(),
        remark: '完成维保',
        req: params.req
      });

      await OperationLogService.create({
        module: OperationModule.EQUIPMENT,
        type: OperationType.STATUS_CHANGE,
        targetId: equipment.id,
        targetName: equipment.name,
        operatorId: params.operatorId,
        operatorName: params.operatorName,
        storeId: equipment.storeId,
        beforeData: beforeEquipmentData,
        afterData: equipment.toJSON(),
        remark: '装备维保完成入库',
        req: params.req
      });

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async cancel(id: number, operatorId: number, operatorName: string, req?: Request): Promise<MaintenanceRecord> {
    const transaction = await sequelize.transaction();

    try {
      const record = await MaintenanceRecord.findByPk(id, { transaction, lock: true });
      if (!record) {
        throw new NotFoundError('维保记录不存在');
      }

      await this.validateTransition(record, MaintenanceStatus.CANCELLED);

      const equipment = await Equipment.findByPk(record.equipmentId, { transaction, lock: true });

      const beforeRecordData = record.toJSON();
      let beforeEquipmentData;

      await record.update({ status: MaintenanceStatus.CANCELLED }, { transaction });

      if (equipment && equipment.status === EquipmentStatus.IN_MAINTENANCE) {
        beforeEquipmentData = equipment.toJSON();
        await equipment.update({ status: EquipmentStatus.IN_STOCK }, { transaction });
      }

      await OperationLogService.create({
        module: OperationModule.MAINTENANCE,
        type: OperationType.STATUS_CHANGE,
        targetId: record.id,
        targetName: record.recordNo,
        operatorId,
        operatorName,
        storeId: record.storeId,
        beforeData: beforeRecordData,
        afterData: record.toJSON(),
        remark: '取消维保',
        req
      });

      if (equipment && beforeEquipmentData) {
        await OperationLogService.create({
          module: OperationModule.EQUIPMENT,
          type: OperationType.STATUS_CHANGE,
          targetId: equipment.id,
          targetName: equipment.name,
          operatorId,
          operatorName,
          storeId: equipment.storeId,
          beforeData: beforeEquipmentData,
          afterData: equipment.toJSON(),
          remark: '维保取消，装备入库',
          req
        });
      }

      await transaction.commit();
      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getById(id: number): Promise<MaintenanceRecord | null> {
    return await MaintenanceRecord.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' }
      ]
    });
  }

  static async getList(params: MaintenanceQueryParams, userRole?: AdminRole, userStoreId?: number): Promise<PageResult<MaintenanceRecord>> {
    const { page, pageSize, recordNo, equipmentId, storeId, type, status, startDate, endDate } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (userRole !== AdminRole.SUPER_ADMIN && userStoreId) {
      where.storeId = userStoreId;
    } else if (storeId) {
      where.storeId = storeId;
    }

    if (recordNo) where.recordNo = { [Op.like]: `%${recordNo}%` };
    if (equipmentId) where.equipmentId = equipmentId;
    if (type) where.type = type;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await MaintenanceRecord.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        { model: Equipment, as: 'equipment' }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  static async getEquipmentMaintenanceHistory(equipmentId: number): Promise<MaintenanceRecord[]> {
    return await MaintenanceRecord.findAll({
      where: { equipmentId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getStats(params: { storeId?: number; startDate?: Date; endDate?: Date }): Promise<{
    totalRecords: number;
    pendingCount: number;
    inProgressCount: number;
    completedCount: number;
    cancelledCount: number;
    totalCost: number;
    averageCost: number;
  }> {
    const { storeId, startDate, endDate } = params;

    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const [totalRecords, pendingCount, inProgressCount, completedCount, cancelledCount] = await Promise.all([
      MaintenanceRecord.count({ where }),
      MaintenanceRecord.count({ where: { ...where, status: MaintenanceStatus.PENDING } }),
      MaintenanceRecord.count({ where: { ...where, status: MaintenanceStatus.IN_PROGRESS } }),
      MaintenanceRecord.count({ where: { ...where, status: MaintenanceStatus.COMPLETED } }),
      MaintenanceRecord.count({ where: { ...where, status: MaintenanceStatus.CANCELLED } })
    ]);

    const completedRecords = await MaintenanceRecord.findAll({
      where: { ...where, status: MaintenanceStatus.COMPLETED },
      attributes: ['actualCost']
    });

    const totalCost = completedRecords.reduce((sum, record) => sum + (record.actualCost || 0), 0);
    const averageCost = completedCount > 0 ? totalCost / completedCount : 0;

    return {
      totalRecords,
      pendingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalCost,
      averageCost
    };
  }
}
