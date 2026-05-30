import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${error.message}`, error.stack);

  if (error instanceof HttpException) {
    return res.status(error.status).json(ResponseUtil.error(error.message, error.status));
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json(ResponseUtil.badRequest(error.message));
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(ResponseUtil.unauthorized('Token 无效'));
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(ResponseUtil.unauthorized('Token 已过期'));
  }

  return res.status(500).json(ResponseUtil.error('服务器内部错误'));
};
