export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  FINANCE = 'finance',
  MERCHANT = 'merchant',
  USER = 'user'
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

export enum ErrorCode {
  SUCCESS = 0,
  UNKNOWN_ERROR = 1000,
  VALIDATION_ERROR = 1001,
  UNAUTHORIZED = 1002,
  FORBIDDEN = 1003,
  NOT_FOUND = 1004,
  DUPLICATE_ERROR = 1005,
  BUSINESS_ERROR = 1006,
  INSUFFICIENT_STOCK = 1007,
  INVALID_STATUS = 1008
}

export interface ApiResponse<T = any> {
  code: ErrorCode;
  message: string;
  data?: T;
  timestamp: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: Role;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum ArtistStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum ProductType {
  NORMAL = 'normal',
  UNIQUE = 'unique',
  CUSTOM = 'custom'
}

export enum LogModule {
  AUTH = 'auth',
  CATEGORY = 'category',
  ARTIST = 'artist',
  PRODUCT = 'product',
  ORDER = 'order',
  SETTLEMENT = 'settlement',
  USER = 'user',
  SYSTEM = 'system'
}

export interface ArtistFilters {
  status?: ArtistStatus;
  keyword?: string;
  specialties?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  orderNo?: string;
  userId?: number;
  artistId?: number;
  page?: number;
  pageSize?: number;
}

export interface SettlementFilters {
  status?: SettlementStatus;
  artistId?: number;
  month?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductFilters {
  categoryId?: number;
  artistId?: number;
  keyword?: string;
  isActive?: boolean;
  sortBy?: 'sales' | 'price_asc' | 'price_desc' | 'newest';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface SettlementItem {
  orderItemId: number;
  orderNo: string;
  productName: string;
  orderAmount: number;
  platformFee: number;
  artistAmount: number;
}

export interface CreateOrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: CreateOrderItem[];
  shippingAddress?: string;
  shippingPhone?: string;
  shippingName?: string;
  customNote?: string;
}

export interface SettlementRule {
  platformFeeRate: number;
  artistShareRate: number;
  settlementCycle: 'monthly' | 'weekly' | 'daily';
  autoSettlement: boolean;
}

export interface StockLock {
  productId: number;
  quantity: number;
  orderId: number;
  lockedAt: Date;
  expiredAt: Date;
}

export interface UserEntity {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistEntity {
  id: number;
  userId: number;
  name: string;
  avatar?: string;
  bio?: string;
  specialties: string;
  style?: string;
  representativeWorks?: string;
  status: ArtistStatus;
  rejectionReason?: string;
  reviewedBy?: number;
  reviewedAt?: Date;
  joinedAt?: Date;
  totalSales: number;
  totalProducts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryEntity {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  path?: string;
  icon?: string;
  sortOrder: number;
  status: CategoryStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryEntity[];
}

export interface ProductEntity {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  artistId: number;
  price: number;
  stock: number;
  images?: string;
  coverImage?: string;
  isCustomizable: boolean;
  productType: ProductType;
  isActive: boolean;
  sortOrder: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress?: string;
  shippingPhone?: string;
  shippingName?: string;
  trackingNumber?: string;
  shippingCompany?: string;
  customNote?: string;
  paymentMethod?: string;
  paymentTime?: Date;
  shippingTime?: Date;
  receiveTime?: Date;
  cancelReason?: string;
  cancelTime?: Date;
  completedTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemEntity {
  id: number;
  orderId: number;
  productId: number;
  artistId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  platformFee?: number;
  artistAmount?: number;
  createdAt: Date;
}

export interface SettlementEntity {
  id: number;
  settlementNo: string;
  artistId: number;
  month: string;
  totalOrders: number;
  totalAmount: number;
  platformFee: number;
  artistAmount: number;
  status: SettlementStatus;
  confirmedAt?: Date;
  paidAt?: Date;
  paidBy?: number;
  remark?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationLogEntity {
  id: number;
  userId?: number;
  username?: string;
  module: LogModule;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: boolean;
  errorMessage?: string;
  duration: number;
  createdAt: Date;
}
