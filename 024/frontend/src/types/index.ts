export type OperationType = 'inbound' | 'sale' | 'offline'
export type ProductStatus = 'active' | 'inactive'
export type ExpiryStatus = 'normal' | 'expiring' | 'expired'
export type OfflineReason = 'expired' | 'damaged' | 'expiring' | 'other'
export type LogType = '商品管理' | '分类管理' | '出入库管理' | '系统操作'
export type LogAction = '新增' | '修改' | '删除' | '入库' | '销售' | '下架'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  pagination?: PaginationInfo
  error?: string
  message?: string
}

export interface PaginationInfo {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface PaginationParams {
  page: number
  page_size: number
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  description?: string
  sort_order: number
  parent_name?: string
  product_count?: number
  children?: Category[]
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  barcode: string
  category_id: number
  category_name?: string
  brand?: string
  price: number
  cost_price?: number
  stock: number
  unit: string
  description?: string
  image_url?: string
  expiry_date?: string
  production_date?: string
  shelf_life_days?: number
  supplier?: string
  purchase_price?: number
  status: ProductStatus
  weight?: number
  expiry_status?: ExpiryStatus
  days_to_expiry?: number
  created_at: string
  updated_at: string
}

export interface InventoryRecord {
  id: number
  product_id: number
  product_name?: string
  barcode?: string
  operation_type: OperationType
  quantity: number
  before_stock: number
  after_stock: number
  supplier?: string
  unit_price?: number
  amount?: number
  reason?: string
  remark?: string
  operator: string
  created_at: string
}

export interface OperationLog {
  id: number
  type: LogType
  action: LogAction
  target: string
  details: string
  operator: string
  created_at: string
}

export interface ProductFilters {
  keyword?: string
  category_id?: number
  status?: ProductStatus
  min_stock?: number
  max_stock?: number
  min_price?: number
  max_price?: number
  is_expiring_soon?: boolean
}

export interface InventoryFilters {
  product_id?: number
  operation_type?: OperationType
  start_date?: string
  end_date?: string
}

export interface LogFilters {
  type?: LogType
  action?: LogAction
  target?: string
  operator?: string
  start_date?: string
  end_date?: string
}

export interface ProductStats {
  total: number
  low_stock: number
  expiring: number
  out_of_stock: number
}

export interface InventoryStats {
  inbound: { total: number; amount: number }
  sale: { total: number; amount: number }
  offline: { total: number }
}

export interface LogStats {
  today_count: number
  week_count: number
  type_stats: Array<{ type: LogType; count: number }>
  action_stats: Array<{ action: LogAction; count: number }>
}

export interface InboundFormData {
  product_id: number
  quantity: number
  supplier?: string
  purchase_price?: number
  remark?: string
}

export interface SaleFormData {
  product_id: number
  quantity: number
  sale_price?: number
  remark?: string
}

export interface OfflineFormData {
  product_id: number
  quantity: number
  reason: OfflineReason
  remark?: string
}
