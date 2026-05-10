export enum FreshnessLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum OperationType {
  STOCK_IN = 'stock-in',
  STOCK_OUT = 'stock-out',
  EXPIRED_PROCESS = 'expired-process'
}

export enum StorageCondition {
  NORMAL = '常温保存',
  REFRIGERATED = '冷藏保存(0-4℃)',
  FROZEN = '冷冻保存(-18℃以下)',
  COOL_DRY = '阴凉干燥处',
  VENTILATED = '通风干燥处'
}

export enum ExpiryStatus {
  NORMAL = 'normal',
  NEARLY_EXPIRED = 'nearly-expired',
  EXPIRED = 'expired'
}

export type FreshnessLevelValue = 'excellent' | 'good' | 'normal' | 'low'

export type OperationTypeValue = 'stock-in' | 'stock-out' | 'expired-process'

export type ExpiryStatusValue = 'normal' | 'nearly-expired' | 'expired'

export type StorageConditionValue = '常温保存' | '冷藏保存(0-4℃)' | '冷冻保存(-18℃以下)' | '阴凉干燥处' | '通风干燥处'

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt?: string
}

export interface FoodItem {
  id: string
  name: string
  origin: string
  categoryId: string
  categoryName: string
  entryYear: number
  entryDate: string
  stockQuantity: number
  storageCondition: StorageConditionValue
  freshnessLevel: FreshnessLevelValue
  totalShelfLife: number
  remainingDays: number
  createdAt: string
  updatedAt: string
}

export type FoodItemForm = Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>

export type FoodItemUpdate = Partial<Omit<FoodItem, 'id' | 'createdAt'>>

export interface OperationLog {
  id: string
  operationTime: string
  operator: string
  operationContent: string
  foodItemId: string
  foodItemName: string
  stockChange: number
  operationType: OperationType
  notes?: string
  createdAt: string
}

export interface StockOperation {
  foodItemId: string
  foodItemName: string
  quantity: number
  operator: string
  operationType: OperationType
  notes?: string
}

export interface FilterOptions {
  categoryId?: string
  minStock?: number
  maxStock?: number
  minEntryYear?: number
  maxEntryYear?: number
  freshnessLevel?: FreshnessLevel
  minRemainingDays?: number
  maxRemainingDays?: number
  expiryStatus?: ExpiryStatus
  searchKeyword?: string
}

export interface FormField {
  name: string
  label: string
  value: string | number | boolean
  rules: ValidationRule[]
  error?: string
}

export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: unknown) => string | null
  message?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface DialogConfig {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger' | 'info'
  onConfirm?: () => void
  onCancel?: () => void
}

export interface AppConfig {
  version: string
  lastUpdated: string
  nearlyExpiredDays: number
  expiredDays: number
}

export interface StorageData<T> {
  data: T
  timestamp: number
  version: string
}

export type StorageKeys = 'fresh_food_categories' | 'fresh_food_items' | 'fresh_food_logs' | 'fresh_food_config'

export interface OperationResult<T = void> {
  success: boolean
  message: string
  data?: T
}

export interface FoodItemStats {
  totalItems: number
  totalStock: number
  normalItems: number
  nearlyExpiredItems: number
  expiredItems: number
  lowStockItems: number
}

export interface OperationLogFilter {
  operationType?: OperationType
  operator?: string
  foodItemId?: string
  startDate?: string
  endDate?: string
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export type DialogType = 'warning' | 'danger' | 'info'

export interface FoodItemWithExpiryStatus extends FoodItem {
  expiryStatus: ExpiryStatusValue
}

export interface StockOperationResult {
  success: boolean
  foodItemId: string
  foodItemName: string
  quantity: number
  operationType: OperationTypeValue
  newStock: number
  message: string
}

export interface ExpiryWarning {
  foodItemId: string
  foodItemName: string
  remainingDays: number
  categoryName: string
  stockQuantity: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface BatchOperationResult {
  success: boolean
  totalItems: number
  processedItems: number
  failedItems: string[]
  totalQuantity: number
  messages: string[]
}

export interface DateRange {
  startDate: string
  endDate: string
}

export interface StockRange {
  min: number
  max: number
}

export interface FoodItemFormData {
  name: string
  origin: string
  categoryId: string
  entryYear: number
  entryDate: string
  stockQuantity: number
  storageCondition: StorageConditionValue
  freshnessLevel: FreshnessLevelValue
  totalShelfLife: number
}

export interface StockOperationFormData {
  foodItemId: string
  quantity: number
  operator: string
  notes?: string
}
