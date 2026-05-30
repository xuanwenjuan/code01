import { ApiResponse, ErrorCode, HttpStatus } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message: string = 'success'): ApiResponse<T> {
    return {
      code: ErrorCode.SUCCESS,
      message,
      data,
      timestamp: Date.now()
    };
  }

  static error(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR): ApiResponse & { httpStatus: HttpStatus } {
    return {
      code,
      message,
      timestamp: Date.now(),
      httpStatus: status
    };
  }

  static validationError(message: string): ApiResponse & { httpStatus: HttpStatus } {
    return this.error(message, ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiResponse & { httpStatus: HttpStatus } {
    return this.error(message, ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message: string = 'Forbidden'): ApiResponse & { httpStatus: HttpStatus } {
    return this.error(message, ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
  }

  static notFound(message: string = 'Resource not found'): ApiResponse & { httpStatus: HttpStatus } {
    return this.error(message, ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND);
  }
}
