import { Request, Response, NextFunction } from 'express';
import OperationLog, { OperationType } from '../models/OperationLog';
import { AuthRequest } from './auth';

const getOperationType = (method: string): OperationType => {
  switch (method.toUpperCase()) {
    case 'POST':
      return OperationType.CREATE;
    case 'PUT':
    case 'PATCH':
      return OperationType.UPDATE;
    case 'DELETE':
      return OperationType.DELETE;
    case 'GET':
      return OperationType.QUERY;
    default:
      return OperationType.QUERY;
  }
};

const getModuleName = (url: string): string => {
  const parts = url.split('/').filter(p => p && !p.match(/^\d+$/));
  return parts[0] || 'unknown';
};

export const operationLogMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseData = '';

  res.send = function (data: any) {
    responseData = typeof data === 'string' ? data : JSON.stringify(data);
    return originalSend.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const executionTime = Date.now() - startTime;
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 1 : 0;

      await OperationLog.create({
        userId: req.user?.id,
        username: req.user?.username,
        module: getModuleName(req.path),
        operation: getOperationType(req.method),
        method: req.method,
        requestUrl: req.originalUrl,
        requestParams: JSON.stringify({
          body: req.body,
          query: req.query,
          params: req.params
        }),
        responseData: responseData.substring(0, 2000),
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('User-Agent'),
        status,
        errorMessage: status === 0 ? '请求失败' : null,
        executionTime
      });
    } catch (error) {
      console.error('保存操作日志失败:', error);
    }
  });

  next();
};
