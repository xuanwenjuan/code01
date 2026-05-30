import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { UserRole } from '../types';

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  realName?: string;
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
  requestId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('未提供认证令牌', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('认证令牌已过期', 401, 'TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('无效的认证令牌', 401, 'INVALID_TOKEN');
      }
      throw new AppError('认证失败', 401, 'AUTH_FAILED');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('未进行身份认证', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('权限不足，无法执行此操作', 403, 'FORBIDDEN');
    }

    next();
  };
};

export const RolePermissions = {
  [UserRole.SUPER_ADMIN]: {
    users: ['create', 'read', 'update', 'delete', 'assignRole'],
    categories: ['create', 'read', 'update', 'delete', 'archive', 'unarchive'],
    collections: ['create', 'read', 'update', 'delete', 'lock', 'unlock', 'archive', 'unarchive', 'import', 'export'],
    restorations: ['create', 'read', 'update', 'approve', 'start', 'complete', 'inspect', 'cancel'],
    exhibitions: ['create', 'read', 'update', 'delete', 'addCollection', 'removeCollection', 'rotateCollection', 'manageCost'],
    maintenance: ['create', 'read', 'update', 'delete']
  },
  [UserRole.COLLECTION_MANAGER]: {
    users: ['read'],
    categories: ['read'],
    collections: ['create', 'read', 'update', 'lock', 'unlock', 'import', 'export'],
    restorations: ['create', 'read'],
    exhibitions: ['read'],
    maintenance: ['create', 'read', 'update']
  },
  [UserRole.RESTORATION_TECHNICIAN]: {
    users: ['read'],
    categories: ['read'],
    collections: ['read'],
    restorations: ['create', 'read', 'update', 'start', 'complete'],
    exhibitions: ['read'],
    maintenance: ['read']
  },
  [UserRole.EXHIBITION_PLANNER]: {
    users: ['read'],
    categories: ['read'],
    collections: ['read'],
    restorations: ['read'],
    exhibitions: ['create', 'read', 'update', 'addCollection', 'removeCollection', 'rotateCollection', 'manageCost'],
    maintenance: ['read']
  }
};

export const checkPermission = (module: string, action: string) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('未进行身份认证', 401, 'UNAUTHORIZED');
    }

    const rolePermissions = RolePermissions[req.user.role];
    if (!rolePermissions) {
      throw new AppError('无效的用户角色', 403, 'INVALID_ROLE');
    }

    const modulePermissions = rolePermissions[module as keyof typeof rolePermissions];
    if (!modulePermissions || !modulePermissions.includes(action)) {
      throw new AppError(`没有 ${module} 模块的 ${action} 权限`, 403, 'PERMISSION_DENIED');
    }

    next();
  };
};

export const optionalAuth = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid, but we don't throw an error for optional auth
  }
  next();
};
