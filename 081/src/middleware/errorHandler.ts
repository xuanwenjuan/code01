import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, error);

  if (error instanceof HttpException) {
    return ResponseUtil.error(res, error.message, error.statusCode);
  }

  if (error.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, error.message);
  }

  if (error.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token 无效');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token 已过期');
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseUtil.notFound(res, '接口不存在');
};
