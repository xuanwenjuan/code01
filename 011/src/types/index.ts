export const STORAGE_VERSION = '1.0.0'

export enum CategoryType {
  笔类 = '笔类',
  本子类 = '本子类',
  文件收纳类 = '文件收纳类',
  绘图工具类 = '绘图工具类',
  办公耗材类 = '办公耗材类'
}

export const CATEGORY_TYPES = Object.values(CategoryType) as readonly CategoryType[]

export enum QualityLevel {
  优秀 = '优秀',
  良好 = '良好',
  一般 = '一般',
  待处理 = '待处理'
}

export const QUALITY_LEVELS = Object.values(QualityLevel) as readonly QualityLevel[]

export enum OperationType {
  领用 = '领用',
  归还 = '归还',
  过期处理 = '过期处理',
  新增 = '新增',
  修改 = '修改',
  删除 = '删除'
}

export const OPERATION_TYPES = Object.values(OperationType) as readonly OperationType[]

export enum ExpiryStatus {
  正常 = '正常',
  临期 = '临期',
  已过期 = '已过期'
}

export const EXPIRY_STATUS_OPTIONS = Object.values(ExpiryStatus) as readonly ExpiryStatus[]

export type UUID = string

export interface Timestamp {
  createdAt: string
  updatedAt: string
}

export interface Category extends Timestamp {
  id: UUID
  name: CategoryType
  description: string
}

export interface Stationery extends Timestamp {
  id: UUID
  name: string
  brand: string
  categoryId: UUID
  categoryName: CategoryType
  purchaseYear: number
  stockQuantity: number
  usedByClasses: string[]
  qualityLevel: QualityLevel
  expiryDate?: string
  expiryDaysLeft?: number
  isHighQuality: boolean
}

export interface StationeryFormData {
  name: string
  brand: string
  categoryId: UUID
  categoryName: CategoryType
  purchaseYear: number
  stockQuantity: number
  qualityLevel: QualityLevel
  expiryDate?: string
}

export interface OperationLog extends Timestamp {
  id: UUID
  operationTime: string
  operator: string
  operationContent: string
  stationeryId: UUID
  stationeryName: string
  stockChange: number
  previousStock: number
  newStock: number
  operationType: OperationType
  classUsed?: string
  categoryId?: UUID
  categoryName?: CategoryType
}

export interface LendFormData {
  stationeryId: UUID
  quantity: number
  operator: string
  classUsed: string
}

export interface ReturnFormData {
  stationeryId: UUID
  quantity: number
  operator: string
}

export interface FilterOptions {
  categoryId?: UUID
  stockQuantityMin?: number
  stockQuantityMax?: number
  purchaseYear?: number
  qualityLevel?: QualityLevel
  expiryStatus?: ExpiryStatus
  expiryDaysLeftMin?: number
  expiryDaysLeftMax?: number
  searchKeyword?: string
}

export interface FormValidation {
  valid: boolean
  errors: Record<string, string>
}

export interface StorageData {
  version: string
  categories: Category[]
  stationeries: Stationery[]
  logs: OperationLog[]
  lastSyncAt: string
}

export interface StatData {
  totalCategories: number
  totalStationeries: number
  totalStock: number
  highQualityCount: number
  expiringSoon: number
  expired: number
  totalOperations: number
}

export type ModalActionType = 'lend' | 'return' | 'expire' | 'add' | 'edit' | 'delete'

export interface ConfirmDialogData {
  title: string
  message: string
  confirmText: string
  confirmBtnClass?: string
  actionType: ModalActionType
}
