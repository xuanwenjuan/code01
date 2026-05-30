export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  STORE_MANAGER = 'store_manager',
  STORE_STAFF = 'store_staff',
  OPERATOR = 'operator',
  FINANCIAL = 'financial',
  DELIVERY_RIDER = 'delivery_rider',
  CUSTOMER = 'customer'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  MAKING = 'making',
  READY = 'ready',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  TIMEOUT_CLOSED = 'timeout_closed'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SEASONAL_OFF = 'seasonal_off'
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRED = 'expired'
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  storeId?: number;
}

export interface RequestLog {
  id?: number;
  userId?: number;
  username?: string;
  ip?: string;
  method: string;
  url: string;
  params?: string;
  body?: string;
  response?: string;
  statusCode?: number;
  duration?: number;
  createdAt?: Date;
}
