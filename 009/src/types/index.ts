export type CategoryType = '奶粉类' | '洗护类' | '玩具类' | '服饰类' | '辅食类'

export type SecurityLevel = '高' | '中' | '低'

export type OperationType = '入库' | '出库' | '临期下架'

export type ProductStatus = '正常' | '临期' | '已下架'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  brand: string
  categoryId: string
  categoryName: string
  stockYear: number
  stockQuantity: number
  applicableMonths: string
  securityLevel: SecurityLevel
  shelfLifeDays: number
  productionDate: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  operationTime: string
  operator: string
  operationType: OperationType
  productName: string
  productId: string
  changeQuantity: number
  previousQuantity: number
  currentQuantity: number
  previousStatus: ProductStatus
  currentStatus: ProductStatus
  remark: string
}

export interface FilterParams {
  categoryId?: string
  minStock?: number
  maxStock?: number
  stockYear?: number
  securityLevel?: SecurityLevel
  minShelfLifeDays?: number
  maxShelfLifeDays?: number
  keyword?: string
}

export interface FormError {
  [key: string]: string
}

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'info' | 'warning' | 'danger'
}

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

export interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

export interface ToastMethods {
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

export interface CategoryFormData {
  name: string
  description: string
}

export interface ProductFormData {
  name: string
  brand: string
  categoryId: string
  categoryName: string
  stockYear: number
  stockQuantity: number
  applicableMonths: string
  securityLevel: SecurityLevel | ''
  shelfLifeDays: number
  productionDate: string
}

export interface StockOperationFormData {
  quantity: number
  remark: string
}

export interface ProductShelfLifeInfo {
  totalDays: number
  elapsedDays: number
  remainingDays: number
  isNearExpiry: boolean
  isExpired: boolean
}
