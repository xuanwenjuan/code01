export enum UserRole {
  ADMIN = 'admin',
  BUSINESS = 'business',
  WAREHOUSE = 'warehouse',
  FINANCE = 'finance',
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  SCRAPPED = 'scrapped',
}

export enum OrderStatus {
  PENDING_DEPOSIT = 'pending_deposit',
  CONFIRMED = 'confirmed',
  OUTBOUND = 'outbound',
  IN_USE = 'in_use',
  RETURNED = 'returned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
}