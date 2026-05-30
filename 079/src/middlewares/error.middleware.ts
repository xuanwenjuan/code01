import { Request, Response, NextFunction } from 'express'
import { ResponseUtil } from '../utils/response'
import { Logger } from '../utils/logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Object.setPrototypeOf(this, new.target.prototype)
    Error.captureStackTrace(this)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '参数验证失败') {
    super(message, 422)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400)
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(ResponseUtil.notFound(`请求的路径 ${req.path} 不存在`))
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Logger.error(`Error: ${err.message}`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  })

  if (err instanceof AppError) {
    res.status(err.statusCode).json(ResponseUtil.error(err.message, err.statusCode))
    return
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(ResponseUtil.unauthorized('无效的认证令牌'))
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(ResponseUtil.unauthorized('认证令牌已过期'))
    return
  }

  if (err.name === 'SequelizeValidationError') {
    const errors = (err as any).errors.map((e: any) => e.message).join(', ')
    res.status(422).json(ResponseUtil.validationError(`数据验证失败: ${errors}`))
    return
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json(ResponseUtil.conflict('数据唯一性约束冲突'))
    return
  }

  res.status(500).json(ResponseUtil.serviceError('服务器内部错误'))
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
