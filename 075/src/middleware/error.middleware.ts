
import { Request, Response, NextFunction } from 'express';
import { errorResponse, AppError, HttpStatus } from '../utils/response';
import { ValidationError } from '../types';
import { validationResult } from 'express-validator';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = req.headers['x-request-id'] as string || 
    `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg
    }));
    throw new AppError('请求参数验证失败', HttpStatus.BAD_REQUEST, validationErrors);
  }
  next();
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  console.error(`[${new Date().toISOString()}] Request ${res.locals.requestId} error:`, error);
  return errorResponse(res, error, req.path);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  throw new AppError(`接口不存在: ${req.method} ${req.path}`, HttpStatus.NOT_FOUND);
};
