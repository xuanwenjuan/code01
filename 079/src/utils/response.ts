import { ApiResponse, PaginatedResponse } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class ResponseUtil {
  private static generateRequestId(): string {
    return uuidv4()
  }

  static success<T>(data?: T, message: string = '操作成功'): ApiResponse<T> {
    return {
      code: 200,
      message,
      data,
      success: true,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    }
  }

  static error(message: string = '操作失败', code: number = 500): ApiResponse {
    return {
      code,
      message,
      success: false,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    }
  }

  static paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message: string = '查询成功'
  ): ApiResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(total / pageSize)
    return {
      code: 200,
      message,
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      success: true,
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    }
  }

  static badRequest(message: string = '请求参数错误'): ApiResponse {
    return this.error(message, 400)
  }

  static unauthorized(message: string = '未授权访问'): ApiResponse {
    return this.error(message, 401)
  }

  static forbidden(message: string = '权限不足'): ApiResponse {
    return this.error(message, 403)
  }

  static notFound(message: string = '资源不存在'): ApiResponse {
    return this.error(message, 404)
  }

  static conflict(message: string = '资源冲突'): ApiResponse {
    return this.error(message, 409)
  }

  static validationError(message: string = '参数验证失败'): ApiResponse {
    return this.error(message, 422)
  }

  static serviceError(message: string = '服务内部错误'): ApiResponse {
    return this.error(message, 500)
  }
}
