import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const operationLog = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const originalSend = res.send;

  res.send = function (this: Response, body: any): Response {
    const duration = Date.now() - startTime;
    const userId = req.user?.userId;
    const username = req.user?.username;
    const role = req.user?.role;

    let responseBody: any;
    try {
      responseBody = typeof body === 'string' ? JSON.parse(body) : body;
    } catch {
      responseBody = body;
    }

    logger.info('操作日志', {
      method: req.method,
      path: req.path,
      userId,
      username,
      role,
      params: req.params,
      query: req.query,
      body: req.body,
      statusCode: res.statusCode,
      success: responseBody?.success ?? false,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
    });

    return originalSend.call(this, body);
  };

  next();
};
