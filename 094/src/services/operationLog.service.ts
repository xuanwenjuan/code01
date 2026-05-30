import { Request } from 'express';
import { OperationLog } from '../models';
import { LogModule, LogAction } from '../types';

export class OperationLogService {
  static async createLog(
    req: Request,
    module: LogModule,
    action: LogAction,
    operation: string,
    status: boolean = true,
    errorMessage?: string,
    duration?: number,
    responseData?: any
  ): Promise<void> {
    try {
      await OperationLog.create({
        userId: req.user?.id,
        username: req.user?.username,
        operation,
        module,
        action,
        ip: this.getClientIp(req),
        userAgent: req.get('User-Agent'),
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        requestParams: JSON.stringify({
          body: this.sanitizeData(req.body),
          params: req.params,
          query: req.query,
        }),
        responseData: responseData ? JSON.stringify(this.sanitizeData(responseData)) : undefined,
        status,
        errorMessage,
        duration,
      });
    } catch (error) {
      console.error('创建操作日志失败:', error);
    }
  }

  static async logSuccess(
    req: Request,
    module: LogModule,
    action: LogAction,
    operation: string,
    duration?: number,
    responseData?: any
  ): Promise<void> {
    await this.createLog(req, module, action, operation, true, undefined, duration, responseData);
  }

  static async logError(
    req: Request,
    module: LogModule,
    action: LogAction,
    operation: string,
    errorMessage: string,
    duration?: number
  ): Promise<void> {
    await this.createLog(req, module, action, operation, false, errorMessage, duration);
  }

  private static getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0]?.trim() || '';
    }
    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0]?.trim() || '';
    }
    return req.ip || req.socket?.remoteAddress || '';
  }

  private static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'authorization', 'secret'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '***';
      }
    }

    return sanitized;
  }
}
