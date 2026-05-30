import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { ResponseUtil } from '../utils/response';
import logger from '../utils/logger';

export const errorMiddleware = (
  error: HttpException | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (error instanceof HttpException) {
      logger.warn(`[${error.status}] ${req.method} ${req.path} - ${error.message}`);
      return res.status(error.status).json(ResponseUtil.error(error.message, error.status));
    }

    logger.error(`[500] ${req.method} ${req.path} - ${error.message}`, error);
    return res.status(500).json(ResponseUtil.serverError());
  } catch (e) {
    next(e);
  }
};
