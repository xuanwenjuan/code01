import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, UserRole } from '../types';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('请先登录');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      storeId: user.storeId
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return ResponseUtil.unauthorized(res, 'Token 已过期');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return ResponseUtil.unauthorized(res, 'Token 无效');
    }
    next(error);
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException('权限不足，无法访问');
    }

    next();
  };
};

export const requireStoreAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthorizedException('请先登录');
  }

  if (req.user.role === UserRole.STORE && !req.user.storeId) {
    throw new ForbiddenException('该账号未关联门店');
  }

  next();
};
