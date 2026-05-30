import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);

  if (error instanceof HttpException) {
    return ResponseUtil.error(res, error.message, error.status);
  }

  if (error.name === 'ValidationError') {
    return ResponseUtil.error(res, error.message, 400);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期');
  }

  return ResponseUtil.serverError(res, error.message || '服务器内部错误');
};
