import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../exceptions/AppError';
import { UserRole } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('未提供有效的认证令牌');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthorizedError('认证令牌无效或已过期');
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('未登录');
    }
    
    if (!roles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError('权限不足，需要以下角色之一: ' + roles.join(', '));
    }
    
    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('需要管理员权限');
  }
  
  next();
};

export const requireSellerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  const allowedRoles = [UserRole.ADMIN, UserRole.SELLER];
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new ForbiddenError('需要卖家或管理员权限');
  }
  
  next();
};

export const requireOperatorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  const allowedRoles = [UserRole.ADMIN, UserRole.OPERATOR];
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new ForbiddenError('需要运营或管理员权限');
  }
  
  next();
};

export const requireFinanceOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  const allowedRoles = [UserRole.ADMIN, UserRole.FINANCE];
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new ForbiddenError('需要财务或管理员权限');
  }
  
  next();
};

export const checkOwnership = (getResourceOwnerId: (req: Request) => Promise<number | null>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('未登录');
    }
    
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }
    
    const ownerId = await getResourceOwnerId(req);
    
    if (ownerId === null || ownerId !== req.user.userId) {
      throw new ForbiddenError('无权访问此资源');
    }
    
    next();
  };
};

export const canAccessCommission = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  const allowedRoles = [UserRole.ADMIN, UserRole.FINANCE];
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new ForbiddenError('需要财务或管理员权限访问佣金数据');
  }
  
  next();
};

export const canManageAuctions = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new UnauthorizedError('未登录');
  }
  
  const allowedRoles = [UserRole.ADMIN, UserRole.OPERATOR, UserRole.SELLER];
  if (!allowedRoles.includes(req.user.role as UserRole)) {
    throw new ForbiddenError('需要运营、卖家或管理员权限管理竞拍');
  }
  
  next();
};

