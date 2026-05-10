export type CategoryType = 'ornament' | 'stationery' | 'clothing' | 'decoration' | 'gift'

export interface Category {
  id: string
  code: CategoryType
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export type ProcessLevel = 'A' | 'B' | 'C'

export type ProductStatus = 'active' | 'offline'

export interface Product {
  id: string
  name: string
  designer: string
  categoryId: string
  categoryCode: CategoryType
  year: number
  stock: number
  scenes: string
  processLevel: ProcessLevel
  shelfLifeRemaining?: number
  isExpired: boolean
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type OperationType = 'inbound' | 'outbound' | 'expired_offline'

export interface StockUpdateResult {
  success: boolean
  previousStock: number
  newStock: number
  product?: Product
}

export interface OperationLog {
  id: string
  productId: string
  productName: string
  operator: string
  operationType: OperationType
  content: string
  stockChange: number
  previousStock: number
  newStock: number
  statusChange?: { previous: ProductStatus; new: ProductStatus }
  timestamp: string
}

export interface FilterConditions {
  categoryId?: string
  minStock?: number
  maxStock?: number
  year?: number
  processLevel?: ProcessLevel
  minShelfLife?: number
  maxShelfLife?: number
  keyword?: string
}

export interface ValidationRule {
  field: string
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  message: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface ModalConfig {
  visible: boolean
  title: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export interface NumberInputConfig {
  value: number
  min?: number
  max?: number
  integer?: boolean
}
