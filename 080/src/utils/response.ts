import { Response } from 'express';

export interface IResponseData<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = '操作成功', code = 200): Response {
    return res.status(code).json({
      code,
      message,
      data,
      success: true,
    });
  }

  static error(res: Response, message = '操作失败', code = 400): Response {
    return res.status(code).json({
      code,
      message,
      success: false,
    });
  }

  static page<T>(res: Response, data: { list: T; total: number; page: number; pageSize: number }, message = '获取成功'): Response {
    return res.status(200).json({
      code: 200,
      message,
      data: {
        list: data.list,
        pagination: {
          total: data.total,
          page: data.page,
          pageSize: data.pageSize,
          totalPages: Math.ceil(data.total / data.pageSize),
        },
      },
      success: true,
    });
  }
}
