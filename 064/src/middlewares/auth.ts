import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole, JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('认证令牌格式错误');
    }

    const token = parts[1];
    const payload = JwtUtil.verifyToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      next(error);
    } else {
      next(new UnauthorizedException('认证令牌无效或已过期'));
    }
  }
};

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    next();
  };
};

export const RoleGroups = {
  ALL_ADMINS: [
    UserRole.SUPER_ADMIN,
    UserRole.ACADEMIC_ADMIN,
    UserRole.FINANCE_ADMIN
  ],
  ACADEMIC_ROLES: [
    UserRole.SUPER_ADMIN,
    UserRole.ACADEMIC_ADMIN,
    UserRole.TEACHER
  ],
  FINANCE_ROLES: [
    UserRole.SUPER_ADMIN,
    UserRole.FINANCE_ADMIN
  ],
  TEACHER_ROLES: [
    UserRole.SUPER_ADMIN,
    UserRole.ACADEMIC_ADMIN,
    UserRole.TEACHER
  ],
  READ_ONLY: [
    UserRole.SUPER_ADMIN,
    UserRole.ACADEMIC_ADMIN,
    UserRole.FINANCE_ADMIN,
    UserRole.TEACHER
  ]
};

export const PermissionGuard = {
  canManageMajors: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canManageTeachers: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canManageStudents: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canManageEnrollments: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canApproveEnrollment: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canManagePayments: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN].includes(role);
  },
  canVerifyPayment: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.FINANCE_ADMIN].includes(role);
  },
  canManageClasses: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN].includes(role);
  },
  canManageLessons: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.TEACHER].includes(role);
  },
  canManageAttendance: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.TEACHER].includes(role);
  },
  canViewStatistics: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.FINANCE_ADMIN, UserRole.TEACHER].includes(role);
  },
  canManageUsers: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN].includes(role);
  },
  canViewLogs: (role: UserRole): boolean => {
    return [UserRole.SUPER_ADMIN].includes(role);
  }
};
