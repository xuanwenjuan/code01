
import { Request } from 'express';
import { OperationLog } from '../models';
import { OperationLogData, OperationModule, OperationType, JwtPayload } from '../types';

export class OperationLogService {
  private static getRequestInfo(req: Request) {
    return {
      ip: req.ip || 
        (req.socket?.remoteAddress) || 
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim(),
      userAgent: req.headers['user-agent']
    };
  }

  static async createLog(logData: OperationLogData): Promise<void> {
    try {
      await OperationLog.create({
        userId: logData.userId,
        username: logData.username,
        realName: logData.realName,
        module: logData.module,
        operation: logData.operation,
        description: logData.description,
        ip: logData.ip,
        userAgent: logData.userAgent,
        requestParams: logData.requestParams ? JSON.stringify(logData.requestParams) : undefined,
        responseData: logData.responseData ? JSON.stringify(logData.responseData) : undefined,
        status: logData.status,
        errorMessage: logData.errorMessage
      });
    } catch (error) {
      console.error('创建操作日志失败:', error);
    }
  }

  static async logAssetOperation(
    req: Request,
    operation: OperationType,
    assetId: number,
    assetName: string,
    description: string,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const user = req.user as JwtPayload;
    const requestInfo = this.getRequestInfo(req);

    await this.createLog({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      module: OperationModule.ASSET,
      operation,
      description: `资产[${assetName}(${assetId})]${description}`,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      requestParams: {
        body: req.body,
        params: req.params,
        query: req.query
      },
      status,
      errorMessage
    });
  }

  static async logApplicationOperation(
    req: Request,
    operation: OperationType,
    applicationId: number,
    applicationNo: string,
    description: string,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const user = req.user as JwtPayload;
    const requestInfo = this.getRequestInfo(req);

    await this.createLog({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      module: OperationModule.APPLICATION,
      operation,
      description: `申请单[${applicationNo}(${applicationId})]${description}`,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      requestParams: {
        body: req.body,
        params: req.params,
        query: req.query
      },
      status,
      errorMessage
    });
  }

  static async logInventoryOperation(
    req: Request,
    operation: OperationType,
    inventoryId: number,
    inventoryNo: string,
    description: string,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const user = req.user as JwtPayload;
    const requestInfo = this.getRequestInfo(req);

    await this.createLog({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      module: OperationModule.INVENTORY,
      operation,
      description: `盘点单[${inventoryNo}(${inventoryId})]${description}`,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      requestParams: {
        body: req.body,
        params: req.params,
        query: req.query
      },
      status,
      errorMessage
    });
  }

  static async logCategoryOperation(
    req: Request,
    operation: OperationType,
    categoryId: number,
    categoryName: string,
    description: string,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const user = req.user as JwtPayload;
    const requestInfo = this.getRequestInfo(req);

    await this.createLog({
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      module: OperationModule.CATEGORY,
      operation,
      description: `分类[${categoryName}(${categoryId})]${description}`,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      requestParams: {
        body: req.body,
        params: req.params,
        query: req.query
      },
      status,
      errorMessage
    });
  }

  static async logAuthOperation(
    req: Request,
    operation: OperationType,
    userId: number,
    username: string,
    description: string,
    status: 'success' | 'failed' = 'success',
    errorMessage?: string
  ): Promise<void> {
    const requestInfo = this.getRequestInfo(req);

    await this.createLog({
      userId,
      username,
      realName: username,
      module: OperationModule.AUTH,
      operation,
      description: `用户[${username}(${userId})]${description}`,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      requestParams: {
        body: req.body
      },
      status,
      errorMessage
    });
  }

  static async getOperationLogs(
    filters: {
      module?: OperationModule;
      operation?: OperationType;
      userId?: number;
      startDate?: Date;
      endDate?: Date;
      status?: 'success' | 'failed';
    },
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ list: any[]; total: number }> {
    const where: any = {};
    
    if (filters.module) where.module = filters.module;
    if (filters.operation) where.operation = filters.operation;
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Symbol.for('between')]: [filters.startDate, filters.endDate]
      };
    }

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count
    };
  }
}

export default OperationLogService;
