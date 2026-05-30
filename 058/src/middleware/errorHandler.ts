import { Request, Response, NextFunction } from 'express';
import { Result, HttpStatusCode } from '../utils/response';
import { BusinessError, ErrorCode } from '../utils/businessError';
import logger from '../config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`请求错误: ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (err instanceof BusinessError) {
    return Result.sendError(res, err.message, err.code);
  }

  if (err.name === 'ValidationError') {
    return Result.sendError(res, err.message, ErrorCode.VALIDATION_ERROR);
  }

  if (err.name === 'UnauthorizedError') {
    return Result.sendUnauthorized(res, 'Token无效或已过期');
  }

  if (process.env.NODE_ENV === 'development') {
    return Result.sendError(res, err.message, HttpStatusCode.INTERNAL_ERROR);
  }

  return Result.sendError(res, '服务器内部错误', HttpStatusCode.INTERNAL_ERROR);
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404请求: ${req.method} ${req.path}`);
  return Result.sendNotFound(res, '请求的资源不存在');
};
