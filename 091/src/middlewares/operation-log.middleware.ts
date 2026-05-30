import { Response, NextFunction } from 'express';
import OperationLog, { OperationType } from '../models/operation-log.model';
import { AuthRequest } from './auth.middleware';
import logger from '../config/logger';

interface LogOptions {
  module: string;
  operation: OperationType;
  description?: string;
}

export const operationLogMiddleware = (options: LogOptions) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const startTime = Date.now();

    const originalSend = res.send;
    let responseData = '';

    res.send = function (body: any) {
      responseData = typeof body === 'string' ? body : JSON.stringify(body);
      return originalSend.call(this, body);
    };

    const saveLog = async (isSuccess: boolean, errorMessage?: string) => {
      try {
        const duration = Date.now() - startTime;
        await OperationLog.create({
          userId: req.user?.id,
          username: req.user?.username,
          module: options.module,
          operation: options.operation,
          description: options.description || `${req.method} ${req.path}`,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          requestParams: JSON.stringify({
            query: req.query,
            body: req.body,
            params: req.params,
          }),
          responseData: responseData.substring(0, 2000),
          duration,
          isSuccess,
          errorMessage,
        });
      } catch (error) {
        logger.error('保存操作日志失败:', error);
      }
    };

    res.on('finish', () => {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      saveLog(isSuccess, !isSuccess ? `HTTP ${res.statusCode}` : undefined);
    });

    res.on('close', () => {
      if (!res.writableFinished) {
        saveLog(false, '连接被中断');
      }
    });

    next();
  };
};
