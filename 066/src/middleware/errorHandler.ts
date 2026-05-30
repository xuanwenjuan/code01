import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    body: req.body,
    query: req.query,
    params: req.params,
    stack: err.stack
  });

  if (err.isOperational) {
    return ResponseUtil.error(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    return ResponseUtil.error(res, messages.join(', '), 400);
  }

  if (err.name === 'JsonWebTokenError') {
    return ResponseUtil.unauthorized(res, '无效的token');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseUtil.unauthorized(res, 'token已过期');
  }

  return ResponseUtil.serverError(res, err.message);
};