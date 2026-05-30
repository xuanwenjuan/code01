import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JwtUtil } from '../utils/jwt';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole } from '../types';
import { User } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: UserRole;
        username: string;
      };
      requestId?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const token = authHeader.substring(7);
    const payload = JwtUtil.verifyToken(token);

    const user = await User.findByPk(payload.userId);
    if (!user || user.status !== 1) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      username: payload.username,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const roleGuard = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException('权限不足');
    }

    next();
  };
};
