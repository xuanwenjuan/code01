import { Response, NextFunction } from 'express';
import { UserRole } from '../models/User';
import { AuthRequest } from './auth.middleware';
import { ForbiddenException } from '../exceptions/HttpException';

export type PermissionType =
  | 'room:read'
  | 'room:write'
  | 'room:lock'
  | 'room:status'
  | 'reservation:read'
  | 'reservation:write'
  | 'reservation:cancel'
  | 'reservation:checkin'
  | 'reservation:checkout'
  | 'guest:read'
  | 'guest:write'
  | 'finance:read'
  | 'finance:refund'
  | 'finance:reconcile'
  | 'roomType:read'
  | 'roomType:write'
  | 'user:read'
  | 'user:write'
  | 'log:read';

const rolePermissions: Record<UserRole, PermissionType[]> = {
  [UserRole.ADMIN]: [
    'room:read',
    'room:write',
    'room:lock',
    'room:status',
    'reservation:read',
    'reservation:write',
    'reservation:cancel',
    'reservation:checkin',
    'reservation:checkout',
    'guest:read',
    'guest:write',
    'finance:read',
    'finance:refund',
    'finance:reconcile',
    'roomType:read',
    'roomType:write',
    'user:read',
    'user:write',
    'log:read'
  ],
  [UserRole.MANAGER]: [
    'room:read',
    'room:write',
    'room:lock',
    'room:status',
    'reservation:read',
    'reservation:write',
    'reservation:cancel',
    'reservation:checkin',
    'reservation:checkout',
    'guest:read',
    'guest:write',
    'finance:read',
    'finance:refund',
    'finance:reconcile',
    'roomType:read',
    'roomType:write',
    'user:read',
    'log:read'
  ],
  [UserRole.RECEPTIONIST]: [
    'room:read',
    'room:status',
    'reservation:read',
    'reservation:write',
    'reservation:cancel',
    'reservation:checkin',
    'reservation:checkout',
    'guest:read',
    'guest:write',
    'roomType:read'
  ],
  [UserRole.FINANCE]: [
    'room:read',
    'reservation:read',
    'guest:read',
    'finance:read',
    'finance:refund',
    'finance:reconcile'
  ]
};

export const permissionMiddleware = (...requiredPermissions: PermissionType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ForbiddenException('请先登录');
    }

    const userPermissions = rolePermissions[req.user.role] || [];

    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(`没有该操作的权限: ${requiredPermissions.join(', ')}`);
    }

    next();
  };
};

export const hasPermission = (userRole: UserRole, permission: PermissionType): boolean => {
  const userPermissions = rolePermissions[userRole] || [];
  return userPermissions.includes(permission);
};

export const getRolePermissions = (role: UserRole): PermissionType[] => {
  return rolePermissions[role] || [];
};
