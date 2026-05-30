import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { RolePermissionMap, UserRole } from '../models/User';
import { ForbiddenException } from '../exceptions/AppException';

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenException('未登录，无权访问');
      }

      const userPermissions = RolePermissionMap[user.role as UserRole] || [];
      const hasPermission = permissions.some(perm => userPermissions.includes(perm));

      if (!hasPermission) {
        throw new ForbiddenException('权限不足，无法执行此操作');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAllPermissions = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenException('未登录，无权访问');
      }

      const userPermissions = RolePermissionMap[user.role as UserRole] || [];
      const hasAllPermissions = permissions.every(perm => userPermissions.includes(perm));

      if (!hasAllPermissions) {
        throw new ForbiddenException('权限不足，无法执行此操作');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new ForbiddenException('未登录，无权访问');
      }

      if (!roles.includes(user.role as UserRole)) {
        throw new ForbiddenException('权限不足，无法执行此操作');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
