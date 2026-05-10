export type ProductCategory = '食品类' | '饮料类' | '日用品类' | '洗漱类' | '零食类';

export const DEFAULT_CATEGORIES: ProductCategory[] = [
  '食品类',
  '饮料类',
  '日用品类',
  '洗漱类',
  '零食类'
];

export const CATEGORIES_REQUIRE_EXPIRATION: ProductCategory[] = [
  '食品类',
  '饮料类',
  '零食类'
];

export interface Category {
  readonly id: string;
  name: ProductCategory | string;
  description?: string;
  readonly createdAt: string;
  updatedAt?: string;
}

export type QualityLevel = '优质' | '良好' | '一般' | '次品';

export const QUALITY_LEVELS: readonly QualityLevel[] = ['优质', '良好', '一般', '次品'] as const;

export interface QualityLevelConfig {
  level: QualityLevel;
  value: number;
  label: string;
  color: string;
}

export const QUALITY_LEVEL_CONFIG: ReadonlyArray<QualityLevelConfig> = [
  { level: '优质', value: 4, label: '优质', color: '#2ecc71' },
  { level: '良好', value: 3, label: '良好', color: '#3498db' },
  { level: '一般', value: 2, label: '一般', color: '#f39c12' },
  { level: '次品', value: 1, label: '次品', color: '#e74c3c' }
];

export type ProductStatus = '正常' | '临期' | '紧急' | '已过期' | '已下架';

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  '正常', '临期', '紧急', '已过期', '已下架'
];

export interface Product {
  readonly id: string;
  name: string;
  supplier: string;
  categoryId: string;
  entryYear: number;
  stock: number;
  price: number;
  qualityLevel: QualityLevel;
  expirationDate?: string;
  status: ProductStatus;
  isDeleted: boolean;
  readonly createdAt: string;
  updatedAt: string;
  lastStockCheck?: string;
}

export type OperationType = '入库' | '出库' | '临期下架' | '商品创建' | '商品修改' | '商品删除';

export const OPERATION_TYPES: readonly OperationType[] = [
  '入库', '出库', '临期下架', '商品创建', '商品修改', '商品删除'
];

export interface OperationLog {
  readonly id: string;
  operationType: OperationType;
  productId: string;
  productName: string;
  operator: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  previousStatus?: ProductStatus;
  newStatus?: ProductStatus;
  content: string;
  readonly timestamp: string;
  note?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface LogStatistics {
  total: number;
  byType: Record<OperationType, number>;
  totalInboundQuantity: number;
  totalOutboundQuantity: number;
  totalOfflineQuantity: number;
  lastOperationDate: string | null;
  uniqueOperators: number;
}

export interface StockOperationResult {
  success: boolean;
  product: Product | null;
  log: OperationLog | null;
  errorMessage?: string;
}

export interface ValidationRule<T = unknown> {
  required?: boolean;
  requiredMessage?: string;
  min?: number;
  minMessage?: string;
  max?: number;
  maxMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: T) => string | null;
}

export interface UnknownData {
  [key: string]: unknown;
}

export interface FilterParams {
  categoryId?: string;
  minStock?: number;
  maxStock?: number;
  entryYear?: number;
  qualityLevel?: QualityLevel;
  minDaysLeft?: number;
  maxDaysLeft?: number;
  status?: ProductStatus;
  keyword?: string;
  sortBy?: 'name' | 'stock' | 'price' | 'expirationDate';
  sortOrder?: 'asc' | 'desc';
}

export interface ExpirationAlert {
  level: '正常' | '提醒' | '警告' | '危险';
  thresholdDays: number;
  message: string;
}

export const EXPIRATION_ALERTS: ReadonlyArray<ExpirationAlert> = [
  { level: '危险', thresholdDays: 7, message: '紧急：7天内过期' },
  { level: '警告', thresholdDays: 30, message: '警告：30天内过期' },
  { level: '提醒', thresholdDays: 90, message: '提醒：90天内过期' }
];

export interface AppSettings {
  expirationWarningDays: number;
  expirationEmergencyDays: number;
  lowStockThreshold: number;
  operatorName: string;
  autoCheckExpiration: boolean;
}

export const DEFAULT_APP_SETTINGS: Readonly<AppSettings> = {
  expirationWarningDays: 30,
  expirationEmergencyDays: 7,
  lowStockThreshold: 10,
  operatorName: '系统管理员',
  autoCheckExpiration: true
};

export interface StorageSchema<T> {
  version: number;
  data: T;
  lastUpdated: string;
}

export type PageRoute = 'stock' | 'products' | 'categories' | 'logs' | 'settings';

export const PAGE_ROUTES: readonly PageRoute[] = [
  'stock', 'products', 'categories', 'logs', 'settings'
];

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
}

export interface FormFieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}