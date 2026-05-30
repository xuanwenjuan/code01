import { OperationLog } from '../models/operationLog.model';
import { Op } from 'sequelize';

export class OperationLogService {
  async logOperation(data: {
    module: string;
    operation: string;
    targetId?: number;
    beforeData?: any;
    afterData?: any;
    operatorId: number;
    operatorName?: string;
    remark?: string;
  }) {
    return await OperationLog.create({
      module: data.module,
      operation: data.operation,
      targetId: data.targetId,
      beforeData: data.beforeData ? JSON.stringify(data.beforeData) : undefined,
      afterData: data.afterData ? JSON.stringify(data.afterData) : undefined,
      operatorId: data.operatorId,
      operatorName: data.operatorName,
      remark: data.remark,
    });
  }

  async getLogList(params: {
    page?: number;
    pageSize?: number;
    module?: string;
    operation?: string;
    operatorId?: number;
    targetId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, module, operation, operatorId, targetId, startDate, endDate } = params;
    const where: any = {};

    if (module) {
      where.module = module;
    }
    if (operation) {
      where.operation = operation;
    }
    if (operatorId) {
      where.operatorId = operatorId;
    }
    if (targetId) {
      where.targetId = targetId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }
}

export const operationLogService = new OperationLogService();
