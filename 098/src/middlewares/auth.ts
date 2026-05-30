import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';
import { UnauthorizedException, ForbiddenException } from '../exceptions/HttpException';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('未提供认证令牌，请先登录');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    if (!decoded.userId || !decoded.username || !decoded.role) {
      throw new UnauthorizedException('无效的认证令牌');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException('认证令牌已过期，请重新登录');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('无效的认证令牌');
    }
    throw new UnauthorizedException('认证失败');
  }
};

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    if (!allowedRoles.includes(req.user.role)) {
      const roleMap: Record<UserRole, string> = {
        [UserRole.ADMIN]: '管理员',
        [UserRole.AREA_MANAGER]: '片区主管',
        [UserRole.PURCHASER]: '采购',
        [UserRole.MAINTENANCE_WORKER]: '养护员'
      };
      const allowedRoleNames = allowedRoles.map(r => roleMap[r]).join('、');
      throw new ForbiddenException(`权限不足，需要 ${allowedRoleNames} 角色才能访问`);
    }

    next();
  };
};

export const areaPermissionMiddleware = (areaIdField: string = 'areaId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    if (req.user.role === UserRole.AREA_MANAGER) {
      const requestAreaId = req.body[areaIdField] || req.query[areaIdField] || req.params[areaIdField];
      if (requestAreaId && Number(requestAreaId) !== req.user.areaId) {
        throw new ForbiddenException('您只能管理自己片区的数据');
      }
    }

    next();
  };
};
