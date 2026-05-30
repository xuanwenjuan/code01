import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

declare global {
  namespace Express {
    interface Response {
      success: <T>(data?: T, message?: string) => void;
      fail: (message: string, code?: number) => void;
    }
  }
}

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  res.success = <T>(data?: T, message: string = '操作成功') => {
    const response: ApiResponse<T> = {
      code: 200,
      message,
      data,
      timestamp: Date.now()
    };
    res.status(200).json(response);
  };

  res.fail = (message: string, code: number = 400) => {
    const response: ApiResponse = {
      code,
      message,
      timestamp: Date.now()
    };
    res.status(code).json(response);
  };

  next();
};
