import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string = '操作成功',
  code: number = 200
): Response<ApiResponse<T>> => {
  return res.status(code).json({
    code,
    message,
    data,
    success: true
  });
};

export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  code: number = 400
): Response<ApiResponse> => {
  return res.status(code).json({
    code,
    message,
    success: false
  });
};
