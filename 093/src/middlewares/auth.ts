import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('未提供认证令牌');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = JwtUtil.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('无效或过期的令牌');
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未认证');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('权限不足');
    }

    next();
  };
};

export const Permission = {
  CATEGORY: {
    VIEW: 'category:view',
    CREATE: 'category:create',
    UPDATE: 'category:update',
    DELETE: 'category:delete',
  },
  MATERIAL: {
    VIEW: 'material:view',
    CREATE: 'material:create',
    UPDATE: 'material:update',
    DELETE: 'material:delete',
    CONSUME: 'material:consume',
    LOCK: 'material:lock',
    UNLOCK: 'material:unlock',
    STOCK_IN: 'material:stockIn',
  },
  ORDER: {
    VIEW: 'order:view',
    CREATE: 'order:create',
    UPDATE: 'order:update',
    UPDATE_STATUS: 'order:updateStatus',
    CANCEL: 'order:cancel',
    ASSIGN: 'order:assign',
    SCHEDULE: 'order:schedule',
    COMPLETE: 'order:complete',
  },
  COST_REPORT: {
    VIEW: 'costReport:view',
    CREATE: 'costReport:create',
    DELETE: 'costReport:delete',
    EXPORT: 'costReport:export',
  },
};

const allPermissions = Object.values(Permission).flatMap((p) => Object.values(p));

const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: allPermissions,
  [UserRole.ADMIN]: allPermissions,
  [UserRole.DESIGN]: [
    Permission.CATEGORY.VIEW,
    Permission.CATEGORY.CREATE,
    Permission.CATEGORY.UPDATE,
    Permission.MATERIAL.VIEW,
    Permission.ORDER.VIEW,
    Permission.ORDER.CREATE,
    Permission.ORDER.UPDATE,
    Permission.ORDER.UPDATE_STATUS,
    Permission.ORDER.SCHEDULE,
  ],
  [UserRole.PRODUCTION]: [
    Permission.ORDER.VIEW,
    Permission.ORDER.UPDATE_STATUS,
    Permission.ORDER.COMPLETE,
    Permission.MATERIAL.VIEW,
    Permission.MATERIAL.CONSUME,
    Permission.MATERIAL.LOCK,
    Permission.MATERIAL.UNLOCK,
  ],
  [UserRole.WAREHOUSE]: [
    Permission.MATERIAL.VIEW,
    Permission.MATERIAL.CREATE,
    Permission.MATERIAL.UPDATE,
    Permission.MATERIAL.CONSUME,
    Permission.MATERIAL.STOCK_IN,
    Permission.MATERIAL.LOCK,
    Permission.MATERIAL.UNLOCK,
    Permission.CATEGORY.VIEW,
    Permission.ORDER.VIEW,
  ],
  [UserRole.FINANCE]: [
    Permission.CATEGORY.VIEW,
    Permission.MATERIAL.VIEW,
    Permission.ORDER.VIEW,
    Permission.COST_REPORT.VIEW,
    Permission.COST_REPORT.CREATE,
    Permission.COST_REPORT.EXPORT,
  ],
};

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未认证');
    }

    const userPerms = rolePermissions[req.user.role] || [];
    const hasPermission = permissions.some((p) => userPerms.includes(p));

    if (!hasPermission) {
      throw new ForbiddenError('权限不足');
    }

    next();
  };
};

export const requireAllPermissions = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未认证');
    }

    const userPerms = rolePermissions[req.user.role] || [];
    const hasAllPermissions = permissions.every((p) => userPerms.includes(p));

    if (!hasAllPermissions) {
      throw new ForbiddenError('权限不足');
    }

    next();
  };
};

