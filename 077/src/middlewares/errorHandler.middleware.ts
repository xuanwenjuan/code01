import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http.exception';
import { ApiResponse } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof HttpException) {
    return res.status(err.status).json(ApiResponse.error(err.message, err.status));
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json(ApiResponse.badRequest(err.message));
  }

  return res.status(500).json(ApiResponse.error('服务器内部错误', 500));
};
