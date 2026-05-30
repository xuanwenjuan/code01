import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('请求错误:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return ResponseUtil.error(res, err.message, err.statusCode);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, '无效的令牌');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, '令牌已过期');
  }

  if (err.name === 'SequelizeValidationError') {
    return ResponseUtil.error(res, '数据验证失败', 422);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.error(res, '数据已存在', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.error(res, '关联数据不存在', 400);
  }

  return ResponseUtil.serverError(res, process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message);
};

export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('404 请求:', { path: req.path, method: req.method });
  return ResponseUtil.notFound(res, '接口不存在');
};
