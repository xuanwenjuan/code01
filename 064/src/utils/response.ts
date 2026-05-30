import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data
    };
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return {
      code: 201,
      message,
      data
    };
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      message
    };
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return {
      code: 400,
      message
    };
  }

  static unauthorized(message: string = '未授权访问'): ApiResponse {
    return {
      code: 401,
      message
    };
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return {
      code: 403,
      message
    };
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return {
      code: 404,
      message
    };
  }

  static paginated<T>(list: T[], total: number, page: number, pageSize: number, message: string = '查询成功'): ApiResponse {
    return {
      code: 200,
      message,
      data: {
        list,
        total,
        page,
        pageSize
      }
    };
  }
}
