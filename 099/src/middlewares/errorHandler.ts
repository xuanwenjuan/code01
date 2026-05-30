import { Request, Response, NextFunction } from 'express';
import { ResponseUtil, BusinessException } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`[错误] ${req.method} ${req.path} - ${err.message}`);
  logger.error(err.stack);

  if (err instanceof BusinessException) {
    return res.status(err.code).json(ResponseUtil.error(err.message, err.code));
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json(ResponseUtil.error(err.message, 400));
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(ResponseUtil.error('未授权访问', 401));
  }

  res.status(500).json(ResponseUtil.error('服务器内部错误', 500));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ResponseUtil.error('接口不存在', 404));
};
