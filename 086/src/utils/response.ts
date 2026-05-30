import { Response } from 'express';
import { ApiResponse, PaginatedResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export class ResponseUtil {
  private static generateRequestId(): string {
    return uuidv4();
  }

  static success<T = any>(
    res: Response,
    data?: T,
    message: string = '操作成功',
    statusCode: number = HttpStatusCode.OK
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      code: statusCode,
      message,
      data,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    };
    return res.status(statusCode).json(response);
  }

  static created<T = any>(
    res: Response,
    data?: T,
    message: string = '创建成功'
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, HttpStatusCode.CREATED);
  }

  static paginated<T = any>(
    res: Response,
    result: { list: T[]; total: number; page: number; pageSize: number },
    message: string = '查询成功'
  ): Response<ApiResponse<PaginatedResult<T>>> {
    const hasMore = result.page * result.pageSize < result.total;
    const paginatedData: PaginatedResult<T> = {
      list: result.list,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore
    };
    return this.success(res, paginatedData, message);
  }

  static error(
    res: Response,
    message: string = '操作失败',
    statusCode: number = HttpStatusCode.BAD_REQUEST,
    error?: any
  ): Response<ApiResponse<null>> {
    const response: ApiResponse<null> = {
      code: statusCode,
      message,
      data: null,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(
    res: Response,
    message: string = '未授权，请先登录'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, HttpStatusCode.UNAUTHORIZED);
  }

  static forbidden(
    res: Response,
    message: string = '无权限访问该资源'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, HttpStatusCode.FORBIDDEN);
  }

  static badRequest(
    res: Response,
    message: string = '请求参数错误'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, HttpStatusCode.BAD_REQUEST);
  }

  static notFound(
    res: Response,
    message: string = '资源不存在'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, HttpStatusCode.NOT_FOUND);
  }

  static conflict(
    res: Response,
    message: string = '资源冲突'
  ): Response<ApiResponse<null>> {
    return this.error(res, message, HttpStatusCode.CONFLICT);
  }

  static validationError(
    res: Response,
    message: string = '参数验证失败',
    details?: any
  ): Response<ApiResponse<null>> {
    const response: ApiResponse<null> = {
      code: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: details ? `${message}: ${JSON.stringify(details)}` : message,
      data: null,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    };
    return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json(response);
  }

  static serverError(
    res: Response,
    message: string = '服务器内部错误',
    error?: any
  ): Response<ApiResponse<null>> {
    console.error('Server error:', error);
    return this.error(res, message, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
}
