import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功', code: number = 200): Response<ApiResponse<T>> {
    return res.status(code).json({
      code,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static error(res: Response, message: string = '操作失败', code: number = 500, errors?: any): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      errors,
      success: false,
      timestamp: Date.now(),
    });
  }

  static badRequest(res: Response, message: string = '请求参数错误', errors?: any): Response<ApiResponse> {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message: string = '未授权访问'): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '权限不足'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  static pagination<T>(res: Response, data: { list: T; total: number; page: number; pageSize: number }, message: string = '查询成功'): Response<ApiResponse> {
    return this.success(res, {
      list: data.list,
      pagination: {
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: Math.ceil(data.total / data.pageSize),
      },
    }, message);
  }
}

export default ResponseUtil;
