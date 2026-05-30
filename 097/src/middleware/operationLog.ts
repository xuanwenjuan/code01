import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import OperationLog from '../models/OperationLog';

export const operationLogMiddleware = (module: string, operation: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        await OperationLog.create({
          userId: req.user?.id,
          username: req.user?.username,
          module,
          operation,
          method: req.method,
          url: req.path,
          params: JSON.stringify(req.params),
          body: JSON.stringify(req.body),
          ip: req.ip || req.connection.remoteAddress,
          status: res.statusCode,
          response: responseBody ? JSON.stringify(responseBody).substring(0, 1000) : null
        });
      } catch (error) {
        console.error('操作日志记录失败:', error);
      }
    });

    next();
  };
};
