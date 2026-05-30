import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import logger from '../config/logger';
import { ResponseUtil } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    error: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      ...ResponseUtil.error(err.message, err.statusCode),
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(ResponseUtil.error(err.message, err.statusCode));
    return;
  }

  res.status(500).json(ResponseUtil.error('服务器内部错误'));
};
