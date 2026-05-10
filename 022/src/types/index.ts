export interface Category {
  id: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface Product {
  id: string
  name: string
  brand: string
  categoryId: string
  purchaseYear: number
  stock: number
  unitPrice: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  shelfLifeRemaining: number
  createdAt: string
  updatedAt: string
}

export type OperationType = 'inbound' | 'outbound' | 'damaged'

export interface OperationRecord {
  id: string
  operationType: OperationType
  operator: string
  productId: string
  productName: string
  categoryId: string
  quantity: number
  previousStock: number
  newStock: number
  previousCondition?: 'excellent' | 'good' | 'fair' | 'poor'
  newCondition?: 'excellent' | 'good' | 'fair' | 'poor'
  remark?: string
  createdAt: string
}

export interface FilterParams {
  categoryId?: string
  minStock?: number
  maxStock?: number
  purchaseYear?: number
  condition?: 'excellent' | 'good' | 'fair' | 'poor'
  minShelfLife?: number
  maxShelfLife?: number
  keyword?: string
}

export const CONDITION_LABELS: Record<string, string> = {
  excellent: '完好',
  good: '良好',
  fair: '一般',
  poor: '残次'
}

export const OPERATION_TYPE_LABELS: Record<string, string> = {
  inbound: '入库',
  outbound: '出库',
  damaged: '残次下架'
}

export const MAIN_CATEGORIES = [
  { id: 'writing', name: '书写类' },
  { id: 'office', name: '办公类' },
  { id: 'art', name: '美术类' },
  { id: 'storage', name: '收纳类' },
  { id: 'gift', name: '礼品类' }
]
