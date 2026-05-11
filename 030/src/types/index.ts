export type BuildingStatus = 'normal' | 'maintenance' | 'completed'

export interface Building {
  id: string
  name: string
  phase: string
  totalFloors: number
  totalUnits: number
  totalHouses: number
  occupiedHouses: number
  status: BuildingStatus
  propertyFeeRate?: number
  createTime?: string
}

export type HouseOwnershipType = 'owner' | 'tenant' | 'vacant'
export type HouseOccupancyStatus = 'occupied' | 'vacant' | 'decorating'

export interface House {
  id: string
  buildingId: string
  unit: number
  floor: number
  houseNo: string
  area: number
  ownershipType: HouseOwnershipType
  occupancyStatus: HouseOccupancyStatus
  lastPropertyFeeMonth?: string
}

export type ResidentRelationship = 'owner' | 'family' | 'tenant'
export type ResidentStatus = 'active' | 'inactive'

export interface Resident {
  id: string
  houseId: string
  buildingId: string
  name: string
  phone: string
  idCard: string
  relationship: ResidentRelationship
  moveInDate: string
  status: ResidentStatus
}

export type WorkOrderType = 'repair' | 'complaint' | 'suggestion' | 'other'
export type WorkOrderPriority = 'high' | 'medium' | 'low'
export type WorkOrderStatus = 'pending' | 'processing' | 'checking' | 'completed'

export interface WorkOrder {
  id: string
  residentId: string
  residentName: string
  phone: string
  houseId: string
  buildingId: string
  buildingName: string
  houseNo: string
  type: WorkOrderType
  title: string
  description: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  createTime: string
  assignTime?: string
  completeTime?: string
  handler?: string
  handlerId?: string
  isTimeout: boolean
  remark?: string
  images?: string[]
}

export type PaymentType = 'property' | 'water' | 'electricity' | 'gas' | 'parking'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface PropertyFeeConfig {
  buildingId: string
  ratePerSquare: number
  effectiveDate: string
  lastUpdateTime: string
}

export interface Payment {
  id: string
  residentId: string
  residentName: string
  houseId: string
  buildingId: string
  buildingName: string
  houseNo: string
  type: PaymentType
  amount: number
  paidAmount: number
  status: PaymentStatus
  dueDate: string
  paidDate?: string
  createTime: string
  remark?: string
  feeMonth?: string
  discountAmount?: number
  paymentMethod?: 'cash' | 'wechat' | 'alipay' | 'bank'
}

export type UserRole = 'admin' | 'property' | 'maintenance'
export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  status: UserStatus
  phone?: string
  email?: string
  createTime?: string
}

export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  operatorRole: UserRole
  action: string
  targetType: string
  targetId: string
  targetName: string
  beforeChange?: string
  afterChange?: string
  createTime: string
  ip?: string
  remark?: string
}

export interface AdvancedFilter {
  buildingId?: string
  workOrderType?: WorkOrderType | string
  paymentStatus?: PaymentStatus | string
  occupancyStatus?: HouseOccupancyStatus | string
  keyword?: string
  dateRange?: readonly [string, string] | [string, string]
  workOrderStatus?: WorkOrderStatus
  priority?: WorkOrderPriority
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface TableColumn<T> {
  prop: keyof T | string
  label: string
  width?: number | string
  minWidth?: number
  fixed?: 'left' | 'right' | boolean
  sortable?: boolean
  formatter?: (row: T, column: TableColumn<T>, cellValue: unknown, index: number) => string
}

export interface DialogMode {
  CREATE: 'create'
  VIEW: 'view'
  EDIT: 'edit'
  PROCESS: 'process'
  PAY: 'pay'
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export type DateRange = [string, string]

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

export interface StatCardData {
  title: string
  value: string | number
  icon: string
  color: string
  bgColor: string
  badge?: string
}
