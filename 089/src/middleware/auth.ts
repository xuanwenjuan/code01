import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/error';
import { UserRole, JwtPayload } from '../types';
import logger from '../config/logger';

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
      throw new UnauthorizedError('未提供有效的认证令牌');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      if (!decoded.userId || !decoded.username || !decoded.role) {
        throw new UnauthorizedError('认证令牌格式无效');
      }

      if (!Object.values(UserRole).includes(decoded.role)) {
        throw new ForbiddenError('用户角色无效');
      }

      req.user = decoded;
      
      logger.info(`用户认证成功: ${decoded.username} (${decoded.role})`, {
        userId: decoded.userId,
        path: req.path,
        method: req.method
      });
      
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('认证令牌已过期，请重新登录');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('认证令牌无效');
      }
      throw new UnauthorizedError('认证失败');
    }
  } catch (error) {
    next(error);
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('请先登录');
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`权限不足: 用户 ${req.user.username} (${req.user.role}) 尝试访问需要 ${roles.join(',')} 权限的接口`, {
          path: req.path,
          method: req.method
        });
        throw new ForbiddenError('权限不足，无法执行此操作');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = requireRoles(UserRole.ADMIN);
export const requireResearcher = requireRoles(UserRole.ADMIN, UserRole.RESEARCHER);
export const requireCultivator = requireRoles(UserRole.ADMIN, UserRole.CULTIVATOR);
export const requireQC = requireRoles(UserRole.ADMIN, UserRole.QC);