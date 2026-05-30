import OperationLog from '../models/OperationLog';
import { OperationType, OperationModule } from '../types';
import { Op } from 'sequelize';
import User from '../models/User';

interface CreateOperationLogParams {
  module: OperationModule;
  operationType: OperationType;
  recordId: number;
  operatorId?: number;
  previousData?: any;
  newData?: any;
  changes?: string[];
  ipAddress?: string;
  userAgent?: string;
  remarks?: string;
}

export class OperationLogService {
  static async create(params: CreateOperationLogParams): Promise<OperationLog> {
    return await OperationLog.create({
      module: params.module,
      operationType: params.operationType,
      recordId: params.recordId,
      operatorId: params.operatorId,
      previousData: params.previousData,
      newData: params.newData,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      remarks: params.remarks,
    });
  }

  static async getList(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      module?: OperationModule;
      operationType?: OperationType;
      operatorId?: number;
      recordId?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ list: OperationLog[]; total: number }> {
    const where: any = {};

    if (filters) {
      if (filters.module) {
        where.module = filters.module;
      }
      if (filters.operationType) {
        where.operationType = filters.operationType;
      }
      if (filters.operatorId) {
        where.operatorId = filters.operatorId;
      }
      if (filters.recordId) {
        where.recordId = filters.recordId;
      }
      if (filters.startDate && filters.endDate) {
        where.createdAt = { [Op.between]: [filters.startDate, filters.endDate] };
      } else if (filters.startDate) {
        where.createdAt = { [Op.gte]: filters.startDate };
      } else if (filters.endDate) {
        where.createdAt = { [Op.lte]: filters.endDate };
      }
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
    });

    return { list: rows, total: count };
  }

  static async getById(id: number): Promise<OperationLog | null> {
    return await OperationLog.findByPk(id, {
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
    });
  }

  static async getRecordLogs(
    module: OperationModule,
    recordId: number,
    limit: number = 50
  ): Promise<OperationLog[]> {
    return await OperationLog.findAll({
      where: { module, recordId },
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'operator', attributes: ['id', 'username', 'realName'] }],
    });
  }

  static async logCategoryOperation(
    operationType: OperationType,
    recordId: number,
    operatorId?: number,
    previousData?: any,
    newData?: any,
    changes?: string[],
    remarks?: string
  ): Promise<OperationLog> {
    return await this.create({
      module: OperationModule.CATEGORY,
      operationType,
      recordId,
      operatorId,
      previousData,
      newData,
      changes,
      remarks,
    });
  }

  static async logMaterialOperation(
    operationType: OperationType,
    recordId: number,
    operatorId?: number,
    previousData?: any,
    newData?: any,
    changes?: string[],
    remarks?: string
  ): Promise<OperationLog> {
    return await this.create({
      module: OperationModule.MATERIAL,
      operationType,
      recordId,
      operatorId,
      previousData,
      newData,
      changes,
      remarks,
    });
  }

  static async logOrderOperation(
    operationType: OperationType,
    recordId: number,
    operatorId?: number,
    previousData?: any,
    newData?: any,
    changes?: string[],
    remarks?: string
  ): Promise<OperationLog> {
    return await this.create({
      module: OperationModule.ORDER,
      operationType,
      recordId,
      operatorId,
      previousData,
      newData,
      changes,
      remarks,
    });
  }

  static async logCostReportOperation(
    operationType: OperationType,
    recordId: number,
    operatorId?: number,
    previousData?: any,
    newData?: any,
    changes?: string[],
    remarks?: string
  ): Promise<OperationLog> {
    return await this.create({
      module: OperationModule.COST_REPORT,
      operationType,
      recordId,
      operatorId,
      previousData,
      newData,
      changes,
      remarks,
    });
  }
}
