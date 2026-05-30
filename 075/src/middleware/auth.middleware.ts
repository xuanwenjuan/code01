
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';
import { UnauthorizedError, ForbiddenError } from '../utils/response';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('未提供有效的身份验证令牌');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findOne({
      where: { id: decoded.userId, isActive: true },
      attributes: ['id', 'username', 'realName', 'role', 'department']
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在或已被禁用');
    }

    req.user = {
      userId: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role as UserRole,
      department: user.department
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('无效的身份验证令牌'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('身份验证令牌已过期'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未进行身份验证');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('权限不足，无法执行此操作');
    }

    next();
  };
};

export const requireSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('未进行身份验证');
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenError('需要超级管理员权限');
  }

  next();
};

export const requireAssetAdminOrSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('未进行身份验证');
  }

  if (
    req.user.role !== UserRole.SUPER_ADMIN &&
    req.user.role !== UserRole.ASSET_ADMIN
  ) {
    throw new ForbiddenError('需要资产管理员或超级管理员权限');
  }

  next();
};

export const requireDepartmentHeadOrAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('未进行身份验证');
  }

  if (
    req.user.role !== UserRole.SUPER_ADMIN &&
    req.user.role !== UserRole.ASSET_ADMIN &&
    req.user.role !== UserRole.DEPARTMENT_HEAD
  ) {
    throw new ForbiddenError('需要部门负责人或管理员权限');
  }

  next();
};

export const requireSameDepartmentOrAdmin = (
  getDepartmentFromRequest: (req: Request) => string | undefined
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('未进行身份验证');
    }

    if (
      req.user.role === UserRole.SUPER_ADMIN ||
      req.user.role === UserRole.ASSET_ADMIN
    ) {
      return next();
    }

    const resourceDepartment = getDepartmentFromRequest(req);
    if (req.user.role === UserRole.DEPARTMENT_HEAD && 
        req.user.department === resourceDepartment) {
      return next();
    }

    throw new ForbiddenError('只能操作本部门的资源');
  };
};
