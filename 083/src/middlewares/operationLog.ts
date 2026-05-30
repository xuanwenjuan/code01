import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';

export const operationLogMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function (this: Response, ...args: any[]) {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.user?.id,
      username: req.user?.username,
      params: req.params,
      query: req.query,
      body: req.body,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    };

    logger.info(`操作日志: ${JSON.stringify(logData)}`);

    return originalSend.apply(this, args);
  };

  next();
};
