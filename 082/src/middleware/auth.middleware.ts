import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseUtil } from '../utils/response';
import { JwtPayload } from '../types';
import { User } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ResponseUtil.unauthorized('未提供认证令牌'));
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homestay-booking-jwt-secret-key-2024') as JwtPayload;
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.status) {
      return res.status(401).json(ResponseUtil.unauthorized('用户不存在或已被禁用'));
    }
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(ResponseUtil.unauthorized('令牌已过期'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(ResponseUtil.unauthorized('无效的令牌'));
    }
    return res.status(500).json(ResponseUtil.error('认证失败'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized('未认证'));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ResponseUtil.forbidden('权限不足'));
    }
    next();
  };
};
