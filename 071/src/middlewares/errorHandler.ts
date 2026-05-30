import { Request, Response, NextFunction } from 'express';
import { AppException } from '../exceptions/AppException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof AppException) {
    return ResponseUtil.error(res, err.code, err.message);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, '无效的令牌');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, '令牌已过期');
  }

  if (err.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, err.message);
  }

  return ResponseUtil.error(res, 500, '服务器内部错误');
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseUtil.notFound(res, '请求的资源不存在');
};
