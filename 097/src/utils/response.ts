import { IResponse } from '../types/common';

export class ResponseUtil {
  static success<T>(data: T, message = '操作成功'): IResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true
    };
  }

  static created<T>(data: T, message = '创建成功'): IResponse<T> {
    return {
      code: 201,
      message,
      data,
      success: true
    };
  }

  static error(message = '操作失败', code = 400): IResponse<null> {
    return {
      code,
      message,
      data: null,
      success: false
    };
  }

  static unauthorized(message = '未授权访问'): IResponse<null> {
    return {
      code: 401,
      message,
      data: null,
      success: false
    };
  }

  static forbidden(message = '无权限访问'): IResponse<null> {
    return {
      code: 403,
      message,
      data: null,
      success: false
    };
  }

  static notFound(message = '资源不存在'): IResponse<null> {
    return {
      code: 404,
      message,
      data: null,
      success: false
    };
  }

  static serverError(message = '服务器内部错误'): IResponse<null> {
    return {
      code: 500,
      message,
      data: null,
      success: false
    };
  }
}
