export enum EquipmentCategoryCode {
  COMPUTER = 'computer',
  PRINTER = 'printer',
  PROJECTOR = 'projector',
  FURNITURE = 'furniture',
  SUPPLIES = 'supplies',
}

export type EquipmentCategory = EquipmentCategoryCode

export const EquipmentCategoryLabel: Record<EquipmentCategory, string> = {
  [EquipmentCategoryCode.COMPUTER]: '电脑类',
  [EquipmentCategoryCode.PRINTER]: '打印机类',
  [EquipmentCategoryCode.PROJECTOR]: '投影仪类',
  [EquipmentCategoryCode.FURNITURE]: '办公家具类',
  [EquipmentCategoryCode.SUPPLIES]: '耗材类',
}

export enum ConditionLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export const ConditionLevelLabel: Record<ConditionLevel, string> = {
  [ConditionLevel.EXCELLENT]: '优秀',
  [ConditionLevel.GOOD]: '良好',
  [ConditionLevel.FAIR]: '一般',
  [ConditionLevel.POOR]: '较差',
}

export const ConditionLevelBadge: Record<ConditionLevel, string> = {
  [ConditionLevel.EXCELLENT]: 'badge-success',
  [ConditionLevel.GOOD]: 'badge-info',
  [ConditionLevel.FAIR]: 'badge-warning',
  [ConditionLevel.POOR]: 'badge-danger',
}

export enum OperationType {
  RECEIVE = 'receive',
  RETURN = 'return',
  SCRAP = 'scrap',
}

export const OperationTypeLabel: Record<OperationType, string> = {
  [OperationType.RECEIVE]: '领用',
  [OperationType.RETURN]: '归还',
  [OperationType.SCRAP]: '报废',
}

export const OperationTypeBadge: Record<OperationType, string> = {
  [OperationType.RECEIVE]: 'badge-info',
  [OperationType.RETURN]: 'badge-success',
  [OperationType.SCRAP]: 'badge-danger',
}

export enum ModalType {
  CONFIRM = 'confirm',
  ALERT = 'alert',
  WARNING = 'warning',
}

export interface Category {
  id: string
  name: string
  code: EquipmentCategory
  description: string
  createdAt: string
  updatedAt: string
}

export interface Equipment {
  id: string
  name: string
  model: string
  categoryId: string
  categoryCode: EquipmentCategory
  purchaseYear: number
  stockQuantity: number
  availableQuantity: number
  department: string
  conditionLevel: ConditionLevel
  remainingLifespanYears: number
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  equipmentId: string
  equipmentName: string
  operationType: OperationType
  operator: string
  operationTime: string
  quantity: number
  previousStock: number
  newStock: number
  previousCondition: ConditionLevel | null
  newCondition: ConditionLevel | null
  remarks: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface ModalConfig {
  title: string
  type: ModalType
  message: string
  onConfirm?: () => void
  onCancel?: () => void
}

export type EquipmentFormData = Omit<Equipment, 'id' | 'availableQuantity' | 'createdAt' | 'updatedAt'>
export type CategoryFormData = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
export type LogFormData = Omit<OperationLog, 'id' | 'operationTime'>

export interface EquipmentFilters {
  categoryId: string
  conditionLevel: ConditionLevel | ''
  stockMin: string
  stockMax: string
  yearMin: string
  yearMax: string
  lifespanMin: string
  lifespanMax: string
}

export interface LogFilters {
  operationType: OperationType | ''
  operator: string
  equipmentName: string
}

export interface WarningEquipment {
  equipment: Equipment
  reasons: string[]
  level: 'high' | 'medium' | 'low'
}
