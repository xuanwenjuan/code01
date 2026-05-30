import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const operationLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function(this: Response, body: any): Response {
    const duration = Date.now() - startTime;
    const responseBody = typeof body === 'string' ? body : JSON.stringify(body);

    Logger.info('操作日志', {
      method: req.method,
      path: req.path,
      ip: req.ip || req.connection.remoteAddress,
      user: req.user?.username || 'anonymous',
      userId: req.user?.id,
      query: req.query,
      params: req.params,
      body: req.method !== 'GET' ? req.body : undefined,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      response: responseBody.substring(0, 500)
    });

    return originalSend.call(this, body);
  };

  next();
};
