export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  OPERATION = 'operation',
  BUILDING_ADMIN = 'building_admin',
  FINANCE = 'finance',
  STAFF = 'staff',
  CUSTOMER = 'customer'
}

export enum RoomStatus {
  VACANT = 'vacant',
  BOOKED = 'booked',
  CHECKED_IN = 'checked_in',
  MAINTENANCE = 'maintenance',
  LOCKED = 'locked'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
  REFUNDED = 'refunded'
}

export enum SeasonType {
  PEAK = 'peak',
  NORMAL = 'normal',
  LOW = 'low'
}

export enum OperationModule {
  AUTH = 'auth',
  ROOM_CATEGORY = 'room_category',
  ROOM = 'room',
  ORDER = 'order',
  REVENUE = 'revenue',
  USER = 'user'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  PAY = 'pay',
  CANCEL = 'cancel',
  REFUND = 'refund',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export const ORDER_TIMEOUT_MINUTES = 30;
