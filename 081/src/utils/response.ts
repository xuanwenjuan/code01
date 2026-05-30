import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, message = '操作成功'): Response<ApiResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static paginated<T>(
    res: Response,
    data: PaginatedResult<T>,
    message = '查询成功'
  ): Response<ApiResponse<PaginatedResult<T>>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      timestamp: Date.now()
    });
  }

  static error(res: Response, message = '操作失败', code = 500): Response<ApiResponse<null>> {
    return res.status(code).json({
      code,
      message,
      data: null,
      timestamp: Date.now()
    });
  }

  static badRequest(res: Response, message = '请求参数错误'): Response<ApiResponse<null>> {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message = '未授权，请先登录'): Response<ApiResponse<null>> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = '权限不足，无法访问'): Response<ApiResponse<null>> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = '资源不存在'): Response<ApiResponse<null>> {
    return this.error(res, message, 404);
  }
}
