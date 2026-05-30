import { Request } from 'express';
import OperationLog from '../models/OperationLog';
import { OperationType } from '../types';
import logger from '../config/logger';

export class OperationLogService {
  static async createLog(
    req: Request,
    module: string,
    operationType: OperationType,
    recordId: number,
    recordCode?: string,
    oldValue?: any,
    newValue?: any,
    remark?: string
  ): Promise<void> {
    try {
      const operatorId = req.user?.userId;
      const operatorName = req.user?.realName || req.user?.username || 'system';
      
      if (!operatorId) {
        logger.warn('无法记录操作日志：用户信息缺失');
        return;
      }

      const ipAddress = this.getClientIp(req);
      const userAgent = req.headers['user-agent'];

      await OperationLog.create({
        operationType,
        module,
        recordId,
        recordCode,
        operatorId,
        operatorName,
        oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
        newValue: newValue ? JSON.stringify(newValue) : undefined,
        remark,
        ipAddress,
        userAgent
      });

      logger.info(`操作日志记录成功: ${module} - ${operationType} - ${recordId}`, {
        operatorId,
        operatorName,
        module,
        operationType,
        recordId
      });
    } catch (error) {
      logger.error('记录操作日志失败:', error);
    }
  }

  private static getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIp = req.headers['x-real-ip'] as string;
    if (realIp) {
      return realIp;
    }
    
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  static async getLogsByModule(
    module: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ rows: OperationLog[]; count: number }> {
    return await OperationLog.findAndCountAll({
      where: { module },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
  }

  static async getLogsByRecord(
    module: string,
    recordId: number
  ): Promise<OperationLog[]> {
    return await OperationLog.findAll({
      where: { module, recordId },
      order: [['createdAt', 'DESC']]
    });
  }

  static async getLogsByOperator(
    operatorId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ rows: OperationLog[]; count: number }> {
    return await OperationLog.findAndCountAll({
      where: { operatorId },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });
  }
}

export default OperationLogService;
