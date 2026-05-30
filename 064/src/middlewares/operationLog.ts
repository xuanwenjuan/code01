import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';

export const operationLogMiddleware = (module: string, operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    let responseBody: any;
    
    res.send = function(this: Response, body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const ip = req.ip || req.connection.remoteAddress || '';
        
        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username,
          module,
          operation,
          method: req.method,
          url: req.originalUrl,
          ip,
          params: JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params
          }),
          result: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody),
          status: res.statusCode >= 200 && res.statusCode < 400,
          duration
        });
      } catch (error) {
        console.error('记录操作日志失败:', error);
      }
    });

    next();
  };
};
