import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ResponseUtil } from '../utils/response';
import Role from '../models/Role';

export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEPT_MANAGER = 'DEPT_MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export const roleMiddleware = (allowedRoles: RoleCode[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return ResponseUtil.unauthorized(res);
    }

    const userRole = await Role.findByPk(user.roleId);
    if (!userRole) {
      return ResponseUtil.forbidden(res, '用户角色不存在');
    }

    if (!allowedRoles.includes(userRole.code as RoleCode)) {
      return ResponseUtil.forbidden(res, '权限不足，无法执行此操作');
    }

    next();
  };
};

export const departmentMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user) {
    return ResponseUtil.unauthorized(res);
  }

  const targetDepartmentId = req.body.departmentId || req.query.departmentId || req.params.departmentId;
  
  if (!targetDepartmentId) {
    return next();
  }

  if (user.departmentId !== parseInt(targetDepartmentId)) {
    return ResponseUtil.forbidden(res, '只能操作本部门的数据');
  }

  next();
};

export const checkPermission = (roleCodes: RoleCode[]) => {
  return [roleMiddleware(roleCodes)];
};