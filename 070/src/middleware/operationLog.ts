import { Response } from 'express';
import { OperationLog } from '../models';
import { AuthRequest } from './auth';
import logger from '../utils/logger';

export const logOperation = (module: string, operation: string) => {
  return async (req: AuthRequest, res: Response, next: any) => {
    const startTime = Date.now();
    const originalJson = res.json;

    let responseData: any = null;

    res.json = function (data: any) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        
        await OperationLog.create({
          userId: req.user?.id,
          username: req.user?.username,
          module,
          operation,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || req.socket.remoteAddress,
          userAgent: req.get('User-Agent'),
          params: {
            query: req.query,
            body: req.body,
            params: req.params,
          },
          result: responseData ? { code: responseData.code, message: responseData.message } : null,
          status: res.statusCode >= 200 && res.statusCode < 300,
          errorMessage: responseData && responseData.code >= 400 ? responseData.message : null,
          duration,
        });
      } catch (error) {
        logger.error('记录操作日志失败:', error);
      }
    });

    next();
  };
};
