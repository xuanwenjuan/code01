import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import logger from '../utils/logger';
import ResponseUtil from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof ApiError) {
    return ResponseUtil.error(res, error.message, error.statusCode, error.errors);
  }

  if (error.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, '数据验证失败', error);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期');
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.error(res, '数据已存在', 409);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.badRequest(res, '关联数据不存在');
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return ResponseUtil.notFound(res, '接口不存在');
};
