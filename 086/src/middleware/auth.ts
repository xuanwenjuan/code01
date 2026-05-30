import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, JwtPayload } from '../types';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedException('未提供认证Token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException('Token已过期，请重新登录');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('无效的Token');
    }
    throw new UnauthorizedException('认证失败');
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException(`需要以下角色之一: ${roles.join(', ')}`);
    }

    next();
  };
};

export const requireAnyAdmin = requireRole(
  UserRole.SUPER_ADMIN,
  UserRole.AREA_ADMIN
);

export const requireDispatcher = requireRole(
  UserRole.SUPER_ADMIN,
  UserRole.DISPATCHER,
  UserRole.AREA_ADMIN
);

export const requireFinance = requireRole(
  UserRole.SUPER_ADMIN,
  UserRole.FINANCE
);

export const requireWorker = requireRole(
  UserRole.WORKER,
  UserRole.SUPER_ADMIN
);

export const requireCustomer = requireRole(
  UserRole.CUSTOMER,
  UserRole.SUPER_ADMIN
);

export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

export const requireAreaAdmin = requireRole(
  UserRole.SUPER_ADMIN,
  UserRole.AREA_ADMIN
);

export const checkAreaPermission = (getAreaId: (req: Request) => string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (req.user.role === UserRole.AREA_ADMIN && req.user.managedAreas) {
      const targetArea = getAreaId(req);
      const managedAreas = req.user.managedAreas;

      if (Array.isArray(targetArea)) {
        const hasPermission = targetArea.every(area => managedAreas.includes(area));
        if (!hasPermission) {
          throw new ForbiddenException('无权操作该区域的数据');
        }
      } else {
        if (!managedAreas.includes(targetArea)) {
          throw new ForbiddenException('无权操作该区域的数据');
        }
      }

      return next();
    }

    throw new ForbiddenException('无权操作该资源');
  };
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
      req.user = decoded;
    } catch (error) {
    }
  }

  next();
};
