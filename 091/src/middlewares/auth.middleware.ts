import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedException, ForbiddenException } from '../exceptions/base.exception';
import User from '../models/user.model';
import { RolePermissions, UserRole, PermissionModule, PermissionAction, checkPermission } from '../constants/role.constants';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
    realName: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT.SECRET) as any;

    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      realName: user.realName,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedException('令牌已过期'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedException('无效的令牌'));
    } else {
      next(error);
    }
  }
};

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    const userRole = req.user.role;
    const permissions = RolePermissions[userRole];

    if (!permissions.includes('*') && !permissions.includes(permission)) {
      throw new ForbiddenException('无权限执行此操作');
    }

    next();
  };
};

export const requireModulePermission = (module: PermissionModule, action: PermissionAction) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    if (!checkPermission(req.user.role, module, action)) {
      throw new ForbiddenException('无权限执行此操作');
    }

    next();
  };
};

export const requireRoles = (roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException('无权限执行此操作');
    }

    next();
  };
};

