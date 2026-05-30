import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';
import { errorResponse } from '../utils/response';
import User from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(errorResponse('未提供认证令牌', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json(errorResponse('用户不存在', 401));
    }

    if (!user.isActive) {
      return res.status(401).json(errorResponse('账户已被禁用', 401));
    }

    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(errorResponse('认证令牌已过期', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(errorResponse('认证令牌无效', 401));
    }
    return res.status(401).json(errorResponse('认证失败', 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('未认证', 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json(errorResponse('权限不足', 403));
    }

    next();
  };
};

export const authorizeAdmin = authorize(UserRole.ADMIN);
export const authorizeManager = authorize(UserRole.ADMIN, UserRole.MANAGER);
export const authorizeUser = authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER);
export const authorizeViewer = authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER, UserRole.VIEWER);
