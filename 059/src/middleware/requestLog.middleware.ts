import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip, body, query } = req;

  logger.info(`[${method}] ${path} - IP: ${ip}`, {
    query,
    body: method !== 'GET' ? body : undefined
  });

  const originalSend = res.send;
  res.send = function(this: Response, ...args: any[]) {
    const duration = Date.now() - startTime;
    logger.info(`[${method}] ${path} - 响应时间: ${duration}ms - 状态码: ${res.statusCode}`);
    return originalSend.apply(this, args);
  };

  next();
};
