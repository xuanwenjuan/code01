export class BusinessException extends Error {
  public readonly code: number;
  public readonly message: string;

  constructor(message: string, code: number = 400) {
    super(message);
    this.code = code;
    this.message = message;
    this.name = 'BusinessException';
  }
}

export class NotFoundException extends BusinessException {
  constructor(message: string = '资源不存在') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

export class UnauthorizedException extends BusinessException {
  constructor(message: string = '未授权访问') {
    super(message, 401);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends BusinessException {
  constructor(message: string = '权限不足') {
    super(message, 403);
    this.name = 'ForbiddenException';
  }
}

export class ValidationException extends BusinessException {
  public readonly errors: any[];

  constructor(message: string = '参数验证失败', errors: any[] = []) {
    super(message, 400);
    this.name = 'ValidationException';
    this.errors = errors;
  }
}