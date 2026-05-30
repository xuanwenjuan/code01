import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { OperationLog } from '../models/OperationLog';

export const operationLogMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (this: Response, body: any): Response {
    const duration = Date.now() - startTime;

    if (req.user && req.method !== 'GET') {
      OperationLog.create({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        method: req.method,
        path: req.path,
        ip: req.ip || req.socket.remoteAddress,
        params: JSON.stringify(req.params),
        query: JSON.stringify(req.query),
        body: JSON.stringify(req.body),
        statusCode: res.statusCode,
        duration,
      }).catch((err) => {
        logger.error('保存操作日志失败:', err);
      });
    }

    return originalSend.call(this, body);
  };

  next();
};
