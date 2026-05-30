import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { UnauthorizedException, ForbiddenException } from '../exceptions/http.exception';
import { UserRole, JwtPayload, OperationModule, OperationType } from '../types';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const PermissionLevel = {
  READ: 1,
  WRITE: 2,
  DELETE: 4,
  APPROVE: 8,
  ADMIN: 16,
  SUPER_ADMIN: 32
};

export const rolePermissions: Record<UserRole, number> = {
  [UserRole.INSPECTOR]: PermissionLevel.READ | PermissionLevel.WRITE,
  [UserRole.MAINTENANCE]: PermissionLevel.READ | PermissionLevel.WRITE,
  [UserRole.FINANCE]: PermissionLevel.READ | PermissionLevel.WRITE | PermissionLevel.APPROVE,
  [UserRole.DISTRICT_ADMIN]: PermissionLevel.READ | PermissionLevel.WRITE | PermissionLevel.DELETE | PermissionLevel.APPROVE,
  [UserRole.SUPER_ADMIN]: PermissionLevel.READ | PermissionLevel.WRITE | PermissionLevel.DELETE | PermissionLevel.APPROVE | PermissionLevel.ADMIN | PermissionLevel.SUPER_ADMIN
};

const moduleRolePermissions: Record<OperationModule, UserRole[]> = {
  [OperationModule.USER]: [UserRole.SUPER_ADMIN],
  [OperationModule.CATEGORY]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN],
  [OperationModule.SITE]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.MAINTENANCE],
  [OperationModule.WORK_ORDER]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.MAINTENANCE, UserRole.INSPECTOR],
  [OperationModule.CONSUMABLE]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.MAINTENANCE, UserRole.FINANCE],
  [OperationModule.SCHEDULE]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.MAINTENANCE],
  [OperationModule.INVENTORY]: [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.FINANCE]
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('缺少有效的认证令牌');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    
    logger.info(`用户认证成功 - 用户ID: ${decoded.userId}, 用户名: ${decoded.username}, 角色: ${decoded.role}, 请求: ${req.method} ${req.path}`);
    
    next();
  } catch (error) {
    logger.warn(`认证失败 - IP: ${req.ip}, 原因: ${(error as Error).message}`);
    throw new UnauthorizedException('认证令牌无效或已过期');
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`权限不足 - 用户: ${req.user.username}, 角色: ${req.user.role}, 需要角色: ${roles.join(',')}, 请求: ${req.method} ${req.path}`);
      throw new ForbiddenException('权限不足，无法执行此操作');
    }

    next();
  };
};

export const permissionMiddleware = (requiredPermission: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    const userPermission = rolePermissions[req.user.role];
    if ((userPermission & requiredPermission) !== requiredPermission) {
      logger.warn(`权限级别不足 - 用户: ${req.user.username}, 角色: ${req.user.role}, 需要权限级别: ${requiredPermission}, 拥有权限: ${userPermission}`);
      throw new ForbiddenException('权限级别不足，无法执行此操作');
    }

    next();
  };
};

export const superAdminOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedException('请先登录');
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    logger.warn(`超级管理员权限验证失败 - 用户: ${req.user.username}, 角色: ${req.user.role}`);
    throw new ForbiddenException('只有超级管理员可以执行此操作');
  }

  next();
};

export const districtAdminOrAboveMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedException('请先登录');
  }

  const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN];
  if (!allowedRoles.includes(req.user.role)) {
    logger.warn(`辖区管理员权限验证失败 - 用户: ${req.user.username}, 角色: ${req.user.role}`);
    throw new ForbiddenException('需要辖区管理员或以上权限');
  }

  next();
};

export const financeOrAboveMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedException('请先登录');
  }

  const allowedRoles = [UserRole.SUPER_ADMIN, UserRole.DISTRICT_ADMIN, UserRole.FINANCE];
  if (!allowedRoles.includes(req.user.role)) {
    logger.warn(`财务权限验证失败 - 用户: ${req.user.username}, 角色: ${req.user.role}`);
    throw new ForbiddenException('需要财务或以上权限');
  }

  next();
};

export const selfOrAdminMiddleware = (userIdField: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    const targetUserId = parseInt(req.params[userIdField] || req.body[userIdField]);
    
    if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.DISTRICT_ADMIN && req.user.userId !== targetUserId) {
      logger.warn(`越权操作尝试 - 操作人: ${req.user.username}, 目标用户ID: ${targetUserId}`);
      throw new ForbiddenException('只能操作自己的资源或拥有管理员权限');
    }

    next();
  };
};

export const districtDataPermissionMiddleware = (districtField: string = 'district') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (req.user.role === UserRole.DISTRICT_ADMIN && req.user.district) {
      if (!req.query[districtField]) {
        req.query[districtField] = req.user.district;
      } else if (req.query[districtField] !== req.user.district) {
        logger.warn(`辖区数据越权尝试 - 用户: ${req.user.username}, 用户辖区: ${req.user.district}, 请求辖区: ${req.query[districtField]}`);
        throw new ForbiddenException('只能访问自己辖区的数据');
      }
    }

    next();
  };
};

export const modulePermissionMiddleware = (module: OperationModule, operation: OperationType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('请先登录');
    }

    const allowedRoles = moduleRolePermissions[module];
    if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
      logger.warn(`模块权限不足 - 用户: ${req.user.username}, 模块: ${module}, 操作: ${operation}`);
      throw new ForbiddenException('没有该模块的操作权限');
    }

    next();
  };
};
