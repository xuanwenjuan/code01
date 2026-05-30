import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/AppException';
import dotenv from 'dotenv';
import { UserRoleEnum, RolePermissions, PermissionEnum } from '../types';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    permissions: PermissionEnum[];
  };
}

export const authMiddleware = (roles: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('请先登录');
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      
      const userRole = decoded.role as UserRoleEnum;
      const permissions = RolePermissions[userRole] || [];
      
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        permissions
      };

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        throw new ForbiddenException('权限不足');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requirePermission = (permission: PermissionEnum) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (!req.user.permissions.includes(permission)) {
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    next();
  };
};
