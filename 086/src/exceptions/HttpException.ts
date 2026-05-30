export class HttpException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = '请求参数错误') {
    super(message, 400);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = '未授权访问') {
    super(message, 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = '资源不存在') {
    super(message, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}
