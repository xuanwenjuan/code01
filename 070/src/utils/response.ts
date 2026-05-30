import { Response } from 'express';

export interface IResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export interface IPaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiResponse {
  static success<T>(res: Response, data?: T, message: string = '操作成功'): Response<IResponse<T>> {
    return res.status(200).json({
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static created<T>(res: Response, data?: T, message: string = '创建成功'): Response<IResponse<T>> {
    return res.status(201).json({
      code: 201,
      message,
      data,
      success: true,
      timestamp: Date.now(),
    });
  }

  static error(res: Response, message: string = '操作失败', code: number = 500): Response<IResponse> {
    return res.status(code).json({
      code,
      message,
      success: false,
      timestamp: Date.now(),
    });
  }

  static badRequest(res: Response, message: string = '请求参数错误'): Response<IResponse> {
    return this.error(res, message, 400);
  }

  static unauthorized(res: Response, message: string = '未授权访问'): Response<IResponse> {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = '无权限访问'): Response<IResponse> {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = '资源不存在'): Response<IResponse> {
    return this.error(res, message, 404);
  }

  static paginated<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): Response<IResponse<IPaginatedData<T>>> {
    return this.success(res, { list, total, page, pageSize }, message);
  }
}
