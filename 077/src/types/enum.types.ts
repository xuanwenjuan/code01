export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FINANCE = 'finance',
  OPERATOR = 'operator',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  LOCKED = 'locked',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  SCRAPPED = 'scrapped'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  DELIVERED = 'delivered',
  IN_USE = 'in_use',
  OVERDUE = 'overdue',
  RETURNED = 'returned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

export enum PaymentType {
  DEPOSIT = 'deposit',
  RENT = 'rent',
  OVERDUE = 'overdue',
  DAMAGE = 'damage'
}

export enum RentalType {
  DAILY = 'daily',
  MONTHLY = 'monthly'
}

export enum CategoryStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum CustomerStatus {
  DISABLED = 0,
  ENABLED = 1
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export enum LogModule {
  CATEGORY = 'category',
  EQUIPMENT = 'equipment',
  CUSTOMER = 'customer',
  ORDER = 'order',
  PAYMENT = 'payment',
  USER = 'user'
}
