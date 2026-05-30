import OperationLog from '../models/OperationLog';
import { OperationType } from '../types';
import { Op } from 'sequelize';

class OperationLogService {
  async createLog(params: {
    userId: number;
    username: string;
    module: string;
    operation: OperationType;
    method?: string;
    params?: string;
    ip?: string;
    status: number;
    errorMsg?: string;
  }) {
    return OperationLog.create({
      ...params,
      time: 0
    });
  }

  async getList(params: {
    userId?: number;
    module?: string;
    operation?: OperationType;
    status?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    
    if (params.userId) {
      where.userId = params.userId;
    }
    if (params.module) {
      where.module = params.module;
    }
    if (params.operation) {
      where.operation = params.operation;
    }
    if (params.status !== undefined) {
      where.status = params.status;
    }
    if (params.startDate && params.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)]
      };
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize)
      }
    };
  }

  async getById(id: number) {
    return OperationLog.findByPk(id);
  }
}

export default new OperationLogService();
