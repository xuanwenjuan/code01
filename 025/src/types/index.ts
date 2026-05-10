export type ProductStatus = 'normal' | 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired'

export type OperationType = 'add' | 'edit' | 'delete' | 'in_stock' | 'out_stock' | 'sale' | 'offline'

export type InventoryOperationType = 'in' | 'out' | 'sale' | 'offline'

export type StockStatus = 'normal' | 'low' | 'out'

export type ExpiryStatus = 'normal' | 'warning' | 'expired'

export type DialogMode = 'create' | 'edit'

export type TableSize = 'large' | 'default' | 'small'

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  sort: number
  createTime: string
  updateTime: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  barcode: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  unit: string
  manufacturer: string
  productionDate: string
  shelfLifeDays: number
  expiryDate: string
  status: ProductStatus
  description: string
  image: string
  createTime: string
  updateTime: string
}

export interface InventoryRecord {
  id: string
  productId: string
  productName: string
  categoryId: string
  categoryName: string
  operationType: InventoryOperationType
  operationTypeText: string
  quantity: number
  stockBefore: number
  stockAfter: number
  operator: string
  remark: string
  createTime: string
}

export interface OperationLog {
  id: string
  operationType: OperationType
  operationTypeText: string
  module: string
  targetId: string
  targetName: string
  operator: string
  detail: string
  ip: string
  createTime: string
}

export interface FilterParams {
  keyword: string
  categoryId: string
  status: ProductStatus | ''
  stockStatus: StockStatus | ''
  expiryStatus: ExpiryStatus | ''
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface FormDialogProps<T> {
  visible: boolean
  title: string
  mode: DialogMode
  data: T | null
}

export interface TableColumn<T> {
  prop: keyof T
  label: string
  width?: number
  fixed?: 'left' | 'right'
  sortable?: boolean
  formatter?: (row: T) => string
}

export interface ExpiryInfo {
  daysRemaining: number
  status: ExpiryStatus
  isExpired: boolean
  isExpiring: boolean
  displayText: string
}

export interface ValidationRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ('blur' | 'change')[]
  min?: number
  max?: number
  type?: 'string' | 'number' | 'date'
  validator?: (rule: object, value: unknown) => Promise<void> | void
}

export interface StatsCardData {
  value: number | string
  label: string
  type?: 'default' | 'warning' | 'success' | 'info' | 'danger'
}
