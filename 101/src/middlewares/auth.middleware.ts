import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/base.exception';
import { UserRole, PERMISSIONS } from '../constants/enum';
import User from '../models/User.model';
import logger from '../utils/logger';

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('请先登录');
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用，请联系管理员');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedException('登录已过期，请重新登录'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedException('无效的令牌'));
    } else {
      next(error);
    }
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`用户[${req.user.username}]权限不足，需要: ${roles.join(',')}, 当前: ${req.user.role}`);
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    next();
  };
};

export const permissionMiddleware = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      logger.warn(`用户[${req.user.username}]权限不足，需要: ${permissions.join(',')}, 角色: ${req.user.role}`);
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    next();
  };
};

export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedException('请先登录');
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('仅超级管理员可执行此操作');
  }

  next();
};
