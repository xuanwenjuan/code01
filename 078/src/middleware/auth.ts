import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ResponseUtil } from '../utils/response';
import User, { UserRole } from '../models/User';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
    departmentId?: number;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(ResponseUtil.unauthorized('请先登录'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'departmentId', 'status']
    });

    if (!user || user.status !== 1) {
      return res.status(401).json(ResponseUtil.unauthorized('用户不存在或已被禁用'));
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role as UserRole,
      departmentId: user.departmentId || undefined
    };

    next();
  } catch (error) {
    return res.status(401).json(ResponseUtil.unauthorized('登录已过期，请重新登录'));
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized('请先登录'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ResponseUtil.forbidden('权限不足'));
    }

    next();
  };
};
