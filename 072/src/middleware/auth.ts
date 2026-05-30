import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';
import Department from '../models/Department';
import { AppError } from './errorHandler';
import { UserRole } from '../types';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    name: string;
    role: string;
    roleId: number;
    departmentId?: number;
    departmentName?: string;
    permissions: string[];
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError('未提供认证令牌', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Role, as: 'roleInfo' },
        { model: Department, as: 'department' }
      ]
    });

    if (!user) {
      throw new AppError('用户不存在', 401);
    }

    const roleData = user.get('roleInfo') as any;
    const departmentData = user.get('department') as any;

    req.user = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      roleId: user.roleId,
      departmentId: user.departmentId,
      departmentName: departmentData?.name,
      permissions: roleData?.permissions ? JSON.parse(roleData.permissions) : []
    };

    logger.info(`用户访问: ${user.name} - ${req.method} ${req.path}`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('令牌已过期', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('无效的令牌', 401));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('未认证', 401);
    }

    if (!roles.includes(req.user.role as UserRole)) {
      logger.warn(`权限不足: ${req.user.name} 尝试访问 ${req.path}, 需要角色: ${roles.join(', ')}`);
      throw new AppError('权限不足', 403);
    }

    next();
  };
};

export const requireDepartmentOrAdmin = (departmentIdField?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('未认证', 401);
    }

    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.user.role as UserRole);
    
    if (isAdmin) {
      return next();
    }

    if (req.user.role === UserRole.DEPARTMENT_MANAGER) {
      if (departmentIdField) {
        const requestDepartmentId = Number(req.body[departmentIdField] || req.query[departmentIdField] || req.params[departmentIdField]);
        if (requestDepartmentId && requestDepartmentId !== req.user.departmentId) {
          logger.warn(`部门越权: ${req.user.name} 尝试访问部门 ${requestDepartmentId} 的数据`);
          throw new AppError('您只能管理本部门的数据', 403);
        }
      }
      return next();
    }

    throw new AppError('权限不足', 403);
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('未认证', 401);
    }

    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.user.role as UserRole);
    
    if (isAdmin) {
      return next();
    }

    const hasPermission = permissions.some(permission => 
      req.user?.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn(`权限不足: ${req.user.name} 尝试访问 ${req.path}, 需要权限: ${permissions.join(', ')}`);
      throw new AppError('权限不足', 403);
    }

    next();
  };
};

export const checkDepartmentPermission = (departmentId: number | undefined, user: AuthRequest['user']): boolean => {
  if (!user) return false;
  
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role as UserRole);
  if (isAdmin) return true;

  if (user.role === UserRole.DEPARTMENT_MANAGER && user.departmentId === departmentId) {
    return true;
  }

  return false;
};

export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const user = await User.findByPk(decoded.id, {
      include: [
        { model: Role, as: 'roleInfo' },
        { model: Department, as: 'department' }
      ]
    });

    if (user) {
      const roleData = user.get('roleInfo') as any;
      const departmentData = user.get('department') as any;

      req.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        roleId: user.roleId,
        departmentId: user.departmentId,
        departmentName: departmentData?.name,
        permissions: roleData?.permissions ? JSON.parse(roleData.permissions) : []
      };
    }

    next();
  } catch (error) {
    next();
  }
};
