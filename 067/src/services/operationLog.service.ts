import { OperationLog } from '../models';
import { UserRole, OperationLogFilterParams } from '../types';
import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';
import logger from '../config/logger';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  START_CHARGING = 'start_charging',
  END_CHARGING = 'end_charging',
  PAUSE_CHARGING = 'pause_charging',
  RESUME_CHARGING = 'resume_charging',
  CANCEL_ORDER = 'cancel_order',
  REPORT_FAULT = 'report_fault',
  START_MAINTENANCE = 'start_maintenance',
  COMPLETE_MAINTENANCE = 'complete_maintenance',
  CONFIRM_SETTLEMENT = 'confirm_settlement',
  BATCH_CONFIRM_SETTLEMENT = 'batch_confirm_settlement',
  BATCH_DELETE_PILE = 'batch_delete_pile',
  HANDLE_ABNORMAL = 'handle_abnormal',
  USER_BALANCE_UPDATE = 'user_balance_update',
}

export class OperationLogService {
  async createLog(
    data: {
      userId?: number;
      username?: string;
      role?: UserRole;
      method: string;
      path: string;
      ip?: string;
      params?: Record<string, any>;
      query?: Record<string, any>;
      body?: Record<string, any>;
      statusCode?: number;
      duration?: number;
      operationType?: OperationType;
      description?: string;
    },
    transaction?: Transaction
  ) {
    try {
      const log = await OperationLog.create(
        {
          userId: data.userId,
          username: data.username,
          role: data.role,
          method: data.method,
          path: data.path,
          ip: data.ip,
          params: data.params ? JSON.stringify(data.params) : null,
          query: data.query ? JSON.stringify(data.query) : null,
          body: data.body ? JSON.stringify(data.body) : null,
          statusCode: data.statusCode,
          duration: data.duration,
          operationType: data.operationType,
          description: data.description,
        },
        { transaction }
      );

      return log;
    } catch (error) {
      logger.error('保存操作日志失败:', error);
    }
  }

  async getList(params: OperationLogFilterParams) {
    const {
      page = 1,
      pageSize = 10,
      userId,
      role,
      operationType,
      method,
      startDate,
      endDate,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (role) {
      where.role = role;
    }

    if (operationType) {
      where.operationType = operationType;
    }

    if (method) {
      where.method = method;
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    if (keyword) {
      where[Op.or] = [
        { path: { [Op.like]: `%${keyword}%` } },
        { username: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const order: [string, string][] = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order,
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getById(id: number) {
    return OperationLog.findByPk(id);
  }

  async getStatistics(params: {
    startDate?: string;
    endDate?: string;
    userId?: number;
  }) {
    const { startDate, endDate, userId } = params;

    const where: any = {};

    if (startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        [Op.lte]: new Date(endDate + ' 23:59:59'),
      };
    }

    if (userId) {
      where.userId = userId;
    }

    const totalCount = await OperationLog.count({ where });

    const typeStats = await OperationLog.findAll({
      where,
      attributes: [
        'operationType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['operationType'],
      raw: true,
    });

    const userStats = await OperationLog.findAll({
      where,
      attributes: [
        'userId',
        'username',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['userId', 'username'],
      limit: 10,
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true,
    });

    return {
      totalCount,
      typeStats,
      userStats,
    };
  }
}

export default new OperationLogService();
