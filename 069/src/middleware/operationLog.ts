import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { Logger } from '../utils/logger';
import OperationLog from '../models/OperationLog';

export const operationLog = (module: string, operation: string, sensitiveFields: string[] = ['password', 'token', 'secret']) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalSend = res.send;
    let responseBody: any;

    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      
      const sanitizeSensitiveData = (data: any): any => {
        if (!data) return data;
        if (typeof data === 'object') {
          const sanitized = { ...data };
          sensitiveFields.forEach(field => {
            if (sanitized[field]) sanitized[field] = '***';
          });
          return sanitized;
        }
        return data;
      };

      const sanitizedBody = sanitizeSensitiveData(req.body);
      const sanitizedQuery = sanitizeSensitiveData(req.query);

      const logData = {
        module,
        operation,
        userId: req.user?.id,
        username: req.user?.username,
        method: req.method,
        path: req.path,
        params: JSON.stringify(req.params),
        query: JSON.stringify(sanitizedQuery),
        body: JSON.stringify(sanitizedBody),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress
      };

      Logger.info(`[${module}] ${operation}`, logData);

      try {
        await OperationLog.create(logData);
      } catch (error) {
        Logger.error('Failed to save operation log', error);
      }
    });

    next();
  };
};

export const logOperation = async (
  module: string,
  operation: string,
  data: {
    userId?: number;
    username?: string;
    description: string;
    details?: any;
    ip?: string;
  }
) => {
  try {
    await OperationLog.create({
      module,
      operation,
      userId: data.userId,
      username: data.username,
      method: 'SYSTEM',
      path: data.description,
      params: JSON.stringify(data.details || {}),
      statusCode: 200,
      duration: '0ms',
      ip: data.ip
    });
    Logger.info(`[${module}] ${operation}`, data);
  } catch (error) {
    Logger.error('Failed to save operation log', error);
  }
};
