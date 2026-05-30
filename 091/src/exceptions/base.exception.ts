export class BaseException extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: number = 500, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string = '请求参数错误') {
    super(message, 400);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = '未授权，请先登录') {
    super(message, 401);
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = '无权限访问') {
    super(message, 403);
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = '资源不存在') {
    super(message, 404);
  }
}

export class ConflictException extends BaseException {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}
