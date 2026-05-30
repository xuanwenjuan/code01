import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Result } from '../utils/response';
import { JwtPayload, UserRole } from '../types';
import { User } from '../models';
import logger from '../config/logger';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: UserRole;
        phone?: string;
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return Result.sendUnauthorized(res, '请先登录');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'status', 'phone']
    });

    if (!user) {
      return Result.sendUnauthorized(res, '用户不存在');
    }

    if (user.status !== 1) {
      return Result.sendUnauthorized(res, '账号已被禁用');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      phone: user.phone
    };

    logger.info(`用户访问: ${user.username} ${req.method} ${req.path}`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return Result.sendUnauthorized(res, 'Token已过期');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return Result.sendUnauthorized(res, 'Token无效');
    }
    return Result.sendUnauthorized(res, '认证失败');
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return Result.sendUnauthorized(res, '请先登录');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`权限不足: ${req.user.username} 尝试访问 ${req.path}, 需要角色: ${roles.join(',')}`);
      return Result.sendForbidden(res, '权限不足');
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireRider = requireRole(UserRole.RIDER, UserRole.ADMIN);
export const requireUser = requireRole(UserRole.USER, UserRole.RIDER, UserRole.ADMIN);
