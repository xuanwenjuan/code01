export enum UserRole {
  ADMIN = 'admin',
  MATERIAL_ADMIN = 'material_admin',
  ENGRAVER = 'engraver',
  TYPESETTER = 'typesetter'
}

export enum MaterialStatus {
  SUFFICIENT = 'sufficient',
  NEED_RESTOCK = 'need_restock',
  EXPIRED = 'expired',
  LOCKED = 'locked',
  DAMAGED = 'damaged'
}

export enum MaterialGrade {
  PREMIUM = 'premium',
  HIGH = 'high',
  NORMAL = 'normal',
  STANDARD = 'standard'
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  TYPESETTING = 'typesetting',
  ENGRAVING = 'engraving',
  PRINTING = 'printing',
  BINDING = 'binding',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  SEALED = 'sealed'
}

export enum MaterialLockStatus {
  LOCKED = 'locked',
  RELEASED = 'released',
  CONSUMED = 'consumed'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  CONSUME = 'consume',
  WASTE = 'waste',
  COMPLETE = 'complete',
  CANCEL = 'cancel'
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
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
  username: string;
  role: UserRole;
  realName: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface MaterialFilterParams extends PaginationParams {
  categoryId?: number;
  status?: MaterialStatus;
  grade?: MaterialGrade;
  keyword?: string;
  origin?: string;
  minQuantity?: number;
  maxQuantity?: number;
  expireStart?: Date;
  expireEnd?: Date;
}
