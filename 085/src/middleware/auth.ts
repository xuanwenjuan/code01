import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, Role } from '../types';
import { ResponseUtil } from '../utils/response';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401, 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('认证令牌无效', 401, 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(ResponseUtil.unauthorized('认证令牌已过期'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(ResponseUtil.unauthorized('认证令牌无效'));
    }
    next(error);
  }
};

export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized('用户未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ResponseUtil.forbidden('权限不足'));
    }

    next();
  };
};

export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);
export const requireAdmin = requireRole(Role.SUPER_ADMIN, Role.ADMIN);
export const requireOperator = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR);
export const requireFinance = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE);
export const requireMerchant = requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.OPERATOR, Role.MERCHANT);
export const requireAuthenticated = requireRole(
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.OPERATOR,
  Role.FINANCE,
  Role.MERCHANT,
  Role.USER
);
