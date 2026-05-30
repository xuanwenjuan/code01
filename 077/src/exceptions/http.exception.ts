export class HttpException extends Error {
  public status: number;
  public code: string;
  public errors?: any;

  constructor(message: string, status: number, code: string, errors?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = '请求参数错误', errors?: any) {
    super(message, 400, 'BAD_REQUEST', errors);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = '禁止访问') {
    super(message, 403, 'FORBIDDEN');
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = '资源不存在') {
    super(message, 404, 'NOT_FOUND');
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = '资源冲突') {
    super(message, 409, 'CONFLICT');
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string = '数据验证失败', errors?: any) {
    super(message, 422, 'VALIDATION_ERROR', errors);
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = '服务器内部错误') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    Object.setPrototypeOf(this, InternalServerErrorException.prototype);
  }
}
