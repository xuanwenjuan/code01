import { Request, Response, NextFunction } from 'express';
import { OperationLog } from '../models';

export const logOperation = (action: string, module: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const startTime = Date.now();
    
    res.send = function (body) {
      const duration = Date.now() - startTime;
      
      OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        role: req.user?.role,
        storeId: req.user?.storeId,
        action,
        module,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        requestBody: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : null,
        responseBody: typeof body === 'string' ? body : JSON.stringify(body),
        statusCode: res.statusCode,
        duration
      }).catch(err => {
        console.error('操作日志记录失败:', err);
      });

      return originalSend.call(this, body);
    };

    next();
  };
};

export const logCriticalOperation = (action: string, module: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalEnd = res.end;

    res.end = function (data, encoding) {
      const duration = Date.now() - startTime;

      OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        role: req.user?.role,
        storeId: req.user?.storeId,
        action,
        module,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        requestBody: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : null,
        responseBody: typeof data === 'string' ? data : JSON.stringify(data),
        statusCode: res.statusCode,
        duration,
        isCritical: true
      }).catch(err => {
        console.error('关键操作日志记录失败:', err);
      });

      return originalEnd.call(this, data, encoding);
    };

    next();
  };
};

export const createOperationLog = async (
  userId: number | undefined,
  username: string | undefined,
  role: string | undefined,
  storeId: number | undefined,
  action: string,
  module: string,
  details?: string
) => {
  try {
    await OperationLog.create({
      userId,
      username,
      role,
      storeId,
      action,
      module,
      details,
      isCritical: true
    });
  } catch (err) {
    console.error('操作日志记录失败:', err);
  }
};

export const trackChanges = (modelName: string, operation: 'create' | 'update' | 'delete') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = async function (body) {
      try {
        let parsedBody;
        try {
          parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch {
          parsedBody = null;
        }

        const recordId = parsedBody?.data?.id || parsedBody?.id || req.params?.id;

        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username,
          role: req.user?.role,
          storeId: req.user?.storeId,
          action: operation,
          module: modelName,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip,
          requestBody: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : null,
          responseBody: typeof body === 'string' ? body : JSON.stringify(body),
          statusCode: res.statusCode,
          recordId: Number(recordId)
        });
      } catch (err) {
        console.error('变更追踪日志记录失败:', err);
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
