import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('请先登录', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('请先登录', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('权限不足', 403));
    }

    next();
  };
};

export const Permission = {
  COURSE_CATEGORY: {
    VIEW: 'course_category:view',
    CREATE: 'course_category:create',
    UPDATE: 'course_category:update',
    DELETE: 'course_category:delete'
  },
  TEACHER: {
    VIEW: 'teacher:view',
    CREATE: 'teacher:create',
    UPDATE: 'teacher:update',
    DELETE: 'teacher:delete',
    RATE: 'teacher:rate'
  },
  STUDENT: {
    VIEW: 'student:view',
    CREATE: 'student:create',
    UPDATE: 'student:update',
    DELETE: 'student:delete',
    ENROLL: 'student:enroll'
  },
  CLASS: {
    VIEW: 'class:view',
    CREATE: 'class:create',
    UPDATE: 'class:update',
    DELETE: 'class:delete',
    ATTENDANCE: 'class:attendance'
  }
} as const;

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission.COURSE_CATEGORY),
    ...Object.values(Permission.TEACHER),
    ...Object.values(Permission.STUDENT),
    ...Object.values(Permission.CLASS)
  ],
  [UserRole.ADMIN]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.COURSE_CATEGORY.CREATE,
    Permission.COURSE_CATEGORY.UPDATE,
    Permission.TEACHER.VIEW,
    Permission.TEACHER.CREATE,
    Permission.TEACHER.UPDATE,
    Permission.TEACHER.RATE,
    Permission.STUDENT.VIEW,
    Permission.STUDENT.CREATE,
    Permission.STUDENT.UPDATE,
    Permission.STUDENT.ENROLL,
    Permission.CLASS.VIEW,
    Permission.CLASS.CREATE,
    Permission.CLASS.UPDATE,
    Permission.CLASS.ATTENDANCE
  ],
  [UserRole.TEACHER]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.CLASS.VIEW,
    Permission.CLASS.ATTENDANCE
  ],
  [UserRole.STAFF]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.STUDENT.CREATE,
    Permission.STUDENT.UPDATE,
    Permission.STUDENT.ENROLL,
    Permission.CLASS.VIEW
  ]
};

export const hasPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('请先登录', 401));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return next(new AppError('权限不足', 403));
    }

    next();
  };
};

export const hasAnyPermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('请先登录', 401));
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    const hasPermission = permissions.some(p => userPermissions.includes(p));
    
    if (!hasPermission) {
      return next(new AppError('权限不足', 403));
    }

    next();
  };
};

export const getRolePermissions = (role: UserRole): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

