import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ResponseUtil } from '../utils/response';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    roleId: number;
    departmentId: number;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return ResponseUtil.unauthorized(res);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseUtil.unauthorized(res);
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return ResponseUtil.unauthorized(res);
    }
    next();
  };
};