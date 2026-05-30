import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/response';
import { Logger } from '../utils/logger';

export class AppError extends Error {
  public readonly code: number;
  public readonly httpStatus: number;

  constructor(message: string, code: number, httpStatus: number) {
    super(message);
    this.code = code;
    this.httpStatus = httpStatus;
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  Logger.error(`[${req.method}] ${req.path} - ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.httpStatus).json(ResponseUtil.error(err.message, err.code as any, err.httpStatus));
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json(ResponseUtil.validationError(err.message));
    return;
  }

  res.status(500).json(ResponseUtil.error(err.message || 'Internal Server Error'));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ResponseUtil.notFound(`Route ${req.method} ${req.path} not found`));
};
