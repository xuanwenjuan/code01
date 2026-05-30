import { Response } from 'express';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export class ResponseUtil {
  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now()
    });
  }

  static created<T>(res: Response, data?: T, message: string = '创建成功'): Response<ApiResponse<T>> {
    return res.status(201).json({
      code: 201,
      message,
      data,
      success: true,
      timestamp: Date.now()
    });
  }

  static error(res: Response, message: string = '操作失败', code: number = 500): Response<ApiResponse> {
    return res.status(code).json({
      code,
      message,
      success: false,
      timestamp: Date.now()
    });
  }

  static badRequest(res: Response, message: string = '请求参数错误'): Response<ApiResponse> {
    return this.error(res, message, 400);
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

  static paginated<T>(
    res: Response,
    data: {
      list: T[];
      total: number;
      page: number;
      pageSize: number;
    },
    message: string = '查询成功'
  ): Response<ApiResponse> {
    return res.status(200).json({
      code: 200,
      message,
      data: {
        list: data.list,
        pagination: {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: Math.ceil(data.total / data.pageSize)
        }
      },
      success: true,
      timestamp: Date.now()
    });
  }
}