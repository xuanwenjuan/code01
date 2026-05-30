import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { BusinessException } from '../utils/response';
import { UserRole, RolePermissions } from '../constants';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: UserRole;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new BusinessException('未提供认证令牌', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role', 'status']
    });

    if (!user) {
      throw new BusinessException('用户不存在', 401);
    }

    if (user.status !== 'active') {
      throw new BusinessException('用户账号已被禁用', 403);
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new BusinessException('认证令牌已过期', 401);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new BusinessException('无效的认证令牌', 401);
    }
    throw error;
  }
};

export const authorize = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new BusinessException('用户未认证', 401);
    }

    const userPermissions = RolePermissions[req.user.role] || [];
    
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasPermission = permissions.some(perm => {
      const [module, action] = perm.split(':');
      return userPermissions.includes(`${module}:*`) || userPermissions.includes(perm);
    });

    if (!hasPermission) {
      throw new BusinessException('权限不足', 403);
    }

    next();
  };
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new BusinessException('用户未认证', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new BusinessException('角色权限不足', 403);
    }

    next();
  };
};

export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'username', 'role', 'status']
      });

      if (user && user.status === 'active') {
        req.user = {
          id: user.id,
          username: user.username,
          role: user.role
        };
      }
    } catch (error) {
      // 静默失败
    }
  }

  next();
};
