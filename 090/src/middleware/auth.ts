import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, AdminRole, Permission, RolePermissions, RoleHierarchy } from '../types';
import { ResponseUtil } from '../utils/response';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import Admin from '../models/Admin';

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
      throw new UnauthorizedError('请先登录');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;

    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      throw new UnauthorizedError('用户不存在');
    }

    if (admin.status !== 1) {
      throw new ForbiddenError('账号已被禁用');
    }

    req.user = {
      id: admin.id,
      username: admin.username,
      realName: admin.realName,
      role: admin.role as AdminRole,
      storeId: admin.storeId || undefined,
      storeName: undefined
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(ResponseUtil.unauthorized(null, 'Token无效'));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(ResponseUtil.unauthorized(null, 'Token已过期'));
    }
    next(error);
  }
};

export const hasRole = (...roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('无权限执行此操作');
    }

    next();
  };
};

export const hasPermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('请先登录');
    }

    const userPermissions = RolePermissions[req.user.role] || [];
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));

    if (!hasAllPermissions) {
      throw new ForbiddenError('无权限执行此操作');
    }

    next();
  };
};

export const hasRoleLevel = (minimumRole: AdminRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('请先登录');
    }

    const userLevel = RoleHierarchy[req.user.role] || 0;
    const requiredLevel = RoleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      throw new ForbiddenError('无权限执行此操作');
    }

    next();
  };
};

export const checkStorePermission = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('请先登录');
  }

  if (req.user.role === AdminRole.SUPER_ADMIN) {
    return next();
  }

  const storeId = 
    Number(req.body.storeId) || 
    Number(req.query.storeId) || 
    Number(req.params.storeId);

  if (storeId && req.user.storeId && req.user.storeId !== storeId) {
    throw new ForbiddenError('无权限操作其他门店数据');
  }

  next();
};

export const requireSuperAdmin = hasRole(AdminRole.SUPER_ADMIN);
export const requireStoreManagerOrAbove = hasRoleLevel(AdminRole.STORE_MANAGER);
export const requireRentalStaffOrAbove = hasRoleLevel(AdminRole.RENTAL_STAFF);
export const requireMaintenanceTechnicianOrAbove = hasRoleLevel(AdminRole.MAINTENANCE_TECHNICIAN);
export const requireFinanceStaffOrAbove = hasRoleLevel(AdminRole.FINANCE_STAFF);
