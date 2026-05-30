import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole } from '../models/User';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
        employeeId?: number;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('未提供有效的认证令牌');
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    
    if (!user.isActive) {
      throw new ForbiddenException('账户已被禁用，请联系管理员');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.message === 'Token已被注销') {
      throw new UnauthorizedException('认证令牌已注销，请重新登录');
    }
    throw new UnauthorizedException('认证令牌无效或已过期');
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未认证');
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenException('权限不足，需要以下角色之一: ' + roles.join(', '));
    }
    
    next();
  };
};

export const requireAllRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未认证');
    }
    
    const userRole = req.user.role as UserRole;
    const hasAllRoles = roles.every(role => role === userRole);
    
    if (!hasAllRoles) {
      throw new ForbiddenException('权限不足，需要以下所有角色: ' + roles.join(', '));
    }
    
    next();
  };
};

export const requireAdmin = requireRoles(UserRole.ADMIN);
export const requireManager = requireRoles(UserRole.MANAGER);
export const requireManagerOrAdmin = requireRoles(UserRole.ADMIN, UserRole.MANAGER);
export const requireEmployee = requireRoles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN);

export const requireEmployeeOwnerOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new UnauthorizedException('未认证');
  }
  
  const employeeId = parseInt(req.params.id);
  const isAdmin = req.user.role === UserRole.ADMIN;
  const isOwner = req.user.employeeId === employeeId;
  
  if (!isAdmin && !isOwner) {
    throw new ForbiddenException('权限不足，只能查看或修改自己的信息');
  }
  
  next();
};

export const requireOwnResourceOrAdmin = (resourceOwnerIdKey: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未认证');
    }
    
    const resourceOwnerId = parseInt((req.params as any)[resourceOwnerIdKey] || (req.body as any)[resourceOwnerIdKey]);
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isOwner = req.user.userId === resourceOwnerId;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('权限不足，只能操作自己的资源');
    }
    
    next();
  };
};

export const checkPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未认证');
    }
    
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.ADMIN]: ['*'],
      [UserRole.MANAGER]: [
        'employee:read',
        'employee:update',
        'attendance:read',
        'attendance:update',
        'leave:approve',
        'salary:read',
        'salary:update',
        'performance:create',
        'performance:update',
        'performance:read',
      ],
      [UserRole.EMPLOYEE]: [
        'employee:read:own',
        'attendance:read:own',
        'attendance:create:own',
        'leave:create:own',
        'leave:read:own',
        'salary:read:own',
        'performance:read:own',
      ],
    };
    
    const userRole = req.user.role as UserRole;
    const permissions = rolePermissions[userRole] || [];
    
    const hasPermission = permissions.includes('*') || 
      permissions.some(p => {
        if (p.endsWith(':*')) {
          const prefix = p.slice(0, -2);
          return permission.startsWith(prefix);
        }
        return p === permission;
      });
    
    if (!hasPermission) {
      throw new ForbiddenException(`权限不足，需要权限: ${permission}`);
    }
    
    next();
  };
};

export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.userId);
    
    if (user && user.isActive) {
      req.user = decoded;
    }
  } catch (error) {
  }
  
  next();
};
