import OperationLog from '../models/OperationLog.model';
import { OperationLogData } from '../types';
import { v4 as uuidv4 } from 'uuid';

class OperationLogService {
  async createLog(data: OperationLogData): Promise<OperationLog> {
    return await OperationLog.create(data);
  }

  async logOperation(
    module: string,
    operation: string,
    method: string,
    userId?: number,
    username?: string,
    params?: any,
    ip?: string,
    userAgent?: string
  ): Promise<{ startTime: number; logId: string }> {
    const startTime = Date.now();
    const logId = uuidv4();
    return { startTime, logId };
  }

  async completeLog(
    startTime: number,
    module: string,
    operation: string,
    method: string,
    status: number,
    userId?: number,
    username?: string,
    params?: any,
    ip?: string,
    userAgent?: string,
    errorMsg?: string
  ): Promise<void> {
    const duration = Date.now() - startTime;
    await this.createLog({
      userId,
      username,
      module,
      operation,
      method,
      params: params ? JSON.stringify(params) : undefined,
      ip,
      userAgent,
      status,
      errorMsg,
      duration
    });
  }

  async getLogList(params: {
    page?: number;
    pageSize?: number;
    module?: string;
    operation?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ list: OperationLog[]; total: number; page: number; pageSize: number }> {
    const { page = 1, pageSize = 10, module, operation, userId, startDate, endDate } = params;
    const where: any = {};

    if (module) {
      where.module = module;
    }
    if (operation) {
      where.operation = operation;
    }
    if (userId) {
      where.userId = userId;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.$lte = new Date(endDate);
      }
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }
}

export default new OperationLogService();
