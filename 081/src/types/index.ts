export enum UserRole {
  HEADQUARTERS = 'headquarters',
  STORE = 'store',
  FINANCE = 'finance'
}

export enum PurchaseStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SHIPPED = 'shipped',
  RECEIVED = 'received'
}

export enum CooperationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

export enum InventoryOperationType {
  PURCHASE_IN = 'purchase_in',
  CONSUME = 'consume',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  ADJUST = 'adjust'
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  storeId?: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
