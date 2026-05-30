import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`[${req.method}] ${req.path} - ${error.message}`);
  
  if (error instanceof HttpException) {
    res.status(error.status).json(ResponseUtil.error(error.message, error.status));
  } else {
    res.status(500).json(ResponseUtil.serverError(error.message));
  }
};
