export class AppException extends Error {
  public readonly code: number;
  public readonly isOperational: boolean;

  constructor(code: number, message: string, isOperational: boolean = true) {
    super(message);
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Not Found') {
    super(404, message);
  }
}

export class ValidationException extends AppException {
  constructor(message: string = 'Validation Error') {
    super(400, message);
  }
}
