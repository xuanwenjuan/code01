import { Response } from 'express';
import { ApiResponse, PaginationResult } from '../types';

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

export class Result {
  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: HttpStatusCode.OK,
      message,
      data,
      timestamp: Date.now()
    };
  }

  static created<T>(data?: T, message: string = '创建成功'): ApiResponse<T> {
    return {
      code: HttpStatusCode.CREATED,
      message,
      data,
      timestamp: Date.now()
    };
  }

  static paginate<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): ApiResponse<PaginationResult<T>> {
    return {
      code: HttpStatusCode.OK,
      message,
      data: {
        list,
        total,
        page,
        pageSize
      },
      timestamp: Date.now()
    };
  }

  static error(message: string = '操作失败', code: number = HttpStatusCode.INTERNAL_ERROR): ApiResponse {
    return {
      code,
      message,
      timestamp: Date.now()
    };
  }

  static badRequest(message: string = '参数错误'): ApiResponse {
    return this.error(message, HttpStatusCode.BAD_REQUEST);
  }

  static unauthorized(message: string = '未授权，请先登录'): ApiResponse {
    return this.error(message, HttpStatusCode.UNAUTHORIZED);
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return this.error(message, HttpStatusCode.FORBIDDEN);
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return this.error(message, HttpStatusCode.NOT_FOUND);
  }

  static sendSuccess<T>(res: Response, data?: T, message: string = '操作成功'): Response {
    return res.json(this.success(data, message));
  }

  static sendCreated<T>(res: Response, data?: T, message: string = '创建成功'): Response {
    return res.status(HttpStatusCode.CREATED).json(this.created(data, message));
  }

  static sendPaginate<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): Response {
    return res.json(this.paginate(list, total, page, pageSize, message));
  }

  static sendError(res: Response, message: string = '操作失败', code: number = HttpStatusCode.INTERNAL_ERROR): Response {
    return res.status(code).json(this.error(message, code));
  }

  static sendBadRequest(res: Response, message: string = '参数错误'): Response {
    return this.sendError(res, message, HttpStatusCode.BAD_REQUEST);
  }

  static sendUnauthorized(res: Response, message: string = '未授权，请先登录'): Response {
    return this.sendError(res, message, HttpStatusCode.UNAUTHORIZED);
  }

  static sendForbidden(res: Response, message: string = '权限不足'): Response {
    return this.sendError(res, message, HttpStatusCode.FORBIDDEN);
  }

  static sendNotFound(res: Response, message: string = '资源不存在'): Response {
    return this.sendError(res, message, HttpStatusCode.NOT_FOUND);
  }
}
