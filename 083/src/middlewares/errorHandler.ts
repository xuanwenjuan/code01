import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

export class BusinessError extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
    this.name = 'BusinessError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, err.stack);

  if (err instanceof BusinessError) {
    return ResponseUtil.error(res, err.message, err.code);
  }

  if (err.name === 'ValidationError') {
    return ResponseUtil.badRequest(res, err.message);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, 'Token无效');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'Token已过期');
  }

  return ResponseUtil.error(res, '服务器内部错误', 500);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return ResponseUtil.notFound(res);
};
