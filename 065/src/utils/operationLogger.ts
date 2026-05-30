import { Request } from 'express';
import { OperationLog } from '../models';
import { LogModule, OperationType, UserRole } from '../types';

export class OperationLogger {
  static async log(
    module: LogModule,
    operationType: OperationType,
    req: Request,
    options: {
      targetId?: number;
      targetType?: string;
      detail?: string;
      success?: boolean;
      errorMessage?: string;
    } = {}
  ) {
    try {
      const user = (req as any).user;
      await OperationLog.create({
        module,
        operationType,
        operatorId: user?.userId,
        operatorRole: user?.role as UserRole,
        operatorName: user?.username,
        targetId: options.targetId,
        targetType: options.targetType,
        detail: options.detail,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: options.success ?? true,
        errorMessage: options.errorMessage,
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  }

  static async logAuth(
    operationType: OperationType,
    req: Request,
    success: boolean,
    errorMessage?: string
  ) {
    await this.log(LogModule.AUTH, operationType, req, {
      success,
      errorMessage,
    });
  }

  static async logOrder(
    operationType: OperationType,
    req: Request,
    orderId: number,
    detail?: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    await this.log(LogModule.ORDER, operationType, req, {
      targetId: orderId,
      targetType: 'Order',
      detail,
      success,
      errorMessage,
    });
  }

  static async logSettlement(
    operationType: OperationType,
    req: Request,
    settlementId: number,
    detail?: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    await this.log(LogModule.SETTLEMENT, operationType, req, {
      targetId: settlementId,
      targetType: 'Settlement',
      detail,
      success,
      errorMessage,
    });
  }

  static async logAunt(
    operationType: OperationType,
    req: Request,
    auntId: number,
    detail?: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    await this.log(LogModule.AUNT, operationType, req, {
      targetId: auntId,
      targetType: 'AuntProfile',
      detail,
      success,
      errorMessage,
    });
  }

  static async logCategory(
    operationType: OperationType,
    req: Request,
    categoryId: number,
    detail?: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    await this.log(LogModule.CATEGORY, operationType, req, {
      targetId: categoryId,
      targetType: 'ServiceCategory',
      detail,
      success,
      errorMessage,
    });
  }

  static async logSystem(
    operationType: OperationType,
    detail: string,
    success: boolean = true,
    errorMessage?: string
  ) {
    try {
      await OperationLog.create({
        module: LogModule.SYSTEM,
        operationType,
        detail,
        success,
        errorMessage,
      });
    } catch (error) {
      console.error('记录系统日志失败:', error);
    }
  }
}
