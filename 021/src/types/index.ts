export const CATEGORY_TYPES = ['护肤类', '彩妆类', '香氛类', '工具类', '洗护类'] as const

export type CategoryType = typeof CATEGORY_TYPES[number]

export const PRODUCT_STATUSES = ['正常', '临期', '已下架'] as const

export type ProductStatus = typeof PRODUCT_STATUSES[number]

export const OPERATION_TYPES = ['入库', '出库', '临期下架', '编辑', '删除'] as const

export type OperationType = typeof OPERATION_TYPES[number]

export const STOCK_OPERATION_TYPES = ['入库', '出库', '临期下架'] as const

export type StockOperationType = typeof STOCK_OPERATION_TYPES[number]

export const PURITY_LEVELS = [
  { value: 0, label: '普通级', min: 0, max: 80 },
  { value: 1, label: '优质级', min: 80, max: 90 },
  { value: 2, label: '高纯度', min: 90, max: 95 },
  { value: 3, label: '极高纯度', min: 95, max: 100 }
] as const

export type PurityLevel = typeof PURITY_LEVELS[number]['value']

export interface ProductCategory {
  id: string
  name: string
  parentId: string | null
  type: CategoryType
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  brand: string
  categoryId: string
  categoryName: string
  parentCategoryName: string
  parentCategoryType: CategoryType
  purchaseYear: number
  currentStock: number
  unitPrice: number
  purity: number
  remainingShelfLife: number
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  operator: string
  operationType: OperationType
  productId: string
  productName: string
  details: string
  stockChange: number
  previousStock: number
  newStock: number
  previousStatus: string
  newStatus: string
  operatedAt: string
}

export interface StockOperationRecord {
  id: string
  productId: string
  productName: string
  operationType: StockOperationType
  quantity: number
  operator: string
  reason: string
  totalAmount?: number
  operatedAt: string
}

export interface FilterCriteria {
  categoryId?: string
  parentCategoryType?: CategoryType | ''
  minStock?: number
  maxStock?: number
  purchaseYear?: number
  minPurity?: number
  maxPurity?: number
  minRemainingShelfLife?: number
  maxRemainingShelfLife?: number
  keyword?: string
  status?: ProductStatus | ''
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  options?: { value: string | number; label: string }[]
  min?: number
  max?: number
  step?: number
}

export interface ValidationRule {
  field: string
  message: string
  validator: (value: unknown) => boolean
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

export interface NearExpiryAlert {
  product: Product
  warningLevel: 'normal' | 'urgent' | 'critical'
  message: string
}
