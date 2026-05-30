import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]', error.message);

  if (error instanceof HttpException) {
    return res.status(error.status).json(ResponseUtil.error(error.message, error.status));
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json(ResponseUtil.error(error.message, 400));
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(ResponseUtil.unauthorized('Token无效'));
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(ResponseUtil.unauthorized('Token已过期'));
  }

  return res.status(500).json(ResponseUtil.serverError(error.message));
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json(ResponseUtil.notFound('接口不存在'));
};
