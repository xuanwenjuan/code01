import { ApiResponse, PaginatedResponse } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
    };
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      message,
      success: false,
    };
  }

  static page<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): ApiResponse<PaginatedResponse<T>> {
    return {
      code: 200,
      message,
      data: {
        list,
        total,
        page,
        pageSize,
      },
      success: true,
    };
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return {
      code: 201,
      message,
      data,
      success: true,
    };
  }

  static updated<T>(data?: T, message: string = '更新成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
    };
  }

  static deleted(message: string = '删除成功'): ApiResponse {
    return {
      code: 200,
      message,
      success: true,
    };
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return {
      code: 400,
      message,
      success: false,
    };
  }

  static unauthorized(message: string = '未授权，请先登录'): ApiResponse {
    return {
      code: 401,
      message,
      success: false,
    };
  }

  static forbidden(message: string = '权限不足，禁止访问'): ApiResponse {
    return {
      code: 403,
      message,
      success: false,
    };
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return {
      code: 404,
      message,
      success: false,
    };
  }

  static conflict(message: string = '资源冲突'): ApiResponse {
    return {
      code: 409,
      message,
      success: false,
    };
  }
}