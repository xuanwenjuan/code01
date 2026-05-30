import { ApiResponse, PaginatedResponse } from '../types';

export const successResponse = <T>(data?: T, message: string = '操作成功'): ApiResponse<T> => {
  return {
    code: 200,
    message,
    data,
    success: true
  };
};

export const paginatedResponse = <T>(
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = '查询成功'
): ApiResponse<PaginatedResponse<T>> => {
  return {
    code: 200,
    message,
    data: {
      list,
      total,
      page,
      pageSize
    },
    success: true
  };
};

export const errorResponse = (message: string = '操作失败', code: number = 500): ApiResponse => {
  return {
    code,
    message,
    success: false
  };
};
