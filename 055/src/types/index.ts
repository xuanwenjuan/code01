// 状态枚举
export enum Status {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

// 合作状态枚举
export enum CooperationStatus {
  COOPERATING = 'cooperating',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// 采购订单状态枚举
export enum PurchaseOrderStatus {
  PENDING = 'pending',
  DELIVERING = 'delivering',
  RECEIVED = 'received',
  REJECTED = 'rejected'
}

// 客户订单状态枚举
export enum CustomerOrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// 客户类型枚举
export enum CustomerType {
  SUPERMARKET = 'supermarket',
  STORE = 'store',
  GROUPBUY = 'groupbuy'
}

// 类目层级枚举
export enum CategoryLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2
}

// 通用基础实体
export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

// 生鲜品类类目
export interface Category extends BaseEntity {
  name: string
  parentId: number | null
  level: CategoryLevel
  sort: number
  status: Status
  children?: Category[]
}

// 产地货源供应商
export interface Supplier extends BaseEntity {
  name: string
  origin: string
  contactPerson: string
  phone: string
  qualification: string
  supplyCycle: string
  deliveryRange: string
  cooperationStatus: CooperationStatus
  contractExpireDate: string
  remark?: string
}

// 采购订货单项
export interface PurchaseOrderItem {
  categoryId: number
  categoryName: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}

// 采购订货单
export interface PurchaseOrder extends BaseEntity {
  orderNo: string
  items: PurchaseOrderItem[]
  supplierId: number
  supplierName: string
  totalAmount: number
  orderDate: string
  expectedDate: string
  actualDate?: string
  status: PurchaseOrderStatus
  defectiveQuantity?: number
  remark?: string
}

// 客户订单项
export interface OrderItem {
  categoryId: number
  categoryName: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
}

// 客户配送订单
export interface CustomerOrder extends BaseEntity {
  orderNo: string
  customerName: string
  customerType: CustomerType
  deliveryArea: string
  deliveryAddress: string
  contactPerson: string
  phone: string
  items: OrderItem[]
  totalAmount: number
  orderDate: string
  deliveryDate: string
  status: CustomerOrderStatus
  progress: number
  remark?: string
}

// API响应
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页结果
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 表单弹窗属性
export interface FormDialogProps<T> {
  visible: boolean
  title: string
  formData: Partial<T>
  width?: string
}

// 搜索表单子项
export interface SearchField {
  label: string
  prop: string
  type: 'input' | 'select' | 'date' | 'daterange'
  options?: { label: string; value: string | number }[]
  placeholder?: string
}
