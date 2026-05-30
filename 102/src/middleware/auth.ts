import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole, RolePermissionMatrix } from '../constants';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    if (!user.status) {
      throw new UnauthorizedError('用户已被禁用');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('令牌已过期'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('令牌无效'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('未登录');
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      throw new ForbiddenError('权限不足');
    }
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('未登录');
    }

    const userPermissions = RolePermissionMatrix[req.user.role] || [];
    
    if ((userPermissions as string[]).includes(permission)) {
      next();
    } else {
      throw new ForbiddenError('权限不足');
    }
  };
};
