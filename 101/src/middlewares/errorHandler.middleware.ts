import { Request, Response, NextFunction } from 'express';
import { BaseException } from '../exceptions/base.exception';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, {
    stack: err.stack });

  if (err instanceof BaseException) {
    return res.status(err.code).json(ResponseUtil.error(err.message, err.code));
  }

  return res.status(500).json(ResponseUtil.error('服务器内部错误', 500));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ResponseUtil.notFound('接口不存在'));
};
