import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { ApiResponse } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`);
  logger.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      errors: err.errors,
      success: false,
      timestamp: Date.now(),
    });
  }

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, '无效的令牌');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, '令牌已过期');
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = (err as any).errors.map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      code: 422,
      message: '数据验证失败',
      errors,
      success: false,
      timestamp: Date.now(),
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ApiResponse.error(res, '数据已存在', 409);
  }

  return ApiResponse.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  ApiResponse.notFound(res, `请求的路径 ${req.method} ${req.path} 不存在`);
};
