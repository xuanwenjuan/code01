
import { Request } from 'express';
import { OperationLog } from '../models';
import { OperationLogData } from '../types';

export const createOperationLog = async (data: OperationLogData) => {
  try {
    await OperationLog.create({
      userId: data.userId,
      username: data.username,
      module: data.module,
      operation: data.operation,
      ip: data.ip,
      userAgent: data.userAgent
    });
  } catch (error) {
    console.error('创建操作日志失败:', error);
  }
};

export const logOperation = (module: string, operation: string) => {
  return async (req: Request, res: any, next: any) => {
    if (req.user) {
      await createOperationLog({
        userId: req.user.userId,
        username: req.user.username,
        module,
        operation: `${operation} - ${req.method} ${req.originalUrl}`,
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }
    next();
  };
};

export const getClientIp = (req: Request): string => {
  return (
    req.ip ||
    req.socket.remoteAddress ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    'unknown'
  );
};
