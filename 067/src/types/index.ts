export enum UserRole {
  USER = 'user',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  ADMIN = 'admin',
}

export enum Permission {
  SITE_VIEW = 'site:view',
  SITE_CREATE = 'site:create',
  SITE_UPDATE = 'site:update',
  SITE_DELETE = 'site:delete',
  PILE_VIEW = 'pile:view',
  PILE_CREATE = 'pile:create',
  PILE_UPDATE = 'pile:update',
  PILE_DELETE = 'pile:delete',
  PILE_MAINTENANCE = 'pile:maintenance',
  ORDER_VIEW = 'order:view',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_CANCEL = 'order:cancel',
  SETTLEMENT_VIEW = 'settlement:view',
  SETTLEMENT_CREATE = 'settlement:create',
  SETTLEMENT_CONFIRM = 'settlement:confirm',
  SETTLEMENT_EXPORT = 'settlement:export',
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  LOG_VIEW = 'log:view',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.ORDER_VIEW,
    Permission.ORDER_CREATE,
    Permission.ORDER_CANCEL,
  ],
  [UserRole.OPERATOR]: [
    Permission.SITE_VIEW,
    Permission.SITE_UPDATE,
    Permission.PILE_VIEW,
    Permission.PILE_CREATE,
    Permission.PILE_UPDATE,
    Permission.PILE_MAINTENANCE,
    Permission.ORDER_VIEW,
    Permission.ORDER_UPDATE,
    Permission.SETTLEMENT_VIEW,
    Permission.SETTLEMENT_CREATE,
  ],
  [UserRole.FINANCE]: [
    Permission.SITE_VIEW,
    Permission.PILE_VIEW,
    Permission.ORDER_VIEW,
    Permission.SETTLEMENT_VIEW,
    Permission.SETTLEMENT_CONFIRM,
    Permission.SETTLEMENT_EXPORT,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};

export enum SiteCategoryType {
  BUSINESS_DISTRICT = 'business_district',
  COMMUNITY = 'community',
  HIGHWAY_SERVICE_AREA = 'highway_service_area',
  INDUSTRIAL_PARK = 'industrial_park',
}

export enum ChargingPileStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  FAULT = 'fault',
  MAINTENANCE = 'maintenance',
}

export enum PowerType {
  AC_7KW = 'ac_7kw',
  AC_11KW = 'ac_11kw',
  DC_60KW = 'dc_60kw',
  DC_120KW = 'dc_120kw',
  DC_240KW = 'dc_240kw',
}

export enum OrderStatus {
  PENDING = 'pending',
  CHARGING = 'charging',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ABNORMAL = 'abnormal',
  SETTLED = 'settled',
}

export enum InvoiceStatus {
  NOT_REQUESTED = 'not_requested',
  REQUESTED = 'requested',
  ISSUED = 'issued',
  FAILED = 'failed',
}

export enum SettlementStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
}

export enum ChargeType {
  PEAK = 'peak',
  NORMAL = 'normal',
  VALLEY = 'valley',
}

export enum ErrorCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  VALIDATION_ERROR = 422,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  traceId?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface ChargingPileFilterParams extends PaginationParams, DateRangeParams {
  siteId?: number;
  status?: ChargingPileStatus;
  powerType?: PowerType;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilterParams extends PaginationParams, DateRangeParams {
  userId?: number;
  siteId?: number;
  pileId?: number;
  status?: OrderStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SettlementFilterParams extends PaginationParams, DateRangeParams {
  siteId?: number;
  status?: SettlementStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ChargeDetail {
  startTime: Date;
  endTime: Date;
  duration: number;
  energy: number;
  chargeType: ChargeType;
  electricityPrice: number;
  serviceFee: number;
  electricityAmount: number;
  serviceAmount: number;
  subtotal: number;
}

export interface SettlementDetail {
  orderId: number;
  orderNo: string;
  totalAmount: number;
  platformShare: number;
  platformShareRate: number;
  maintenanceShare: number;
  maintenanceShareRate: number;
  siteShare: number;
  siteShareRate: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OperationLogFilterParams extends PaginationParams, DateRangeParams {
  userId?: number;
  role?: UserRole;
  operationType?: string;
  method?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
