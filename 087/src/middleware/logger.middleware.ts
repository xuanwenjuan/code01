import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const userId = req.user?.userId || 'anonymous';
    
    logger.info(
      `[${method}] ${path} - ${statusCode} - ${duration}ms - IP: ${ip} - User: ${userId}`
    );
  });

  next();
};
