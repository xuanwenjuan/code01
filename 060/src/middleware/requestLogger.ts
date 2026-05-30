import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip, body, query } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    logger.info(`[${method}] ${path} ${statusCode} - ${duration}ms`, {
      ip,
      method,
      path,
      statusCode,
      duration,
      query,
      body: method !== 'GET' ? body : undefined,
    });
  });

  next();
};
