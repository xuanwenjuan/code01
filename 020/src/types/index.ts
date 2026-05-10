export enum EquipmentCategoryType {
  AEROBIC = '有氧器材',
  STRENGTH = '力量器材',
  FLEXIBILITY = '柔韧器材',
  REHABILITATION = '康复器材',
  AUXILIARY = '辅助器材'
}

export interface EquipmentCategory {
  id: string
  name: EquipmentCategoryType | string
  description: string
  createdAt: string
  updatedAt: string
}

export enum EquipmentStatus {
  IN_STOCK = '库存',
  IN_USE = '使用中',
  MAINTENANCE = '维护中',
  SCRAPPED = '已报废'
}

export enum OperationType {
  STOCK_IN = '入库',
  STOCK_OUT = '领用',
  RETURN = '归还',
  SCRAP = '报废',
  CREATE = '创建',
  UPDATE = '更新',
  DELETE = '删除'
}

export interface Equipment {
  id: string
  name: string
  brand: string
  categoryId: string
  categoryName: string
  stockYear: number
  stock: number
  price: number
  condition: number
  lifeRemaining: number
  status: EquipmentStatus
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  operationTime: string
  operator: string
  content: string
  stockChange: number | null
  statusChange: EquipmentStatus | null
  operationType: OperationType
  equipmentId: string
  equipmentName: string
}

export interface FilterOptions {
  categoryId: string
  minStock: number
  maxStock: number
  minStockYear: number
  maxStockYear: number
  minCondition: number
  maxCondition: number
  minLifeRemaining: number
  maxLifeRemaining: number
}

export interface FormField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea'
  placeholder?: string
  options?: { label: string; value: string | number }[]
  required?: boolean
  min?: number
  max?: number
}

export interface ModalConfig {
  title: string
  width?: string
  visible: boolean
}
