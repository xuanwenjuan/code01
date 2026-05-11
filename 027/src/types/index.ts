export type RoomTypeId = string
export type RoomId = string
export type BookingId = string
export type CheckInId = string
export type OperationLogId = string
export type UserId = string
export type FloorId = string

export type RoomTypeCategory = '标准间' | '大床房' | '双床房' | '套房' | '豪华套房' | '行政套房'
export type RoomStatus = 'vacant' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance'
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
export type FloorStatus = 'active' | 'inactive'
export type UserRole = 'admin' | 'front_desk' | 'housekeeping' | 'manager'
export type TargetType = 'room_type' | 'room' | 'floor' | 'booking' | 'check_in'
export type OperationType = 
  | 'create_room_type' | 'update_room_type' | 'delete_room_type'
  | 'create_room' | 'update_room' | 'delete_room' | 'update_room_status'
  | 'create_floor' | 'update_floor' | 'delete_floor'
  | 'create_booking' | 'update_booking' | 'cancel_booking'
  | 'check_in' | 'check_out' | 'force_check_out'
  | 'update_price'
export type PaymentMethod = 'cash' | 'card' | 'wechat' | 'alipay'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type Gender = 'male' | 'female'
export type BedType = 'single' | 'double' | 'twin' | 'king' | 'queen'

export interface RoomType {
  id: RoomTypeId
  name: string
  category: RoomTypeCategory
  description: string
  pricePerNight: number
  originalPrice: number
  bedType: BedType
  bedCount: number
  maxGuests: number
  roomSize: number
  facilities: string[]
  amenities: string[]
  images: string[]
  totalRooms: number
  availableRooms: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Floor {
  id: FloorId
  floorNumber: number
  floorName: string
  description: string
  totalRooms: number
  availableRooms: number
  status: FloorStatus
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: RoomId
  roomNumber: string
  roomTypeId: RoomTypeId
  roomTypeName: string
  floorId: FloorId
  floorNumber: number
  status: RoomStatus
  pricePerNight: number
  originalPrice: number
  maxGuests: number
  bedType: BedType
  facilities: string[]
  hasWifi: boolean
  hasAircon: boolean
  hasTv: boolean
  hasMinibar: boolean
  hasSafe: boolean
  notes: string
  lastCleanedAt?: string
  lastMaintenanceAt?: string
  createdAt: string
  updatedAt: string
}

export interface Guest {
  id: string
  name: string
  gender: Gender
  age: number
  phone: string
  idCard: string
  email: string
  address: string
  company: string
  isVIP: boolean
  vipLevel?: number
  totalStays: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface BookingGuest {
  guestId: string
  name: string
  idCard: string
  phone: string
  isPrimary: boolean
}

export interface Booking {
  id: BookingId
  bookingNo: string
  guestId: string
  guestName: string
  guestPhone: string
  guests: BookingGuest[]
  roomId: RoomId
  roomNumber: string
  roomTypeId: RoomTypeId
  roomTypeName: string
  checkInDate: string
  checkOutDate: string
  nights: number
  expectedCheckIn?: string
  actualCheckIn?: string
  actualCheckOut?: string
  adultCount: number
  childCount: number
  roomPricePerNight: number
  totalRoomPrice: number
  additionalFees: number
  totalAmount: number
  paidAmount: number
  paymentMethod?: PaymentMethod
  paymentStatus: PaymentStatus
  status: BookingStatus
  specialRequests: string
  source: string
  operatorName: string
  isOverdue: boolean
  cancelledAt?: string
  cancelReason?: string
  checkInId?: CheckInId
  createdAt: string
  updatedAt: string
}

export interface CheckIn {
  id: CheckInId
  checkInNo: string
  bookingId?: BookingId
  roomId: RoomId
  roomNumber: string
  roomTypeId: RoomTypeId
  roomTypeName: string
  guests: BookingGuest[]
  checkInDate: string
  expectedCheckOutDate: string
  actualCheckOutDate?: string
  nights: number
  adultCount: number
  childCount: number
  roomPricePerNight: number
  totalRoomPrice: number
  additionalFees: number
  totalAmount: number
  paidAmount: number
  paymentMethod?: PaymentMethod
  paymentStatus: PaymentStatus
  depositAmount: number
  keyCardNumber: string
  specialRequests: string
  operatorName: string
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export interface AdditionalFee {
  id: string
  checkInId: CheckInId
  description: string
  amount: number
  quantity: number
  unitPrice: number
  operatorName: string
  createdAt: string
}

export interface OperationLog {
  id: OperationLogId
  operatorId: UserId
  operatorName: string
  operatorRole: UserRole
  operationType: OperationType
  operationDescription: string
  targetType: TargetType
  targetId: string
  targetName: string
  oldValue?: string
  newValue?: string
  ipAddress: string
  createdAt: string
}

export interface User {
  id: UserId
  username: string
  name: string
  role: UserRole
  avatar: string
  department: string
  phone: string
}

export interface RoomStatusCount {
  vacant: number
  reserved: number
  occupied: number
  cleaning: number
  maintenance: number
}

export interface BookingFilterParams {
  roomTypeId?: string
  roomId?: string
  status?: BookingStatus
  guestName?: string
  checkInDateFrom?: string
  checkInDateTo?: string
  checkOutDateFrom?: string
  checkOutDateTo?: string
  operatorName?: string
  isOverdue?: boolean
}

export interface RoomFilterParams {
  roomTypeId?: string
  floorId?: string
  status?: RoomStatus
  roomNumber?: string
  priceRange?: [number, number]
}
