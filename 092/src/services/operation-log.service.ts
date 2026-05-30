import { OperationLog } from '../models';
import { OperationLogData, JwtPayload } from '../types';
import sequelize from '../config/database';

export class OperationLogService {
  static async createLog(
    user: JwtPayload,
    logData: OperationLogData,
    ip?: string
  ): Promise<void> {
    await OperationLog.create({
      userId: user.userId,
      username: user.username,
      module: logData.module,
      operation: logData.operation,
      recordId: logData.recordId,
      beforeData: logData.beforeData ? JSON.stringify(logData.beforeData) : null,
      afterData: logData.afterData ? JSON.stringify(logData.afterData) : null,
      changes: logData.changes ? logData.changes.join(', ') : null,
      ip: ip || '127.0.0.1',
    });
  }

  static async createLogWithTransaction(
    user: JwtPayload,
    logData: OperationLogData,
    transaction: any,
    ip?: string
  ): Promise<void> {
    await OperationLog.create(
      {
        userId: user.userId,
        username: user.username,
        module: logData.module,
        operation: logData.operation,
        recordId: logData.recordId,
        beforeData: logData.beforeData ? JSON.stringify(logData.beforeData) : null,
        afterData: logData.afterData ? JSON.stringify(logData.afterData) : null,
        changes: logData.changes ? logData.changes.join(', ') : null,
        ip: ip || '127.0.0.1',
      },
      { transaction }
    );
  }

  static async getLogs(
    params: {
      module?: string;
      operation?: string;
      userId?: number;
      startDate?: string;
      endDate?: string;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{ list: any[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};
    if (filters.module) where.module = filters.module;
    if (filters.operation) where.operation = filters.operation;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [sequelize.Sequelize.Op.between]: [
          new Date(filters.startDate),
          new Date(filters.endDate + ' 23:59:59'),
        ],
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return { list: rows, total: count };
  }
}