import { OperationLog } from '../models';
import { OperationModule, OperationType } from '../types';
import { Request } from 'express';
import logger from '../utils/logger';

class OperationLogService {
  async createLog(options: {
    req?: Request;
    userId?: number;
    username?: string;
    module: OperationModule;
    operation: OperationType;
    targetId?: number;
    targetType?: string;
    beforeData?: any;
    afterData?: any;
    result?: string;
    status?: 'success' | 'fail';
    errorMessage?: string;
    duration?: number;
  }) {
    try {
      const { req, userId, username, module, operation, targetId, targetType, beforeData, afterData, result, status = 'success', errorMessage, duration } = options;

      const logData: any = {
        userId,
        username,
        module,
        operation,
        targetId,
        targetType,
        status,
        errorMessage,
        duration,
        result: result ? JSON.stringify(result).substring(0, 1000) : undefined,
        beforeData: beforeData ? JSON.stringify(beforeData).substring(0, 2000) : undefined,
        afterData: afterData ? JSON.stringify(afterData).substring(0, 2000) : undefined
      };

      if (req) {
        logData.method = req.method;
        logData.url = req.originalUrl;
        logData.ip = req.ip || req.connection.remoteAddress;
        logData.params = JSON.stringify({
          body: req.body,
          query: req.query,
          params: req.params
        }).substring(0, 2000);
      }

      await OperationLog.create(logData);
    } catch (error) {
      logger.error('创建操作日志失败:', error);
    }
  }

  async logCreate(module: OperationModule, targetId: number, afterData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.CREATE,
      targetId,
      targetType: module,
      afterData
    });
  }

  async logUpdate(module: OperationModule, targetId: number, beforeData: any, afterData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.UPDATE,
      targetId,
      targetType: module,
      beforeData,
      afterData
    });
  }

  async logDelete(module: OperationModule, targetId: number, beforeData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.DELETE,
      targetId,
      targetType: module,
      beforeData
    });
  }

  async logAssign(module: OperationModule, targetId: number, beforeData: any, afterData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.ASSIGN,
      targetId,
      targetType: module,
      beforeData,
      afterData
    });
  }

  async logSubmit(module: OperationModule, targetId: number, beforeData: any, afterData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.SUBMIT,
      targetId,
      targetType: module,
      beforeData,
      afterData
    });
  }

  async logLock(module: OperationModule, targetId: number, beforeData: any, afterData: any, req?: Request) {
    await this.createLog({
      req,
      userId: req?.user?.userId,
      username: req?.user?.username,
      module,
      operation: OperationType.LOCK,
      targetId,
      targetType: module,
      beforeData,
      afterData
    });
  }

  async getLogs(params: {
    module?: OperationModule;
    operation?: OperationType;
    userId?: number;
    targetId?: number;
    targetType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { module, operation, userId, targetId, targetType, startDate, endDate, page = 1, pageSize = 20 } = params;
    const where: any = {};

    if (module) where.module = module;
    if (operation) where.operation = operation;
    if (userId) where.userId = userId;
    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;
    if (startDate && endDate) {
      where.createdAt = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
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
