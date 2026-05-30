import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';

interface LogOptions {
  module: string;
  operation: string;
}

export const operationLogMiddleware = (options: LogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseBody: any;

    res.send = function (this: Response, body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        const status = res.statusCode >= 200 && res.statusCode < 400 ? 1 : 0;

        await OperationLog.create({
          userId: req.user?.id,
          username: req.user?.username,
          module: options.module,
          operation: options.operation,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || req.socket.remoteAddress,
          params: JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params,
          }),
          result: responseBody ? JSON.stringify(responseBody).substring(0, 2000) : undefined,
          status,
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    });

    next();
  };
};
