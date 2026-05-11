export enum RoomType {
  DELUXE_SINGLE = 'deluxe_single',
  STANDARD_TWIN = 'standard_twin',
  EXECUTIVE_SUITE = 'executive_suite',
  BUSINESS_DOUBLE = 'business_double',
  FAMILY_SUITE = 'family_suite'
}

export enum RoomStatus {
  VACANT = 'vacant',
  BOOKED = 'booked',
  OCCUPIED = 'occupied',
  CLEANING = 'cleaning'
}

export enum OrderStatus {
  PENDING_CHECKIN = 'pending_checkin',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled'
}

export enum OperationAction {
  CHECK_IN = '办理入住',
  CHECK_OUT = '退房结算',
  FORCE_CHECK_OUT = '强制退房',
  CREATE_BOOKING = '创建预订',
  CANCEL_BOOKING = '取消预订',
  ROOM_STATUS_CHANGE = '房态调整',
  PRICE_ADJUST = '房价调整',
  ROOM_TYPE_UPDATE = '房型配置更新',
  ROOM_TYPE_DELETE = '房型删除',
  ROOM_TYPE_ADD = '新增房型',
  GUEST_INFO_UPDATE = '客人信息更新'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BANK_TRANSFER = 'bank_transfer'
}

export type UserRole = 'admin' | 'receptionist'

export type TargetType = 'room' | 'order' | 'roomType' | 'guest'

export interface RoomTypeConfig {
  id: string
  name: string
  code: RoomType
  price: number
  capacity: number
  bedCount: number
  area: number
  amenities: string[]
  description: string
  image: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  roomNumber: string
  floor: number
  typeCode: RoomType
  status: RoomStatus
  currentOrderId?: string
  lastCleanedAt: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Guest {
  id: string
  name: string
  idCard: string
  phone: string
  gender: 'male' | 'female'
  email?: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface OrderPayment {
  id: string
  orderId: string
  amount: number
  method: PaymentMethod
  receivedAt: string
  receivedBy: string
  remark?: string
}

export interface Order {
  id: string
  orderNo: string
  roomId: string
  roomNumber: string
  guestId: string
  guest: Guest
  checkInDate: string
  checkOutDate: string
  actualCheckIn?: string
  actualCheckOut?: string
  nights: number
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  deposit: number
  payments: OrderPayment[]
  createTime: string
  updateTime: string
  createBy: string
  remark?: string
  isOverdue?: boolean
  overdueHours?: number
}

export interface OperationLog {
  id: string
  action: string
  operator: string
  operatorRole: UserRole
  targetType: TargetType
  targetId: string
  targetName: string
  details: string
  timestamp: string
  ip?: string
  beforeData?: Record<string, unknown>
  afterData?: Record<string, unknown>
}

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
  token: string
  lastLoginAt?: string
  avatar?: string
}

export interface FilterParams {
  roomType?: RoomType
  floor?: number
  status?: RoomStatus
  orderStatus?: OrderStatus
  keyword?: string
  startDate?: string
  endDate?: string
  operator?: string
  action?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BookingFormData {
  roomId: string
  guestName: string
  guestGender: 'male' | 'female'
  idCard: string
  phone: string
  checkInDate: string
  checkOutDate: string
  nights: number
  deposit: number
  remark: string
}

export interface PriceEstimate {
  roomTypePrice: number
  nights: number
  subtotal: number
  deposit: number
  estimatedTotal: number
  discount?: number
  finalEstimate: number
}

export interface RoomWithType extends Room {
  roomType?: RoomTypeConfig
}

export interface OrderWithRoomType extends Order {
  roomType?: RoomTypeConfig
}

export interface StatisticsData {
  totalRooms: number
  vacantRooms: number
  occupiedRooms: number
  bookedRooms: number
  cleaningRooms: number
  todayRevenue: number
  pendingCheckinCount: number
  overdueCount: number
  todayCheckinCount: number
  todayCheckoutCount: number
}

export type RoomStatusMap = Record<RoomStatus, { label: string; type: 'success' | 'warning' | 'primary' | 'info' | 'danger' }>
export type OrderStatusMap = Record<OrderStatus, { label: string; type: 'warning' | 'primary' | 'success' | 'info' | 'danger' }>
