import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../common/http-exception';
import { ResponseUtil } from '../common/response';

export const errorHandlerMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof HttpException) {
    return res.status(error.status).json(ResponseUtil.error(error.message, error.status));
  }

  return res.status(500).json(ResponseUtil.error('服务器内部错误', 500));
};