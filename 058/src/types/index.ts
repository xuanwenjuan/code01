export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  RIDER = 'rider'
}

export enum RiderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ONLINE = 'online',
  OFFLINE = 'offline',
  BANNED = 'banned'
}

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderType {
  BUY = 'buy',
  SEND = 'send',
  ERRAND = 'errand'
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  AUDIT = 'audit',
  CANCEL = 'cancel',
  CONFIRM = 'confirm'
}

export enum PriceRuleType {
  BASE = 'base',
  DISTANCE = 'distance',
  WEIGHT = 'weight',
  TIME = 'time',
  HOLIDAY = 'holiday',
  PEAK = 'peak'
}

export interface JwtPayload {
  id: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserEntity {
  id: number;
  username: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiderEntity {
  id: number;
  userId: number;
  realName: string;
  idCard: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  idCardFront: string;
  idCardBack: string;
  deliveryArea?: string;
  status: RiderStatus;
  canReceiveOrder: boolean;
  totalOrders: number;
  rating: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiderAuditLogEntity {
  id: number;
  riderId: number;
  auditorId?: number;
  status: RiderStatus;
  oldStatus?: RiderStatus;
  remark?: string;
  createdAt: Date;
}

export interface CategoryEntity {
  id: number;
  name: string;
  type: OrderType;
  description?: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  startTime?: string;
  endTime?: string;
  nightSurcharge: number;
  weightSurcharge: number;
  status: number;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceRuleEntity {
  type: PriceRuleType;
  name: string;
  amount: number;
  description?: string;
}

export interface PriceCalculationResult {
  baseAmount: number;
  distanceAmount: number;
  weightAmount: number;
  premiumAmount: number;
  discountAmount: number;
  totalAmount: number;
  platformFee: number;
  riderCommission: number;
  breakdown: PriceRuleEntity[];
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  userId: number;
  riderId?: number;
  categoryId: number;
  type: OrderType;
  title: string;
  description?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupContact: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryContact: string;
  deliveryPhone: string;
  distance: number;
  weight?: number;
  goodsValue?: number;
  baseAmount: number;
  premiumAmount: number;
  totalAmount: number;
  riderCommission: number;
  platformFee: number;
  status: OrderStatus;
  cancelReason?: string;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderTrackEntity {
  id: number;
  orderId: number;
  status: OrderStatus;
  location?: string;
  lat?: number;
  lng?: number;
  remark?: string;
  operatorId?: number;
  createdAt: Date;
}

export interface SettlementEntity {
  id: number;
  settlementNo: string;
  riderId: number;
  orderCount: number;
  totalAmount: number;
  riderCommission: number;
  platformFee: number;
  status: SettlementStatus;
  startDate: Date;
  endDate: Date;
  settledAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionBreakdown {
  orderId: number;
  orderNo: string;
  orderAmount: number;
  platformRate: number;
  platformFee: number;
  riderCommission: number;
  completedAt: Date;
}

export interface SettlementStatistics {
  totalCount: number;
  pendingCount: number;
  settledCount: number;
  totalAmount: number;
  totalCommission: number;
  totalPlatformFee: number;
  pendingAmount: number;
  settledAmount: number;
}

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  totalCommission: number;
  completionRate: number;
}

export interface OperationLogEntity {
  id: number;
  operatorId?: number;
  operatorName?: string;
  operationType: OperationType;
  module: string;
  recordId?: number;
  beforeData?: string;
  afterData?: string;
  remark?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}
