import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from '../utils/response';
import { UserRole, JwtPayload } from '../types';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError('未提供认证令牌', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    const user = await User.findOne({
      where: { id: decoded.userId, isActive: true },
      attributes: ['id', 'username', 'role'],
    });

    if (!user) {
      throw new ApiError('用户不存在或已被禁用', 401);
    }

    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError('令牌已过期', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError('无效的令牌', 401));
    } else {
      next(error);
    }
  }
};

export const roleAuth = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError('未认证', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError('权限不足', 403);
    }

    next();
  };
};
