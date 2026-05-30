import { Request, Response, NextFunction } from 'express';
import { error, badRequest, unauthorized, forbidden, notFound } from '../utils/response';
import { createOperationLog, getModuleNameByPath } from '../services/operationLogService';
import { OperationType, LogLevel } from '../types';
import { ValidationError } from 'joi';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  const module = getModuleNameByPath(req.path);

  createOperationLog({
    operatorId: req.user?.userId,
    operatorName: req.user?.realName,
    module,
    operation: OperationType.UPDATE,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.socket.remoteAddress,
    params: { ...req.params, ...req.query, ...req.body },
    status: false,
    errorMsg: err.message,
    logLevel: LogLevel.ERROR
  }).catch(logErr => console.error('Failed to create error log:', logErr));

  if (err instanceof ValidationError) {
    const errors = err.details.map(d => d.message);
    return res.status(400).json(badRequest('请求参数校验失败', errors));
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json(unauthorized('Token无效或已过期'));
  }

  if (err.message.includes('权限不足')) {
    return res.status(403).json(forbidden(err.message));
  }

  if (err.message.includes('不存在') || err.message.includes('not found')) {
    return res.status(404).json(notFound(err.message));
  }

  res.status(500).json(error(err.message || '服务器内部错误'));
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json(notFound('请求的资源不存在'));
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
