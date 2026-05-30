import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types';
import logger from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: UserRole;
        permissions: Permission[];
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json(ResponseUtil.unauthorized('未提供认证令牌'));
    }

    const token = authHeader.slice(7);
    const payload = JwtUtil.verify(token);

    const permissions = ROLE_PERMISSIONS[payload.role] || [];

    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
      permissions,
    };

    next();
  } catch (error) {
    logger.error('认证失败:', error);
    return res
      .status(401)
      .json(ResponseUtil.unauthorized('认证令牌无效或已过期'));
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(ResponseUtil.unauthorized('未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(ResponseUtil.forbidden('权限不足'));
    }

    next();
  };
};

export const permissionMiddleware = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(ResponseUtil.unauthorized('未认证'));
    }

    const hasPermission = permissions.every((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`权限不足: 用户 ${req.user.id} 尝试访问需要 ${permissions.join(', ')} 权限的资源`);
      return res
        .status(403)
        .json(ResponseUtil.forbidden('权限不足'));
    }

    next();
  };
};

export const authAndPermission = (
  ...permissions: Permission[]
) => [authMiddleware, permissionMiddleware(...permissions)];

export const authAndRole = (...roles: UserRole[]) => [
  authMiddleware,
  roleMiddleware(...roles),
];
