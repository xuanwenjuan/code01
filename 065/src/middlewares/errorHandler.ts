import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);

  if (error instanceof HttpException) {
    return res.status(error.statusCode).json(ResponseUtil.error(error.message, error.statusCode));
  }

  return res.status(500).json(ResponseUtil.internalError(error.message));
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  return res.status(404).json(ResponseUtil.notFound(`接口 ${req.method} ${req.path} 不存在`));
};