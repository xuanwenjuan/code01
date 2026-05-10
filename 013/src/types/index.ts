export enum EquipmentCategory {
  CAMPING = 'camping',
  HIKING = 'hiking',
  CYCLING = 'cycling',
  WATER = 'water',
  PROTECTION = 'protection'
}

export const CategoryNames: Readonly<Record<EquipmentCategory, string>> = {
  [EquipmentCategory.CAMPING]: '露营类',
  [EquipmentCategory.HIKING]: '登山类',
  [EquipmentCategory.CYCLING]: '骑行类',
  [EquipmentCategory.WATER]: '水上类',
  [EquipmentCategory.PROTECTION]: '防护类'
} as const

export enum QualityLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NORMAL = 'normal',
  POOR = 'poor'
}

export const QualityLevelNames: Readonly<Record<QualityLevel, string>> = {
  [QualityLevel.EXCELLENT]: '优质',
  [QualityLevel.GOOD]: '良好',
  [QualityLevel.NORMAL]: '一般',
  [QualityLevel.POOR]: '较差'
} as const

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  RENTED = 'rented',
  SCRAPPED = 'scrapped'
}

export const EquipmentStatusNames: Readonly<Record<EquipmentStatus, string>> = {
  [EquipmentStatus.IN_STOCK]: '在库',
  [EquipmentStatus.RENTED]: '已租赁',
  [EquipmentStatus.SCRAPPED]: '已报废'
} as const

export enum OperationType {
  RENT = 'rent',
  RETURN = 'return',
  SCRAP = 'scrap',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  CATEGORY_CREATE = 'category_create',
  CATEGORY_UPDATE = 'category_update',
  CATEGORY_DELETE = 'category_delete',
  STOCK_ADJUST = 'stock_adjust',
  BATCH_SCRAP = 'batch_scrap',
  DATA_IMPORT = 'data_import',
  DATA_EXPORT = 'data_export'
}

export const OperationTypeNames: Readonly<Record<OperationType, string>> = {
  [OperationType.RENT]: '租赁',
  [OperationType.RETURN]: '归还',
  [OperationType.SCRAP]: '报废',
  [OperationType.CREATE]: '新增装备',
  [OperationType.UPDATE]: '更新装备',
  [OperationType.DELETE]: '删除装备',
  [OperationType.CATEGORY_CREATE]: '新增分类',
  [OperationType.CATEGORY_UPDATE]: '更新分类',
  [OperationType.CATEGORY_DELETE]: '删除分类',
  [OperationType.STOCK_ADJUST]: '库存调整',
  [OperationType.BATCH_SCRAP]: '批量报废',
  [OperationType.DATA_IMPORT]: '数据导入',
  [OperationType.DATA_EXPORT]: '数据导出'
} as const

export type EquipmentType = 'general' | 'mechanical'

export const EquipmentTypeNames: Readonly<Record<EquipmentType, string>> = {
  general: '通用类',
  mechanical: '机械类'
} as const

export interface Category {
  readonly id: string
  name: string
  readonly code: EquipmentCategory
  description: string
  readonly createdAt: string
  updatedAt: string
}

export interface Equipment {
  readonly id: string
  name: string
  brand: string
  categoryId: string
  categoryCode: EquipmentCategory
  equipmentType: EquipmentType
  entryYear: number
  stockQuantity: number
  minStockThreshold?: number
  scenarios: string
  qualityLevel: QualityLevel
  remainingLife?: number
  purchaseDate?: string
  lastMaintenanceDate?: string
  status: EquipmentStatus
  readonly createdAt: string
  updatedAt: string
  version?: number
}

export interface RentalRecord {
  readonly id: string
  equipmentId: string
  equipmentName: string
  quantity: number
  renter: string
  rentDate: string
  expectedReturnDate: string
  actualReturnDate?: string
  status: 'active' | 'returned' | 'overdue'
  notes?: string
  readonly createdAt: string
  updatedAt: string
}

export interface StatusChange {
  from: EquipmentStatus
  to: EquipmentStatus
}

export interface OperationLog {
  readonly id: string
  readonly operationTime: string
  operator: string
  operationContent: string
  equipmentId?: string
  equipmentName?: string
  categoryId?: string
  categoryName?: string
  stockChange?: number
  statusChange?: StatusChange
  readonly operationType: OperationType
  ip?: string
  deviceInfo?: string
}

export interface FilterConditions {
  categoryId?: string
  minStock?: number
  maxStock?: number
  minEntryYear?: number
  maxEntryYear?: number
  qualityLevel?: QualityLevel
  minRemainingLife?: number
  maxRemainingLife?: number
  status?: EquipmentStatus
  keyword?: string
  equipmentType?: EquipmentType
  sortBy?: 'name' | 'entryYear' | 'stockQuantity' | 'qualityLevel' | 'remainingLife'
  sortOrder?: 'asc' | 'desc'
}

export interface FormValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  message: string
  validator?: (value: unknown) => boolean | string
}

export interface FormErrors {
  [key: string]: string
}

export interface ModalConfig {
  title: string
  visible: boolean
  type: 'info' | 'confirm' | 'form' | 'warning' | 'danger'
  content?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

export interface Notification {
  readonly id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface StorageData {
  version: number
  timestamp: string
  categories: Category[]
  equipments: Equipment[]
  operationLogs: OperationLog[]
  rentalRecords: RentalRecord[]
}

export interface DataBackup {
  version: number
  createdAt: string
  data: StorageData
  description?: string
}

export interface AgingWarning {
  equipmentId: string
  equipmentName: string
  warningType: 'remainingLife' | 'entryYear' | 'quality'
  warningLevel: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
}

export type SelectOption<T extends string | number> = {
  value: T
  label: string
  disabled?: boolean
}

export interface AppConfig {
  dataVersion: number
  lastBackupTime?: string
  autoBackup: boolean
  backupInterval: number
  lowStockThreshold: number
  agingWarningYears: number
  criticalRemainingLife: number
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  dataVersion: 1,
  autoBackup: true,
  backupInterval: 24,
  lowStockThreshold: 3,
  agingWarningYears: 5,
  criticalRemainingLife: 1
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ReadonlyDeep<T> = {
  readonly [P in keyof T]: T[P] extends object ? ReadonlyDeep<T[P]> : T[P]
}
