import { Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';
import { ForbiddenError, UnauthorizedError } from './errorHandler';
import { User } from '../models';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      fullUser?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('未提供访问令牌'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return next(new UnauthorizedError('用户不存在'));
    }

    if (!user.isActive) {
      return next(new ForbiddenError('用户账号已被禁用'));
    }

    req.user = decoded;
    req.fullUser = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('令牌已过期'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('无效的令牌'));
    }
    return next(new UnauthorizedError('令牌验证失败'));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('未授权访问'));
    }

    const userRole = req.user.role;
    
    if (userRole === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (userRole === UserRole.ADMIN) {
      const adminAllowedRoles = [
        UserRole.ADMIN,
        UserRole.CUSTOMER_SERVICE,
        UserRole.WAREHOUSE_ADMIN,
        UserRole.WAREHOUSE,
        UserRole.FINANCE,
      ];
      if (roles.some(role => adminAllowedRoles.includes(role))) {
        return next();
      }
    }

    if (userRole === UserRole.WAREHOUSE_ADMIN) {
      const warehouseAdminAllowedRoles = [
        UserRole.WAREHOUSE_ADMIN,
        UserRole.WAREHOUSE,
      ];
      if (roles.some(role => warehouseAdminAllowedRoles.includes(role))) {
        return next();
      }
    }

    if (!roles.includes(userRole)) {
      return next(new ForbiddenError('权限不足'));
    }

    next();
  };
};

export const authorizeOwnOrAdmin = (idParam: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('未授权访问'));
    }

    if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
      return next();
    }

    const resourceId = parseInt(req.params[idParam]);
    if (resourceId === req.user.userId) {
      return next();
    }

    return next(new ForbiddenError('权限不足'));
  };
};

export const permissionMatrix = {
  user: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    read: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    delete: [UserRole.SUPER_ADMIN],
  },
  category: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    read: [],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  product: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    read: [],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  material: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    read: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    stockIn: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE],
    stockOut: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE],
  },
  order: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER_SERVICE],
    read: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER_SERVICE, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE, UserRole.FINANCE],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER_SERVICE],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    updateStatus: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER_SERVICE, UserRole.WAREHOUSE_ADMIN],
    schedule: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE_ADMIN],
    return: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CUSTOMER_SERVICE],
  },
  ledger: {
    create: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE],
    read: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE],
    update: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE],
    delete: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
    audit: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE],
    export: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE],
  },
};

export const checkPermission = (module: keyof typeof permissionMatrix, action: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('未授权访问'));
    }

    const modulePermissions = permissionMatrix[module];
    if (!modulePermissions) {
      return next(new ForbiddenError('权限模块不存在'));
    }

    const allowedRoles = (modulePermissions as any)[action];
    if (!allowedRoles) {
      return next(new ForbiddenError('权限动作不存在'));
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('权限不足'));
    }

    next();
  };
};

export const roleHierarchy: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [UserRole.ADMIN, UserRole.CUSTOMER_SERVICE, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE, UserRole.FINANCE],
  [UserRole.ADMIN]: [UserRole.CUSTOMER_SERVICE, UserRole.WAREHOUSE_ADMIN, UserRole.WAREHOUSE, UserRole.FINANCE],
  [UserRole.WAREHOUSE_ADMIN]: [UserRole.WAREHOUSE],
  [UserRole.CUSTOMER_SERVICE]: [],
  [UserRole.WAREHOUSE]: [],
  [UserRole.FINANCE]: [],
};

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  if (userRole === requiredRole) return true;
  
  const subordinates = roleHierarchy[userRole];
  if (subordinates && subordinates.includes(requiredRole)) {
    return true;
  }
  
  for (const subordinate of subordinates || []) {
    if (hasPermission(subordinate, requiredRole)) {
      return true;
    }
  }
  
  return false;
};
