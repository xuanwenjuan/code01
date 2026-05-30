import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/BusinessException';
import { UserRole, RolePermissions } from '../constants/role';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('请先登录');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    next();
  } catch (error) {
    throw new UnauthorizedException('Token无效或已过期');
  }
};

export const authorize = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    const userPermissions = RolePermissions[req.user.role];
    
    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      throw new ForbiddenException('权限不足');
    }

    next();
  };
};