import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiResponse } from '../utils/response';
import { UserRole } from '../utils/constants';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export enum Permission {
  CATEGORY_MANAGE = 'category:manage',
  CATEGORY_VIEW = 'category:view',
  INFLUENCER_VIEW = 'influencer:view',
  INFLUENCER_REVIEW = 'influencer:review',
  INFLUENCER_MANAGE = 'influencer:manage',
  ORDER_CREATE = 'order:create',
  ORDER_VIEW = 'order:view',
  ORDER_MATCH = 'order:match',
  ORDER_MANAGE = 'order:manage',
  SETTLEMENT_VIEW = 'settlement:view',
  SETTLEMENT_PROCESS = 'settlement:process',
  SETTLEMENT_MANAGE = 'settlement:manage',
  USER_MANAGE = 'user:manage',
  LOG_VIEW = 'log:view',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.OPERATOR]: [
    Permission.CATEGORY_VIEW,
    Permission.CATEGORY_MANAGE,
    Permission.INFLUENCER_VIEW,
    Permission.INFLUENCER_REVIEW,
    Permission.ORDER_VIEW,
    Permission.ORDER_MATCH,
    Permission.ORDER_MANAGE,
    Permission.LOG_VIEW,
  ],
  [UserRole.FINANCE]: [
    Permission.SETTLEMENT_VIEW,
    Permission.SETTLEMENT_PROCESS,
    Permission.SETTLEMENT_MANAGE,
    Permission.ORDER_VIEW,
  ],
  [UserRole.MERCHANT]: [
    Permission.ORDER_CREATE,
    Permission.ORDER_VIEW,
    Permission.CATEGORY_VIEW,
  ],
  [UserRole.INFLUENCER]: [
    Permission.INFLUENCER_MANAGE,
    Permission.ORDER_VIEW,
    Permission.CATEGORY_VIEW,
  ],
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'status'],
    });

    if (!user) {
      return ApiResponse.unauthorized(res, '用户不存在');
    }

    if (user.status !== 'active') {
      return ApiResponse.unauthorized(res, '账户已被禁用');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return ApiResponse.unauthorized(res, '令牌已过期');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return ApiResponse.unauthorized(res, '无效的令牌');
    }
    return ApiResponse.unauthorized(res, '认证失败');
  }
};

export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, '未认证');
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.every(p => userPermissions.includes(p));

    if (!hasPermission) {
      return ApiResponse.forbidden(res, '无权限访问');
    }

    next();
  };
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, '未认证');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, '无权限访问');
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireMerchant = requireRole(UserRole.MERCHANT, UserRole.ADMIN, UserRole.OPERATOR);
export const requireInfluencer = requireRole(UserRole.INFLUENCER, UserRole.ADMIN, UserRole.OPERATOR);
export const requireOperator = requireRole(UserRole.OPERATOR, UserRole.ADMIN);
export const requireFinance = requireRole(UserRole.FINANCE, UserRole.ADMIN);
