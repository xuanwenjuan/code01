import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { UserRole } from '../types';
import logger from '../utils/logger';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseUtil.unauthorized(res, '缺少认证令牌');
    }

    const token = authHeader.substring(7);
    const payload = JwtUtil.verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    logger.error('认证失败:', error);
    return ResponseUtil.unauthorized(res, '无效或过期的令牌');
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '未登录');
    }

    if (!roles.includes(req.user.role)) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};
