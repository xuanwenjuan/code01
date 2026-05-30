import { Request, Response, NextFunction } from 'express';
import { BusinessException, ValidationException } from '../exceptions/BusinessException';
import logger from '../config/logger';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`, {
    error: error.stack,
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (error instanceof ValidationException) {
    return res.status(error.code).json({
      code: error.code,
      message: error.message,
      errors: error.errors,
      success: false,
      timestamp: Date.now()
    });
  }

  if (error instanceof BusinessException) {
    return ResponseUtil.error(res, error.message, error.code);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期');
  }

  if (error.name === 'SequelizeValidationError') {
    return ResponseUtil.badRequest(res, '数据验证失败');
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return ResponseUtil.badRequest(res, '数据已存在');
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};