import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';

interface LogConfig {
  module: string;
  operation: string;
}

const logConfigs: Map<string, LogConfig> = new Map();

export const registerLogConfig = (path: string, method: string, config: LogConfig) => {
  const key = `${method.toUpperCase()}:${path}`;
  logConfigs.set(key, config);
};

export const operationLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseBody = '';

  res.send = function(this: Response, body: any): Response {
    responseBody = typeof body === 'string' ? body : JSON.stringify(body);
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const key = `${req.method.toUpperCase()}:${req.route?.path || req.path}`;
      const config = logConfigs.get(key) || { module: 'other', operation: req.method };

      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        module: config.module,
        operation: config.operation,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.socket.remoteAddress,
        params: JSON.stringify(req.params) || undefined,
        body: JSON.stringify(req.body) || undefined,
        response: responseBody,
        statusCode: res.statusCode,
        duration,
        success: res.statusCode >= 200 && res.statusCode < 300,
        errorMessage: res.statusCode >= 400 ? responseBody : undefined
      });
    } catch (error) {
      console.error('保存操作日志失败:', error);
    }
  });

  next();
};
