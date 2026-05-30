import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface RequestLog {
  method: string;
  url: string;
  ip: string | string[] | undefined;
  userAgent: string | undefined;
  statusCode?: number;
  responseTime?: number;
  userId?: number;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestLog: RequestLog = {
    method: req.method,
    url: req.originalUrl,
    ip: req.headers['x-forwarded-for'] || req.ip,
    userAgent: req.get('User-Agent'),
  };

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    requestLog.statusCode = res.statusCode;
    requestLog.responseTime = responseTime;
    
    const user = (req as any).user;
    if (user) {
      requestLog.userId = user.userId;
    }

    const logMessage = `${requestLog.method} ${requestLog.url} - ${requestLog.statusCode} - ${responseTime}ms - IP: ${requestLog.ip}`;
    
    if (requestLog.statusCode >= 500) {
      logger.error(logMessage, requestLog);
    } else if (requestLog.statusCode >= 400) {
      logger.warn(logMessage, requestLog);
    } else {
      logger.info(logMessage, requestLog);
    }
  });

  next();
};
