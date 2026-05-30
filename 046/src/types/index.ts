export interface DrinkCategory {
  id: string
  name: string
  icon?: string
  children?: DrinkCategory[]
}

export interface DrinkSpec {
  name: string
  options: string[]
}

export interface Drink {
  id: string
  name: string
  categoryId: string
  categoryName: string
  price: number
  originalPrice?: number
  image?: string
  description?: string
  specs: DrinkSpec[]
  isOnSale: boolean
  createTime: string
  updateTime: string
}

export type EmployeeStatus = 'active' | 'inactive' | 'vacation'
export type EmployeePosition = 'manager' | 'barista' | 'cashier' | 'cleaner'

export const EmployeeStatusMap: Record<EmployeeStatus, string> = {
  active: '在职',
  inactive: '离职',
  vacation: '休假'
}

export const EmployeePositionMap: Record<EmployeePosition, string> = {
  manager: '店长',
  barista: '调饮师',
  cashier: '收银员',
  cleaner: '保洁员'
}

export interface Employee {
  id: string
  name: string
  phone: string
  position: EmployeePosition
  positionName: string
  storeId: string
  storeName: string
  status: EmployeeStatus
  statusName: string
  avatar?: string
  hireDate: string
  schedule: string[]
  createTime: string
}

export type OrderStatus = 'pending' | 'making' | 'ready' | 'completed' | 'cancelled'
export type OrderType = 'dine_in' | 'takeaway'

export const OrderStatusMap: Record<OrderStatus, string> = {
  pending: '待接单',
  making: '制作中',
  ready: '已出餐',
  completed: '已完成',
  cancelled: '已取消'
}

export const OrderTypeMap: Record<OrderType, string> = {
  dine_in: '堂食',
  takeaway: '外卖'
}

export interface OrderItem {
  drinkId: string
  drinkName: string
  quantity: number
  price: number
  specs: Record<string, string>
}

export interface Order {
  id: string
  orderNo: string
  type: OrderType
  typeName: string
  status: OrderStatus
  statusName: string
  tableNo?: string
  items: OrderItem[]
  totalAmount: number
  customerName?: string
  customerPhone?: string
  createTime: string
  updateTime: string
  remark?: string
}

export type InventoryCategory = 'tea_base' | 'dairy' | 'ingredient' | 'packaging'

export const InventoryCategoryMap: Record<InventoryCategory, string> = {
  tea_base: '茶底',
  dairy: '奶品',
  ingredient: '配料',
  packaging: '包装'
}

export interface InventoryRecord {
  id: string
  name: string
  category: InventoryCategory
  categoryName: string
  quantity: number
  unit: string
  warningThreshold: number
  expiryDate: string
  isExpiring: boolean
  isLowStock: boolean
  createTime: string
  updateTime: string
}

export interface SelectOption {
  label: string
  value: string
}

export interface TableColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  render?: (value: any, record: any, index: number) => React.ReactNode
}

export interface ModalProps {
  visible: boolean
  title: string
  onCancel: () => void
  onOk: () => void
  width?: number | string
  confirmLoading?: boolean
}
