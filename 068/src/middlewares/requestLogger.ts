import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const { method, path, ip, query, body } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    const logData = {
      method,
      path,
      ip,
      statusCode,
      duration: `${duration}ms`,
      query: Object.keys(query).length ? query : undefined,
      body: Object.keys(body).length ? { ...body, password: undefined } : undefined,
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${method} ${path} ${statusCode} - ${duration}ms`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${path} ${statusCode} - ${duration}ms`, logData);
    } else {
      logger.info(`HTTP ${method} ${path} ${statusCode} - ${duration}ms`, logData);
    }
  });

  next();
};
