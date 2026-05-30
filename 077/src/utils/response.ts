import type { IApiResponse, IPaginationResult } from '../types';

export class ApiResponse {
  static success<T>(data: T, message: string = '操作成功'): IApiResponse<T> {
    return {
      success: true,
      code: 'SUCCESS',
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static successPage<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): IApiResponse<IPaginationResult<T>> {
    const totalPages = Math.ceil(total / pageSize);
    return {
      success: true,
      code: 'SUCCESS',
      message,
      data: {
        list,
        pagination: {
          total,
          page,
          pageSize,
          totalPages
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string = '操作失败', code: string = 'ERROR'): IApiResponse<null> {
    return {
      success: false,
      code,
      message,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  static created<T>(data: T, message: string = '创建成功'): IApiResponse<T> {
    return {
      success: true,
      code: 'CREATED',
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static deleted(message: string = '删除成功'): IApiResponse<null> {
    return {
      success: true,
      code: 'DELETED',
      message,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  static updated<T>(data: T, message: string = '更新成功'): IApiResponse<T> {
    return {
      success: true,
      code: 'UPDATED',
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}

export default ApiResponse;
