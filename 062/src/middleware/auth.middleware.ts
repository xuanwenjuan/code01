import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
    realName: string;
    phone: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-secret-key-2024') as any;

    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new ForbiddenException('用户已被禁用，请联系管理员');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      realName: user.realName,
      phone: user.phone
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedException('Token无效'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedException('Token已过期，请重新登录'));
    } else if (error instanceof jwt.NotBeforeError) {
      next(new UnauthorizedException('Token尚未生效'));
    } else {
      next(error);
    }
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException(`需要以下角色之一: ${roles.join(', ')}`);
    }

    next();
  };
};

export const orRoles = (...roleGroups: UserRole[][]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const hasPermission = roleGroups.some(roles => roles.includes(req.user!.role));
    
    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel-secret-key-2024') as any;

    const user = await User.findByPk(decoded.id);
    if (user && user.isActive) {
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        realName: user.realName,
        phone: user.phone
      };
    }

    next();
  } catch (error) {
    next();
  }
};
