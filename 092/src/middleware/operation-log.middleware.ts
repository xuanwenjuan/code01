import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/operation-log.model';

interface OperationLogOptions {
  module: string;
  operation: string;
}

export const operationLogMiddleware = (options: OperationLogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseStatus = 200;

    res.send = function (this: Response, ...args: any[]) {
      responseStatus = this.statusCode;
      return originalSend.apply(this, args);
    };

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const status = responseStatus;

      try {
        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username,
          module: options.module,
          operation: options.operation,
          method: req.method,
          params: JSON.stringify({
            query: req.query,
            body: req.body,
            params: req.params,
          }),
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          duration,
          status,
        });
      } catch (error) {
        console.error('创建操作日志失败:', error);
      }
    });

    next();
  };
};