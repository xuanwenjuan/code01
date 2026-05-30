import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ResponseUtil } from '../utils/response';
import { UserRole, JwtPayload } from '../types';
import { User } from '../models';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'bakery_jwt_secret';

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
      return res.status(401).json(ResponseUtil.unauthorized('未提供认证令牌'));
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json(ResponseUtil.unauthorized('用户不存在或已禁用'));
    }

    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      storeId: user.storeId
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json(ResponseUtil.unauthorized('令牌已过期'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json(ResponseUtil.unauthorized('无效的令牌'));
    }
    return res.status(401).json(ResponseUtil.unauthorized('认证失败'));
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized('未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(ResponseUtil.forbidden('权限不足'));
    }

    next();
  };
};

export const requireStoreMatch = (storeIdField: string = 'storeId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.unauthorized('未认证'));
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    const requestStoreId = Number(req.body[storeIdField] || req.query[storeIdField] || req.params[storeIdField]);
    
    if (!req.user.storeId) {
      return res.status(403).json(ResponseUtil.forbidden('用户未分配门店'));
    }

    if (requestStoreId && requestStoreId !== req.user.storeId) {
      return res.status(403).json(ResponseUtil.forbidden('无权限操作其他门店的数据'));
    }

    if (!requestStoreId && req.body) {
      req.body.storeId = req.user.storeId;
    }

    next();
  };
};

export const requireOrderAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(ResponseUtil.unauthorized('未认证'));
  }

  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  if (req.user.role === UserRole.CUSTOMER) {
    if (req.body && !req.body.userId) {
      req.body.userId = req.user.userId;
    }
    return next();
  }

  if (req.user.role === UserRole.DELIVERY_RIDER) {
    return next();
  }

  if (req.user.storeId) {
    if (req.body) {
      req.body.storeId = req.user.storeId;
    }
    return next();
  }

  return res.status(403).json(ResponseUtil.forbidden('权限不足'));
};

export const requireSuperAdmin = requireRoles(UserRole.SUPER_ADMIN);
export const requireStoreManager = requireRoles(UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER);
export const requireStaff = requireRoles(UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.STORE_STAFF);
export const requireOperator = requireRoles(UserRole.SUPER_ADMIN, UserRole.STORE_MANAGER, UserRole.OPERATOR);
export const requireFinancial = requireRoles(UserRole.SUPER_ADMIN, UserRole.FINANCIAL);
export const requireRider = requireRoles(UserRole.SUPER_ADMIN, UserRole.DELIVERY_RIDER);
export const requireCustomer = requireRoles(UserRole.SUPER_ADMIN, UserRole.CUSTOMER);

export const requireFinanceAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(ResponseUtil.unauthorized('未认证'));
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.FINANCIAL) {
    return next();
  }

  return res.status(403).json(ResponseUtil.forbidden('财务数据访问权限不足'));
};

export const requireOperationAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(ResponseUtil.unauthorized('未认证'));
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.STORE_MANAGER || req.user.role === UserRole.OPERATOR) {
    return next();
  }

  return res.status(403).json(ResponseUtil.forbidden('运营管理权限不足'));
};
