import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  requestId?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = <T>(
  res: Response,
  data?: T,
  message: string = '操作成功',
  code: number = 200
): Response => {
  const response: ApiResponseData<T> = {
    success: true,
    code,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  return res.status(code).json(response);
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '获取成功'
): Response => {
  const response: ApiResponseData<T[]> = {
    success: true,
    code: 200,
    message,
    data,
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };

  return res.status(200).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data?: T,
  message: string = '创建成功'
): Response => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};

export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  code: number = 400,
  errorCode?: string
): Response => {
  const response: ApiResponseData = {
    success: false,
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    (response as any).errorCode = errorCode;
  }

  return res.status(code).json(response);
};
