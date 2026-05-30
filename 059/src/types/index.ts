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

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  EXPORT = 'export',
  IMPORT = 'import'
}

export enum InventoryType {
  IN = 'in',
  OUT = 'out',
  RETURN = 'return'
}

export enum CooperationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum ReminderLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface UserProfile {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryNode {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  path: string;
  sort: number;
  description: string;
  isEnabled: boolean;
  children?: CategoryNode[];
}

export interface SupplierProfile {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  cooperationStartDate: Date;
  cooperationEndDate: Date;
  status: CooperationStatus;
  qualification: string;
  creditRating: string;
  remark: string;
}

export interface SparePartProfile {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  specification: string;
  model: string;
  unit: string;
  brand: string;
  safetyStock: number;
  currentStock: number;
  unitPrice: number;
  workshop: string;
  location: string;
  description: string;
  isEnabled: boolean;
}

export interface InventoryRecordDetail {
  id: number;
  sparePartId: number;
  sparePartName: string;
  sparePartCode: string;
  type: InventoryType;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  supplierId?: number;
  supplierName?: string;
  applicantId?: number;
  applicantName?: string;
  department?: string;
  reason?: string;
  orderNo: string;
  remark?: string;
  operatorId: number;
  operatorName: string;
  createdAt: Date;
}

export interface AlertDetail {
  id: number;
  sparePartId: number;
  sparePartName: string;
  sparePartCode: string;
  categoryName: string;
  workshop: string;
  currentStock: number;
  safetyStock: number;
  shortage: number;
  isHandled: boolean;
  handledBy?: number;
  handledAt?: Date;
  handleRemark?: string;
  createdAt: Date;
}
