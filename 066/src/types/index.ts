export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
  WAREHOUSE = 'warehouse',
  FINANCE = 'finance'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ARCHIVED = 'archived'
}

export enum SupplierStatus {
  COOPERATING = 'cooperating',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated'
}

export enum PurchaseOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SalesOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum InventoryOperationType {
  PURCHASE_IN = 'purchase_in',
  PURCHASE_RETURN = 'purchase_return',
  SALES_OUT = 'sales_out',
  SALES_RETURN = 'sales_return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer'
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}