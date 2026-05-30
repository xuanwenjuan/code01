import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';
import logger from '../config/logger';

interface LogOptions {
  module: string;
  operation: string;
}

export const operationLog = (options: LogOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseData: string = '';

    res.send = function(this: Response, body: any): Response {
      responseData = typeof body === 'string' ? body : JSON.stringify(body);
      return originalSend.call(this, body);
    };

    const saveLog = async () => {
      try {
        const duration = Date.now() - startTime;
        const ip = req.ip || req.connection.remoteAddress || '';
        
        await OperationLog.create({
          userId: req.user?.userId || null,
          username: req.user?.username || '',
          module: options.module,
          operation: options.operation,
          method: req.method,
          url: req.originalUrl,
          ip: ip.replace('::ffff:', ''),
          params: JSON.stringify({
            query: req.query,
            body: req.body
          }),
          result: responseData.substring(0, 2000),
          status: res.statusCode < 400 ? 1 : 0,
          duration
        });
      } catch (error) {
        logger.error('保存操作日志失败:', error);
      }
    };

    res.on('finish', saveLog);
    next();
  };
};
