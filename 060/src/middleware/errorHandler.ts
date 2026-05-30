import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} -`, error);

  if (error instanceof AppError) {
    return ApiResponse.error(res, error.statusCode, error.message);
  }

  if (error.name === 'ValidationError') {
    return ApiResponse.badRequest(res, error.message);
  }

  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, '无效的令牌');
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, '令牌已过期');
  }

  if (error.name === 'SequelizeValidationError') {
    const messages = (error as any).errors.map((e: any) => e.message).join(', ');
    return ApiResponse.badRequest(res, messages);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return ApiResponse.badRequest(res, '数据已存在');
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.badRequest(res, '关联数据不存在');
  }

  if (process.env.NODE_ENV === 'development') {
    return ApiResponse.error(res, 500, error.message);
  }

  return ApiResponse.error(res, 500, '服务器内部错误');
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`404 - [${req.method}] ${req.path} - ${req.ip}`);
  return ApiResponse.notFound(res, '请求的资源不存在');
};
