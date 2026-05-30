import OperationLog, { OperationLogAttributes } from '../models/OperationLog';
import { Op } from 'sequelize';

class OperationLogService {
  async createLog(data: Omit<OperationLogAttributes, 'id' | 'createdAt'>) {
    return OperationLog.create(data);
  }

  async getLogList(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
    module?: string;
    operation?: string;
    method?: string;
    status?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, userId, module, operation, method, status, startDate, endDate } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (module) where.module = module;
    if (operation) where.operation = operation;
    if (method) where.method = method;
    if (status !== undefined) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async getLogById(id: number) {
    return OperationLog.findByPk(id);
  }
}

export default new OperationLogService();
