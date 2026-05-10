import type { Product, ProductStatus, FilterParams, PaginatedResponse, InventoryOperationType, InventoryRecord, OperationType, PaginationParams } from './index'

export type {
  Product,
  ProductStatus,
  FilterParams,
  PaginatedResponse,
  InventoryOperationType,
  InventoryRecord,
  OperationType,
  PaginationParams
}

export interface ProductFormData {
  id?: string
  name: string
  categoryId: string
  barcode: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  unit: string
  manufacturer: string
  productionDate: string
  shelfLifeDays: number
  description: string
  image: string
}

export interface InventoryOperationForm {
  productId: string
  operationType: InventoryOperationType
  quantity: number
  operator: string
  remark: string
}

export interface StockStats {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  expiringCount: number
  expiredCount: number
}

export interface CategoryFormData {
  id?: string
  name: string
  icon: string
  description: string
  sort: number
}

export interface InventoryRecordFilterParams {
  productId: string
  operationType: string
  startTime: string
  endTime: string
}

export interface OperationLogFilterParams {
  operator: string
  operationType: string
  startTime: string
  endTime: string
}

export interface ExpiryValidationResult {
  valid: boolean
  message: string
  expiryDate: string
}

export interface ProductionValidationResult {
  valid: boolean
  message: string
}

export interface ShelfLifeValidationResult {
  valid: boolean
  message: string
}
