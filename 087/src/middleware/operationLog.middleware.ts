import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';
import logger from '../utils/logger';

export const operationLogger = (module: string, operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const userId = req.user?.userId;
    const username = req.user?.username;
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;
    const params = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params
    });

    const originalSend = res.send;
    let resultData: any;

    res.send = function(this: Response, data: any): Response {
      resultData = data;
      return originalSend.call(this, data);
    };

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'fail';
      
      try {
        await OperationLog.create({
          userId,
          username,
          module,
          operation,
          method,
          url,
          ip,
          params,
          result: resultData ? JSON.stringify(resultData).substring(0, 500) : undefined,
          status,
          duration
        });
      } catch (error) {
        logger.error('保存操作日志失败:', error);
      }
    });

    next();
  };
};
