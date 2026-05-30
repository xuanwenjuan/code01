// 全局枚举类型定义
export type CategoryStatus = 'enabled' | 'disabled'
export type InventoryStatus = 'on_sale' | 'off_sale'
export type DealerType = 'store' | 'agent' | 'distributor'
export type DealerLevel = 'A' | 'B' | 'C' | 'D'
export type DealerStatus = 'active' | 'inactive' | 'archived'
export type OrderStatus = 'pending' | 'approved' | 'shipped' | 'delivered' | 'completed' | 'cancelled'

// 基础实体类型
export interface BaseEntity {
  id: string
  createTime: string
  updateTime?: string
}

// 设备分类类型
export interface DeviceCategory extends BaseEntity {
  name: string
  parentId: string | null
  level: number
  sort: number
  status: CategoryStatus
  children?: DeviceCategory[]
}

// 设备库存类型
export interface DeviceInventory extends BaseEntity {
  categoryId: string
  categoryName: string
  model: string
  specs: string
  houseType: string
  purchasePrice: number
  retailPrice: number
  stock: number
  warningThreshold: number
  status: InventoryStatus
}

// 经销商类型
export interface Dealer extends BaseEntity {
  name: string
  type: DealerType
  level: DealerLevel
  discount: number
  contactPerson: string
  phone: string
  address: string
  cooperationStart: string
  cooperationEnd: string
  status: DealerStatus
}

// 订单商品项类型
export interface OrderItem {
  deviceId: string
  deviceName: string
  categoryId: string
  categoryName: string
  model: string
  quantity: number
  unitPrice: number
  subtotal: number
}

// 订单类型
export interface Order extends BaseEntity {
  orderNo: string
  customerName: string
  customerPhone: string
  customerAddress: string
  dealerId?: string
  dealerName?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  logisticsCompany?: string
  trackingNumber?: string
  remark?: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页参数类型
export interface PageParams {
  page: number
  pageSize: number
}

// 分页结果类型
export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 选择项类型
export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

// 树选项类型
export interface TreeOption {
  id: string
  label: string
  children?: TreeOption[]
  disabled?: boolean
}

// 状态映射配置类型
export interface StatusConfig {
  label: string
  type: 'success' | 'warning' | 'danger' | 'info' | 'primary'
}

// 弹窗配置类型
export interface DialogConfig {
  visible: boolean
  title: string
  width?: string
  loading?: boolean
}

// 表格列配置类型
export interface TableColumnConfig {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: boolean | 'left' | 'right'
  showOverflowTooltip?: boolean
}

// 发货信息类型
export interface ShipInfo {
  logisticsCompany: string
  trackingNumber: string
}

// 设备筛选条件类型
export interface InventoryFilterParams {
  categoryId: string
  model: string
  specs: string
  houseType: string
  status: string
  minStock: number
  maxStock: number
}

// 全局状态常量
export const CATEGORY_STATUS_MAP: Record<CategoryStatus, StatusConfig> = {
  enabled: { label: '启用', type: 'success' },
  disabled: { label: '停用', type: 'info' }
}

export const INVENTORY_STATUS_MAP: Record<InventoryStatus, StatusConfig> = {
  on_sale: { label: '在售', type: 'success' },
  off_sale: { label: '下架', type: 'info' }
}

export const DEALER_TYPE_MAP: Record<DealerType, StatusConfig> = {
  store: { label: '线下门店', type: 'primary' },
  agent: { label: '线上代理商', type: 'success' },
  distributor: { label: '分销渠道', type: 'warning' }
}

export const DEALER_LEVEL_MAP: Record<DealerLevel, StatusConfig> = {
  A: { label: 'A级', type: 'danger' },
  B: { label: 'B级', type: 'warning' },
  C: { label: 'C级', type: 'primary' },
  D: { label: 'D级', type: 'info' }
}

export const DEALER_STATUS_MAP: Record<DealerStatus, StatusConfig> = {
  active: { label: '合作中', type: 'success' },
  inactive: { label: '暂停合作', type: 'warning' },
  archived: { label: '已归档', type: 'info' }
}

export const ORDER_STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  pending: { label: '待审核', type: 'warning' },
  approved: { label: '已审核', type: 'primary' },
  shipped: { label: '已发货', type: 'info' },
  delivered: { label: '已送达', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

export const HOUSE_TYPES: SelectOption[] = [
  { label: '一室一厅', value: '一室一厅' },
  { label: '两室一厅', value: '两室一厅' },
  { label: '三室一厅', value: '三室一厅' },
  { label: '三室两厅', value: '三室两厅' },
  { label: '四室两厅', value: '四室两厅' },
  { label: '别墅', value: '别墅' }
]

export const LOGISTICS_COMPANIES: SelectOption[] = [
  { label: '顺丰速运', value: '顺丰速运' },
  { label: '京东物流', value: '京东物流' },
  { label: '中通快递', value: '中通快递' },
  { label: '圆通速递', value: '圆通速递' },
  { label: '韵达快递', value: '韵达快递' }
]
