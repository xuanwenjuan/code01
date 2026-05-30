import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  traceId?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功', code: number = 200): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      code,
      message,
      data,
      timestamp: Date.now()
    };
    return res.status(code).json(response);
  }

  static successWithPagination<T>(
    res: Response,
    data: T,
    page: number,
    pageSize: number,
    total: number,
    message: string = '查询成功'
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      code: 200,
      message,
      data,
      timestamp: Date.now(),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
    return res.status(200).json(response);
  }

  static error(res: Response, message: string = '操作失败', code: number = 500): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      code,
      message,
      timestamp: Date.now()
    };
    return res.status(code).json(response);
  }

  static created<T>(res: Response, data?: T, message: string = '创建成功'): Response<ApiResponse<T>> {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response, message: string = '删除成功'): Response<ApiResponse> {
    return this.success(res, undefined, message, 204);
  }

  static badRequest(res: Response, message: string = '请求参数错误'): Response<ApiResponse> {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message: string = '未授权，请先登录'): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '权限不足，无法访问'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = '资源冲突'): Response<ApiResponse> {
    return this.error(res, message, 409);
  }

  static validationError(res: Response, errors: string[], message: string = '参数验证失败'): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      code: 422,
      message: `${message}: ${errors.join('; ')}`,
      timestamp: Date.now()
    };
    return res.status(422).json(response);
  }
}
