export enum UserRoleEnum {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  SUPPLIER = 'supplier',
  LEADER = 'leader',
  USER = 'user'
}

export enum PermissionEnum {
  CATEGORY_MANAGE = 'category:manage',
  PRODUCT_MANAGE = 'product:manage',
  LEADER_VIEW = 'leader:view',
  LEADER_AUDIT = 'leader:audit',
  ORDER_VIEW = 'order:view',
  ORDER_MANAGE = 'order:manage',
  COMMISSION_VIEW = 'commission:view',
  COMMISSION_SETTLE = 'commission:settle',
  COMMISSION_WITHDRAW = 'commission:withdraw',
  GROUPBUY_MANAGE = 'groupbuy:manage',
  LOG_VIEW = 'log:view',
  SYSTEM_CONFIG = 'system:config'
}

export const RolePermissions: Record<UserRoleEnum, PermissionEnum[]> = {
  [UserRoleEnum.ADMIN]: Object.values(PermissionEnum),
  [UserRoleEnum.OPERATOR]: [
    PermissionEnum.CATEGORY_MANAGE,
    PermissionEnum.PRODUCT_MANAGE,
    PermissionEnum.LEADER_VIEW,
    PermissionEnum.LEADER_AUDIT,
    PermissionEnum.ORDER_VIEW,
    PermissionEnum.ORDER_MANAGE,
    PermissionEnum.GROUPBUY_MANAGE
  ],
  [UserRoleEnum.FINANCE]: [
    PermissionEnum.LEADER_VIEW,
    PermissionEnum.ORDER_VIEW,
    PermissionEnum.COMMISSION_VIEW,
    PermissionEnum.COMMISSION_SETTLE,
    PermissionEnum.COMMISSION_WITHDRAW
  ],
  [UserRoleEnum.SUPPLIER]: [
    PermissionEnum.PRODUCT_MANAGE,
    PermissionEnum.ORDER_VIEW
  ],
  [UserRoleEnum.LEADER]: [
    PermissionEnum.ORDER_VIEW,
    PermissionEnum.COMMISSION_VIEW,
    PermissionEnum.COMMISSION_WITHDRAW
  ],
  [UserRoleEnum.USER]: []
};

export interface PaginatedQuery {
  page?: number;
  pageSize?: number;
}

export interface LeaderListQuery extends PaginatedQuery {
  status?: string;
  province?: string;
  city?: string;
  district?: string;
  keyword?: string;
  minCommissionRate?: number;
  maxCommissionRate?: number;
}

export interface OrderListQuery extends PaginatedQuery {
  status?: string;
  leaderId?: number;
  userId?: number;
  groupBuyId?: number;
  startDate?: string;
  endDate?: string;
  orderNo?: string;
}

export interface CommissionListQuery extends PaginatedQuery {
  status?: string;
  leaderId?: number;
  settlementPeriod?: string;
  startDate?: string;
  endDate?: string;
}

export interface GroupBuyListQuery extends PaginatedQuery {
  status?: string;
  leaderId?: number;
  productId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CommissionSettleParams {
  commissionIds: number[];
  settlementPeriod: string;
}

export interface CommissionWithdrawParams {
  commissionIds: number[];
  leaderId: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  traceId?: string;
}

export interface OperationLogData {
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  params?: string;
  ip?: string;
  userAgent?: string;
  status: number;
  errorMsg?: string;
  duration: number;
}

export enum LogModule {
  CATEGORY = 'category',
  PRODUCT = 'product',
  LEADER = 'leader',
  GROUPBUY = 'groupbuy',
  ORDER = 'order',
  COMMISSION = 'commission',
  AUTH = 'auth',
  SYSTEM = 'system'
}

export enum LogOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  AUDIT = 'audit',
  SETTLE = 'settle',
  WITHDRAW = 'withdraw',
  CANCEL = 'cancel',
  STATUS_CHANGE = 'status_change',
  LOCK = 'lock',
  COMPLETE = 'complete'
}
