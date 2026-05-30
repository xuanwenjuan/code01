import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config, RoleType } from '../config';
import { unauthorizedError, forbiddenError } from '../utils/response';

export interface JwtPayload {
  id: number;
  username: string;
  role: RoleType;
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw unauthorizedError('缺少认证令牌');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw unauthorizedError('认证令牌格式错误');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(unauthorizedError('认证令牌已过期'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(unauthorizedError('无效的认证令牌'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...allowedRoles: RoleType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorizedError('请先登录');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw forbiddenError('您没有执行此操作的权限');
    }

    next();
  };
};
