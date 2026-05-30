import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`, {
    stack: error.stack,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.statusCode,
      message: error.message,
      success: false,
    });
  }

  return res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    success: false,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json({
    code: 404,
    message: '接口不存在',
    success: false,
  });
};
