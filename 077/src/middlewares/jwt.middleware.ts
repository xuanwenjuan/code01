import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/http.exception';
import { UserRole } from '../types';
import type { AuthRequest, ITokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedException('未提供认证令牌');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedException('认证令牌格式错误');
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ITokenPayload;
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedException('认证令牌已过期');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedException('无效的认证令牌');
    }
    throw new UnauthorizedException('认证失败');
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    if (!roles.includes(authReq.user.role)) {
      throw new ForbiddenException('无权访问该资源');
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireFinance = requireRole(UserRole.FINANCE, UserRole.ADMIN);

export const requireOperator = requireRole(UserRole.OPERATOR, UserRole.FINANCE, UserRole.ADMIN);

export default authenticateJWT;
