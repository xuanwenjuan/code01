import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import { ResponseUtil } from '../utils/response';
import logger from '../config/logger';

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
    params: req.params
  });

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.statusCode,
      message: error.message,
      success: false
    });
  }

  return res.status(500).json(ResponseUtil.error('服务器内部错误'));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ResponseUtil.notFound('接口不存在'));
};