import { Request, Response, NextFunction } from 'express';
import { UserRole, PERMISSIONS } from '../types';
import { ResponseUtil } from '../utils/response';

const hasPermission = (userRole: UserRole, requiredPermission: string): boolean => {
  const userPermissions = PERMISSIONS[userRole] || [];

  for (const permission of userPermissions) {
    if (permission === '*' || permission === requiredPermission) {
      return true;
    }

    const [module, action] = requiredPermission.split(':');
    const [permModule, permAction] = permission.split(':');

    if (permModule === module && permAction === '*') {
      return true;
    }

    if (permModule === '*') {
      return true;
    }
  }

  return false;
};

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    const userRole = req.user.role as UserRole;

    if (!hasPermission(userRole, permission)) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};

export const requireAnyPermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    const userRole = req.user.role as UserRole;

    const hasAnyPermission = permissions.some((p) => hasPermission(userRole, p));

    if (!hasAnyPermission) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};

export const requireAllPermissions = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    const userRole = req.user.role as UserRole;

    const hasAllPermissions = permissions.every((p) => hasPermission(userRole, p));

    if (!hasAllPermissions) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    const userRole = req.user.role as UserRole;

    if (!roles.includes(userRole)) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};

export const isSuperAdmin = requireRoles(UserRole.SUPER_ADMIN);
export const isOperation = requireRoles(UserRole.SUPER_ADMIN, UserRole.OPERATION);
export const isFinance = requireRoles(UserRole.SUPER_ADMIN, UserRole.FINANCE);
