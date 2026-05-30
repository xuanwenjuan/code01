import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { Logger } from '../utils/logger';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  DISPATCHER = 'dispatcher',
  BRANCH_ADMIN = 'branch_admin',
  FINANCE = 'finance',
  DRIVER = 'driver',
  CUSTOMER = 'customer'
}

export const RolePermissions = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.MANAGER]: ['order:*', 'vehicle:*', 'branch:read', 'settlement:read'],
  [UserRole.DISPATCHER]: ['order:create', 'order:update', 'order:read', 'vehicle:read'],
  [UserRole.BRANCH_ADMIN]: ['order:read', 'vehicle:read', 'branch:read'],
  [UserRole.FINANCE]: ['settlement:*', 'order:read', 'financial:*'],
  [UserRole.DRIVER]: ['order:read', 'vehicle:read'],
  [UserRole.CUSTOMER]: ['order:create', 'order:read']
};

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
    roleId: number;
    branchId?: number;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('请提供有效的 Token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      roleId: decoded.roleId,
      branchId: decoded.branchId
    };

    next();
  } catch (error) {
    Logger.error('Authentication error', error);
    throw new AuthenticationError('Token 无效或已过期');
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError('权限不足');
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('请先登录');
    }

    const userPermissions = RolePermissions[req.user.role] || [];
    
    if (userPermissions.includes('*')) {
      return next();
    }

    const [resource, action] = permission.split(':');
    if (userPermissions.includes(`${resource}:*`)) {
      return next();
    }

    if (!userPermissions.includes(permission)) {
      throw new AuthorizationError('权限不足');
    }

    next();
  };
};

export const requireBranchPermission = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('请先登录');
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const branchId = req.params.branchId || req.query.branchId || req.body.branchId;
    
    if (branchId && req.user.branchId && parseInt(branchId) !== req.user.branchId) {
      throw new AuthorizationError('只能操作所属网点的数据');
    }

    next();
  };
};
