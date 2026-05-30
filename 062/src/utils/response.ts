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

  static unauthorized(res: Response, message: string = '未授权，请先登录'): Response<ApiResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '无权限访问'): Response<ApiResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<ApiResponse> {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = '资源冲突'): Response<ApiResponse> {
    return this.error(res, message, 409);
  }

  static page<T>(res: Response, list: T[], total: number, page: number, pageSize: number, message: string = '查询成功'): Response<ApiResponse> {
    return res.status(200).json({
      code: 200,
      message,
      data: {
        list,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      success: true,
      timestamp: Date.now()
    });
  }
}
