import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '../types/common';
import { User } from '../database/models/user.model';
import { Distributor } from '../database/models/distributor.model';
import { Order } from '../database/models/order.model';
import { Settlement } from '../database/models/settlement.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, '未提供有效的认证令牌');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const user = await User.findByPk(payload.id);
    if (!user) {
      return ApiResponse.unauthorized(res, '用户不存在');
    }

    if (!user.enabled) {
      return ApiResponse.forbidden(res, '账户已被禁用，请联系管理员');
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      distributorId: user.distributorId,
    };

    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, '认证令牌无效或已过期');
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, '请先登录');
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, '权限不足，无法执行此操作');
    }

    next();
  };
};

export const requireOneOfRoles = (...roles: UserRole[]) => {
  return authorize(...roles);
};

export const requireAllRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, '请先登录');
    }

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    const hasAllRoles = roles.every((role) => role === req.user.role);
    if (!hasAllRoles) {
      return ApiResponse.forbidden(res, '权限不足，无法执行此操作');
    }

    next();
  };
};

export const canAccessDistributorData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, '请先登录');
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
    return next();
  }

  const distributorId =
    Number(req.params.id) ||
    Number(req.query.distributorId) ||
    Number(req.body.distributorId);

  if (!distributorId) {
    return ApiResponse.forbidden(res, '需要指定分销商ID');
  }

  if (req.user.distributorId && req.user.distributorId === distributorId) {
    return next();
  }

  return ApiResponse.forbidden(res, '无权访问该分销商数据');
};

export const canAccessOrderData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, '请先登录');
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
    return next();
  }

  const orderId = Number(req.params.id);
  if (!orderId) {
    return ApiResponse.forbidden(res, '需要指定订单ID');
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    return ApiResponse.notFound(res, '订单不存在');
  }

  if (req.user.distributorId && order.distributorId === req.user.distributorId) {
    return next();
  }

  return ApiResponse.forbidden(res, '无权访问该订单数据');
};

export const canAccessSettlementData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return ApiResponse.unauthorized(res, '请先登录');
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
    return next();
  }

  if (req.user.role !== UserRole.FINANCE) {
    return ApiResponse.forbidden(res, '只有财务人员可以访问结算数据');
  }

  const settlementId = Number(req.params.id);
  if (settlementId) {
    const settlement = await Settlement.findByPk(settlementId);
    if (!settlement) {
      return ApiResponse.notFound(res, '结算单不存在');
    }
  }

  next();
};

export const filterDistributorData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next();
  }

  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.ADMIN) {
    return next();
  }

  if (req.user.distributorId) {
    req.query.distributorId = String(req.user.distributorId);
    req.body.distributorId = req.user.distributorId;
  }

  next();
};
