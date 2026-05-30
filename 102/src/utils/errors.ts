export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, errors?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    Error.captureStackTrace(this);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = '请求参数错误', errors?: any) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = '未授权访问') {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = '资源不存在') {
    super(message, 404);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = '资源冲突') {
    super(message, 409);
  }
}
