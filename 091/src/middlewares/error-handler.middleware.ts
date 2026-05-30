import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/base.exception';
import logger from '../config/logger';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  logger.error('请求错误:', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
  });

  if (err instanceof BaseException) {
    return ResponseUtil.error(res, err.code, err.message);
  }

  if (err.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, err.message);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.error(res, 409, '数据已存在，请勿重复提交');
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseUtil.badRequest(res, '关联数据不存在');
  }

  return ResponseUtil.error(res, 500, '服务器内部错误');
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ResponseUtil.notFound(res, `请求的路径 ${req.method} ${req.url} 不存在`);
};
