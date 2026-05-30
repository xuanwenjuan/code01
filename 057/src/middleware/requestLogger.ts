import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip, body, query } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    const logMessage = `[${method}] ${path} - ${statusCode} - ${duration}ms - IP: ${ip}`;
    
    if (statusCode >= 400) {
      logger.error(logMessage, { body, query });
    } else {
      logger.info(logMessage);
    }
  });

  next();
};
