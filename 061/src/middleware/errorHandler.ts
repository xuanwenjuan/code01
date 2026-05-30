import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err as ApiError;
  error.code = error.code || 500;

  if (err.name === 'ValidationError') {
    error = new ApiError(err.message, 400);
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ApiError('无效的Token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError('Token已过期', 401);
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = (err as any).errors.map((e: any) => e.message).join(', ');
    error = new ApiError(messages, 400);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error = new ApiError('数据已存在', 400);
  }

  if (error.code === 500) {
    logger.error(`[Server Error] ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
    });
  }

  res.status(error.code).json({
    success: false,
    code: error.code,
    message: error.message || '服务器内部错误',
    timestamp: Date.now(),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`找不到 ${req.method} ${req.originalUrl} 接口`, 404);
  next(error);
};
