export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  CUSTOMER_SERVICE = 'customer_service',
  WAREHOUSE_ADMIN = 'warehouse_admin',
  WAREHOUSE = 'warehouse',
  FINANCE = 'finance',
}

export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  AUDIT = 'audit',
  ALL = 'all',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PRODUCING = 'producing',
  QUALITY_CHECKING = 'quality_checking',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
  RETURNING = 'returning',
  RETURNED = 'returned',
  PARTIAL_RETURNED = 'partial_returned',
}

export enum MaterialStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOCKED = 'locked',
  DISCONTINUED = 'discontinued',
}

export enum MaterialType {
  FABRIC = 'fabric',
  FILLING = 'filling',
  HARDWARE = 'hardware',
  SIZE = 'size',
  OTHER = 'other',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

export enum LedgerStatus {
  DRAFT = 'draft',
  FINALIZED = 'finalized',
  REJECTED = 'rejected',
  ADJUSTED = 'adjusted',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  STOCK_LOCK = 'stock_lock',
  STOCK_UNLOCK = 'stock_unlock',
  RETURN = 'return',
  REFUND = 'refund',
  AUDIT = 'audit',
  EXPORT = 'export',
}

export enum LogModule {
  USER = 'user',
  CATEGORY = 'category',
  PRODUCT = 'product',
  MATERIAL = 'material',
  ORDER = 'order',
  LEDGER = 'ledger',
  SYSTEM = 'system',
}

export enum StockLockReason {
  ORDER_PRODUCTION = 'order_production',
  RESERVATION = 'reservation',
  QUALITY_CHECK = 'quality_check',
  OTHER = 'other',
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  realName: string;
  role: UserRole;
  department?: string;
}

export interface UserEntity {
  id: number;
  username: string;
  email?: string;
  realName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryEntity {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  status: CategoryStatus;
  description?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  children?: CategoryEntity[];
}

export interface ProductEntity {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  basePrice: number;
  description?: string;
  specifications?: Record<string, any>;
  isActive: boolean;
  sortOrder: number;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialEntity {
  id: number;
  batchNo: string;
  name: string;
  type: MaterialType;
  specification?: string;
  unit: string;
  stockQuantity: number;
  lockedQuantity: number;
  availableQuantity: number;
  warningThreshold: number;
  unitPrice: number;
  status: MaterialStatus;
  supplier?: string;
  remarks?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderEntity {
  id: number;
  orderNo: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  shippingAddress?: string;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  status: OrderStatus;
  logoDesign?: Record<string, any>;
  customRequirements?: string;
  sizeStatistics?: Record<string, any>;
  productionStartDate?: Date;
  productionEndDate?: Date;
  qualityCheckDate?: Date;
  shipDate?: Date;
  trackingNumber?: string;
  remarks?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemEntity {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  customFee: number;
  materialCost: number;
  totalPrice: number;
  returnedQuantity: number;
  sizeDetails?: Record<string, any>;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLogEntity {
  id: number;
  orderId: number;
  operatorId: number;
  operatorName: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  action: string;
  operationType: OperationType;
  description?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface StockLockEntity {
  id: number;
  materialId: number;
  orderId?: number;
  lockQuantity: number;
  lockReason: StockLockReason;
  lockedBy: number;
  lockedAt: Date;
  unlockedAt?: Date;
  isActive: boolean;
  remarks?: string;
}

export interface MaterialLogEntity {
  id: number;
  materialId: number;
  operatorId: number;
  operatorName: string;
  operationType: OperationType;
  previousQuantity?: number;
  newQuantity?: number;
  changeQuantity?: number;
  previousStatus?: MaterialStatus;
  newStatus?: MaterialStatus;
  description?: string;
  orderId?: number;
  ipAddress?: string;
  createdAt: Date;
}

export interface CategoryLogEntity {
  id: number;
  categoryId: number;
  operatorId: number;
  operatorName: string;
  operationType: OperationType;
  previousStatus?: CategoryStatus;
  newStatus?: CategoryStatus;
  description?: string;
  changedFields?: string[];
  ipAddress?: string;
  createdAt: Date;
}

export interface LedgerEntity {
  id: number;
  orderId: number;
  orderNo: string;
  companyName: string;
  totalRevenue: number;
  totalMaterialCost: number;
  totalCustomFee: number;
  processingCost: number;
  totalCost: number;
  profit: number;
  profitRate: number;
  materialLossRate: number;
  returnLoss: number;
  finalProfit: number;
  status: LedgerStatus;
  notes?: string;
  auditNotes?: string;
  createdBy: number;
  auditedBy?: number;
  auditedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerItemEntity {
  id: number;
  ledgerId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productCode: string;
  categoryId?: number;
  categoryName?: string;
  quantity: number;
  returnedQuantity: number;
  actualQuantity: number;
  unitPrice: number;
  unitMaterialCost: number;
  unitCustomFee: number;
  unitProcessingCost: number;
  unitTotalCost: number;
  unitProfit: number;
  totalMaterialCost: number;
  totalCustomFee: number;
  totalProcessingCost: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  returnLoss: number;
  sizeDetails?: Record<string, any>;
}

export interface ReturnRecordEntity {
  id: number;
  orderId: number;
  orderItemId: number;
  returnNo: string;
  returnQuantity: number;
  returnReason: string;
  returnType: 'full_return' | 'partial_return' | 'exchange';
  refundAmount: number;
  materialReturned: boolean;
  materialReturnQuantity?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  handledBy?: number;
  handledAt?: Date;
  remarks?: string;
  createdBy: number;
  createdAt: Date;
}

export interface MaterialListQuery {
  page?: number;
  pageSize?: number;
  name?: string;
  batchNo?: string;
  type?: MaterialType;
  status?: MaterialStatus;
  supplier?: string;
  minStock?: number;
  maxStock?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderListQuery {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  companyName?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StockOperationData {
  quantity: number;
  operation: 'in' | 'out';
  remarks?: string;
  orderId?: number;
}

export interface ProductionScheduleData {
  orderId: number;
  materialAllocations: {
    materialId: number;
    quantity: number;
    remarks?: string;
  }[];
  remarks?: string;
}

export interface ReturnApplicationData {
  orderId: number;
  items: {
    orderItemId: number;
    returnQuantity: number;
    returnReason: string;
  }[];
  returnType: 'full_return' | 'partial_return' | 'exchange';
  materialReturned: boolean;
  remarks?: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}
