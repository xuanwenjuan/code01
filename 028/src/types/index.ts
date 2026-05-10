export type WarehouseType = 'normal' | 'cold' | 'dangerous'

export type LocationStatus = 'empty' | 'partial' | 'full'

export type InventoryStatus = 'pending-in' | 'on-shelf' | 'picking' | 'shipped'

export type OperationType = 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'inventory-check'

export type WarehouseStatus = 'active' | 'maintenance'

export type InboundOrderStatus = 'pending' | 'in-progress' | 'completed'

export type OutboundOrderStatus = 'pending' | 'picking' | 'shipped' | 'completed'

export type ElementTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface CapacityInfo {
  total: number
  used: number
  available: number
  percentage: number
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: WarehouseType
  capacity: number
  usedCapacity: number
  zones: WarehouseZone[]
  status: WarehouseStatus
  createdAt: string
}

export interface WarehouseZone {
  id: string
  code: string
  name: string
  warehouseId: string
  capacity: number
  usedCapacity: number
  temperature?: string
  specialRequirements?: string
}

export interface Location {
  id: string
  code: string
  warehouseId: string
  zoneId: string
  capacity: number
  currentQuantity: number
  status: LocationStatus
  reservedFor?: string
}

export interface Product {
  id: string
  code: string
  name: string
  category: string
  unit: string
  specification: string
  minStock: number
  maxStock: number
  description?: string
}

export interface Inventory {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  warehouseId: string
  warehouseName: string
  zoneId: string
  locationId: string
  locationCode: string
  quantity: number
  status: InventoryStatus
  batchNo: string
  productionDate: string
  expiryDate?: string
  inboundDate: string
  lastModified: string
}

export interface OperationLog {
  id: string
  operationType: OperationType
  operationTitle: string
  operator: string
  operatorRole: string
  operationTime: string
  details: string
  relatedProduct?: string
  relatedWarehouse?: string
  ipAddress: string
}

export interface InboundOrder {
  id: string
  orderNo: string
  supplier: string
  operator: string
  products: InboundProduct[]
  status: InboundOrderStatus
  createTime: string
  completeTime?: string
  remark?: string
}

export interface InboundProduct {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unit: string
  batchNo: string
  productionDate: string
  expiryDate?: string
}

export interface OutboundOrder {
  id: string
  orderNo: string
  customer: string
  operator: string
  products: OutboundProduct[]
  status: OutboundOrderStatus
  createTime: string
  completeTime?: string
  remark?: string
}

export interface OutboundProduct {
  productId: string
  productCode: string
  productName: string
  quantity: number
  unit: string
  pickedQuantity: number
}

export interface FilterParams {
  keyword?: string
  warehouseId?: string
  zoneId?: string
  category?: string
  status?: string
  startDate?: string
  endDate?: string
  operator?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface StatusOption {
  label: string
  value: string
}

export interface StockOperationOrder {
  id: string
  orderNo: string
  partner: string
  products: (InboundProduct | OutboundProduct)[]
  remark?: string
}

export interface InboundSubmitData {
  orderId: string
  warehouseId: string
  zoneId: string
  locationId: string
  operator: string
  remark?: string
}

export interface OutboundSubmitData {
  orderId: string
  operator: string
  pickedQuantities: Record<string, number>
  allPicked: boolean
  remark?: string
}
