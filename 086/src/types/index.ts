export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DISPATCHER = 'dispatcher',
  AREA_ADMIN = 'area_admin',
  FINANCE = 'finance',
  WORKER = 'worker',
  CUSTOMER = 'customer'
}

export enum WorkerStatus {
  ON_DUTY = 'on_duty',
  RESTING = 'resting',
  BANNED = 'banned',
  BUSY = 'busy'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_ASSIGN = 'pending_assign',
  ASSIGNED = 'assigned',
  WORKER_ON_WAY = 'worker_on_way',
  IN_SERVICE = 'in_service',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded'
}

export enum ServiceCategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  WITHDRAWING = 'withdrawing',
  WITHDRAWN = 'withdrawn',
  FAILED = 'failed'
}

export enum LogModule {
  AUTH = 'auth',
  USER = 'user',
  SERVICE_CATEGORY = 'service_category',
  WORKER = 'worker',
  ORDER = 'order',
  SETTLEMENT = 'settlement',
  DISPATCH = 'dispatch',
  FINANCE = 'finance'
}

export enum LogOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  ASSIGN = 'assign',
  CANCEL = 'cancel',
  COMPLETE = 'complete',
  SETTLE = 'settle',
  WITHDRAW = 'withdraw',
  LOCK_SCHEDULE = 'lock_schedule',
  UNLOCK_SCHEDULE = 'unlock_schedule'
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  username: string;
  email?: string;
  phone?: string;
  managedAreas?: string[];
}

export interface WorkerSchedule {
  date: string;
  timeSlots: string[];
  isLocked: boolean;
  lockedOrderId?: string;
}

export interface WorkerFilterParams {
  status?: WorkerStatus;
  skills?: string[];
  serviceAreas?: string[];
  keyword?: string;
  ratingMin?: number;
  ratingMax?: number;
  serviceDate?: string;
  serviceTime?: string;
  page: number;
  pageSize: number;
}

export interface CommissionRule {
  categoryId: string;
  baseRate: number;
  tieredRates?: {
    orderCountMin: number;
    orderCountMax?: number;
    rate: number;
  }[];
  areaAdjustments?: {
    area: string;
    adjustmentRate: number;
  }[];
}

export interface SettlementDetail {
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  workerAmount: number;
  platformAmount: number;
  settlementDate: Date;
}
