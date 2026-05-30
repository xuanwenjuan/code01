export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATION = 'operation',
  FINANCE = 'finance',
  USER = 'user',
}

export enum OrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PACKING = 'packing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDING = 'refunding',
  COMPLETED = 'completed',
}

export enum RefundType {
  CANCEL_UNSHIPPED = 'cancel_unshipped',
  RETURN_AFTER_DELIVERY = 'return_after_delivery',
}

export interface PaginatedRequest {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface OperationLogData {
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: number;
}

export type PermissionMatrix = Record<UserRole, string[]>;

export const PERMISSIONS: PermissionMatrix = {
  [UserRole.SUPER_ADMIN]: [
    'user:*',
    'category:*',
    'product:*',
    'order:*',
    'refund:*',
    'log:*',
    'system:*',
  ],
  [UserRole.OPERATION]: [
    'category:read',
    'category:write',
    'product:read',
    'product:write',
    'order:read',
    'order:write',
    'refund:read',
  ],
  [UserRole.FINANCE]: [
    'order:read',
    'refund:read',
    'refund:audit',
    'refund:write',
  ],
  [UserRole.USER]: [
    'order:read_own',
    'order:write_own',
    'refund:read_own',
    'refund:write_own',
    'address:*',
  ],
};
