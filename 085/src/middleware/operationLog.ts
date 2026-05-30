import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';

export const operationLog = (module: string, operation: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;

    let responseBody: any;

    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const status = res.statusCode >= 200 && res.statusCode < 400;

      try {
        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username,
          module,
          operation,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || req.socket.remoteAddress,
          params: JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params
          }),
          result: responseBody ? JSON.stringify(responseBody).substring(0, 1000) : undefined,
          status,
          errorMessage: !status && responseBody ? responseBody.message : undefined,
          duration
        });
      } catch (error) {
        console.error('Failed to create operation log:', error);
      }
    });

    next();
  };
};
