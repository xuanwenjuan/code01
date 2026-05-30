export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  USER = 'user',
  AUNT = 'aunt',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_DISPATCH = 'pending_dispatch',
  DISPATCHED = 'dispatched',
  ACCEPTED = 'accepted',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REDISPATCHING = 'redispatching',
}

export enum AuntStatus {
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  FAILED = 'failed',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  ASSIGN = 'assign',
  SETTLE = 'settle',
  REVIEW = 'review',
  CANCEL = 'cancel',
}

export enum LogModule {
  AUTH = 'auth',
  CATEGORY = 'category',
  AUNT = 'aunt',
  ORDER = 'order',
  SETTLEMENT = 'settlement',
  SYSTEM = 'system',
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
  username: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuntFilterParams {
  skills?: string[];
  serviceScope?: string;
  status?: AuntStatus;
  keyword?: string;
  minRating?: number;
  maxRating?: number;
}

export interface CreateOrderParams {
  categoryId: number;
  serviceAddress: string;
  servicePhone: string;
  serviceTime: Date;
  serviceDuration: number;
  contactName: string;
  requirement?: string;
}

export interface SettlementParams {
  auntId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: SettlementStatus;
}

export interface CommissionConfig {
  rate: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface AuntIncomeSummary {
  auntId: number;
  auntName: string;
  totalOrders: number;
  totalAmount: number;
  totalCommission: number;
  netIncome: number;
  pendingAmount: number;
  settledAmount: number;
}