export type CategoryType = 'food' | 'snack' | 'grooming' | 'toy' | 'daily'

export const categoryNames: Record<CategoryType, string> = {
  food: '粮食类',
  snack: '零食类',
  grooming: '洗护类',
  toy: '玩具类',
  daily: '日用品类'
}

export interface Category {
  id: string
  name: string
  code: CategoryType
  description: string
  createdAt: string
  updatedAt: string
}

export type PetType = 'dog' | 'cat' | 'fish' | 'bird' | 'hamster' | 'other'

export const petTypeNames: Record<PetType, string> = {
  dog: '犬类',
  cat: '猫类',
  fish: '鱼类',
  bird: '鸟类',
  hamster: '仓鼠类',
  other: '其他'
}

export type QualityLevel = 'A' | 'B' | 'C'

export const qualityLevelNames: Record<QualityLevel, string> = {
  A: '高品质',
  B: '标准品质',
  C: '一般品质'
}

export const qualityLevelDescriptions: Record<QualityLevel, string> = {
  A: '顶级品质，需要重点管控',
  B: '标准品质，正常管理',
  C: '一般品质，注意库存周转'
}

export type ProductStatus = 'normal' | 'expiring_soon' | 'removed'

export const productStatusNames: Record<ProductStatus, string> = {
  normal: '正常',
  expiring_soon: '临期',
  removed: '已下架'
}

export interface Product {
  id: string
  name: string
  brand: string
  categoryId: string
  categoryCode: CategoryType
  stockYear: number
  stockQuantity: number
  applicablePetType: PetType
  qualityLevel: QualityLevel
  expirationDate?: string
  createdAt: string
  updatedAt: string
  status: ProductStatus
}

export type OperationType = 'inbound' | 'outbound' | 'expired_remove'

export const operationTypeNames: Record<OperationType, string> = {
  inbound: '入库',
  outbound: '出库',
  expired_remove: '临期下架'
}

export const operationTypeDescriptions: Record<OperationType, string> = {
  inbound: '商品入库登记',
  outbound: '商品出库售卖',
  expired_remove: '临期商品下架处理'
}

export interface OperationLog {
  id: string
  operationTime: string
  operator: string
  operationType: OperationType
  productId: string
  productName: string
  categoryId: string
  categoryCode: CategoryType
  quantityChange: number
  beforeStock: number
  afterStock: number
  remark: string
  statusAfter: ProductStatus
}

export interface InventoryStats {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  expiringCount: number
  highQualityCount: number
}

export interface ProductFilters {
  categoryId: string
  categoryCode: CategoryType | ''
  stockRange: '' | 'low' | 'normal' | 'high'
  stockYear: string
  qualityLevel: QualityLevel | ''
  expirationStatus: '' | 'expiring' | 'expired' | 'safe'
  status: ProductStatus | ''
  searchKeyword: string
}

export interface LogFilters {
  operationType: OperationType | ''
  categoryCode: CategoryType | ''
  operator: string
  startDate: string
  endDate: string
}

export type StockRangeType = 'low' | 'normal' | 'high'
export type ExpirationStatusType = 'expiring' | 'expired' | 'safe'

export interface SelectOption<T = string> {
  value: T
  label: string
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

export type FormFieldError = string | null

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface StorageResult<T> {
  success: boolean
  data?: T
  error?: string
}