import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole } from '../types/common';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('请先登录');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedException('登录已过期，请重新登录');
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenException('无权限执行此操作');
    }

    next();
  };
};
