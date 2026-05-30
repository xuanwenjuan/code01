import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import User from '../models/User';
import { UserRole, AuthUser } from '../types';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseUtil.unauthorized(res, '请先登录');
  }

  const token = authHeader.slice(7);

  try {
    const payload = JwtUtil.verifyToken(token);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return ResponseUtil.unauthorized(res, '用户不存在');
    }

    if (user.status !== 1) {
      return ResponseUtil.forbidden(res, '账号已被禁用');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    logger.info(`用户 ${user.username} 访问 ${req.method} ${req.path}`);
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return ResponseUtil.unauthorized(res, '登录已过期，请重新登录');
    }
    return ResponseUtil.unauthorized(res, 'Token 无效');
  }
};

export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const payload = JwtUtil.verifyToken(token);
      const user = await User.findByPk(payload.id);

      if (user && user.status === 1) {
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role,
        };
      }
    } catch {
      // token 无效时也继续，不强制登录
    }
  }

  next();
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return ResponseUtil.forbidden(res, '权限不足');
    }

    next();
  };
};

export const adminMiddleware = roleMiddleware(UserRole.ADMIN);
export const userMiddleware = roleMiddleware(UserRole.USER, UserRole.ADMIN);

export const checkResourceOwnerOrAdmin = (getIdFromReq: (req: Request) => number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    const resourceUserId = getIdFromReq(req);
    if (req.user.id === resourceUserId) {
      return next();
    }

    return ResponseUtil.forbidden(res, '只能操作自己的资源');
  };
};
