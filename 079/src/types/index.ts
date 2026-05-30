export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATION = 'operation',
  FINANCE = 'finance',
  DEALER = 'dealer',
  WAREHOUSE = 'warehouse',
  SALES = 'sales'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  ALLOCATING = 'allocating',
  SHIPPED = 'shipped',
  SIGNED = 'signed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum CategoryType {
  LIQUOR = 'liquor',
  TEA = 'tea',
  TONIC = 'tonic',
  CULTURAL = 'cultural'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
  ALL = 'all'
}

export enum SettlementStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  COMPLETED = 'completed'
}

export enum CooperationStatus {
  ACTIVE = 'active',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

export enum StockLockType {
  ORDER = 'order',
  RESERVATION = 'reservation',
  TRANSFER = 'transfer'
}

export enum StockLockStatus {
  LOCKED = 'locked',
  RELEASED = 'released',
  CONSUMED = 'consumed'
}

export enum OperationModule {
  CATEGORY = 'category',
  BRAND = 'brand',
  PRODUCT = 'product',
  SUPPLIER = 'supplier',
  ORDER = 'order',
  SETTLEMENT = 'settlement',
  DEALER = 'dealer',
  USER = 'user',
  STOCK = 'stock'
}

export enum OperationAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  CANCEL = 'cancel',
  CONFIRM = 'confirm',
  SHIP = 'ship',
  SIGN = 'sign',
  SETTLE = 'settle'
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
  success: boolean
  timestamp: number
  requestId?: string
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface JwtPayload {
  userId: number
  username: string
  role: UserRole
  dealerId?: number
  iat?: number
  exp?: number
}

export interface AuthRequest extends Express.Request {
  user?: JwtPayload
}

export interface StockLockItem {
  productId: number
  quantity: number
  lockType: StockLockType
  orderId?: number
  operatorId?: number
  expiredAt?: Date
}

export interface RebateRule {
  level: number
  minAmount: number
  maxAmount?: number
  rebateRate: number
  description?: string
}

export interface SettlementPeriod {
  type: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: Date
  endDate: Date
}

export interface IUser {
  id: number
  username: string
  realName: string
  phone: string
  email?: string
  role: UserRole
  avatar?: string
  status: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IDealer {
  id: number
  userId: number
  companyName?: string
  businessLicense?: string
  contactAddress?: string
  creditLimit: number
  currentBalance: number
  rebateRate: number
  totalPurchaseAmount: number
  level: number
  status: boolean
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

export interface ICategory {
  id: number
  name: string
  type: CategoryType
  parentId?: number
  level: number
  sortOrder: number
  icon?: string
  description?: string
  season: Season
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  children?: ICategory[]
}

export interface ISupplier {
  id: number
  name: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  licenseNumber?: string
  businessLicense?: string
  authorizationCert?: string
  cooperationStartDate?: Date
  cooperationEndDate?: Date
  minOrderAmount: number
  rating: number
  status: boolean
  remarks?: string
  cooperationStatus?: CooperationStatus
  createdAt: Date
  updatedAt: Date
}

export interface IBrand {
  id: number
  name: string
  supplierId: number
  logo?: string
  description?: string
  origin?: string
  authorizationLevel?: string
  authorizationStartDate?: Date
  authorizationEndDate?: Date
  sortOrder: number
  status: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IProduct {
  id: number
  name: string
  code: string
  categoryId: number
  brandId: number
  supplierId: number
  specification?: string
  unit: string
  purchasePrice: number
  wholesalePrice: number
  retailPrice?: number
  stock: number
  lockedStock: number
  availableStock: number
  minOrderQuantity: number
  image?: string
  images?: string
  description?: string
  isHot: boolean
  isNew: boolean
  status: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface IStockLock {
  id: number
  productId: number
  orderId?: number
  lockType: StockLockType
  lockQuantity: number
  lockStatus: StockLockStatus
  operatorId?: number
  expiredAt?: Date
  lockedAt: Date
  unlockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IOrder {
  id: number
  orderNo: string
  dealerId: number
  totalAmount: number
  productAmount: number
  discountAmount: number
  shippingFee: number
  paidAmount: number
  rebateAmount?: number
  status: OrderStatus
  paymentMethod?: string
  paymentTime?: Date
  shippingAddress: string
  shippingContact: string
  shippingPhone: string
  trackingNumber?: string
  shippingTime?: Date
  signedTime?: Date
  cancelledTime?: Date
  cancelledReason?: string
  operatorId?: number
  remarks?: string
  settlementId?: number
  createdAt: Date
  updatedAt: Date
}

export interface IOrderItem {
  id: number
  orderId: number
  productId: number
  productName: string
  productCode: string
  productImage?: string
  specification?: string
  unit: string
  unitPrice: number
  quantity: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface ISettlement {
  id: number
  settlementNo: string
  dealerId: number
  startDate: Date
  endDate: Date
  totalOrderAmount: number
  totalRebateAmount: number
  totalSettlementAmount: number
  paidAmount: number
  status: SettlementStatus
  operatorId?: number
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

export interface IOperationLog {
  id: number
  userId?: number
  username?: string
  module: OperationModule
  action: OperationAction
  method?: string
  url?: string
  ip?: string
  params?: string
  result?: string
  status: boolean
  errorMsg?: string
  duration?: number
  createdAt: Date
}

export interface OrderCreateData {
  items: { productId: number; quantity: number }[]
  shippingAddress: string
  shippingContact: string
  shippingPhone: string
  remarks?: string
}

export interface SettlementCreateData {
  dealerId: number
  startDate: Date
  endDate: Date
}

export interface ProductFilterParams {
  categoryId?: number
  brandId?: number
  supplierId?: number
  categoryType?: CategoryType
  isActive?: boolean
  isHot?: boolean
  isNew?: boolean
  keyword?: string
  minPrice?: number
  maxPrice?: number
}

export interface SupplierFilterParams {
  cooperationStatus?: CooperationStatus
  status?: boolean
  keyword?: string
  minRating?: number
}

export interface BrandFilterParams {
  supplierId?: number
  categoryId?: number
  status?: boolean
  keyword?: string
}
