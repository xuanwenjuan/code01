import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiResponse } from '../utils/response';
import { UserRole } from '../types';
import User from '../database/models/User.model';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(ApiResponse.unauthorized('未提供认证令牌'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json(ApiResponse.unauthorized('认证令牌无效或已过期'));
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized('未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ApiResponse.forbidden('无权限访问此资源'));
    }

    next();
  };
};
