import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ResponseUtil } from '../utils/response';
import { RoleCode } from '../constants/role';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    roleCode: RoleCode;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseUtil.unauthorized(res);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      roleCode: decoded.roleCode,
    };
    next();
  } catch (error) {
    return ResponseUtil.unauthorized(res);
  }
};

export const roleMiddleware = (...roles: RoleCode[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ResponseUtil.unauthorized(res);
    }
    if (!roles.includes(req.user.roleCode)) {
      return ResponseUtil.forbidden(res);
    }
    next();
  };
};
