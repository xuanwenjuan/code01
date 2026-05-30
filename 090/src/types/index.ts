export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  STORE_MANAGER = 'store_manager',
  RENTAL_STAFF = 'rental_staff',
  MAINTENANCE_TECHNICIAN = 'maintenance_technician',
  FINANCE_STAFF = 'finance_staff'
}

export const RoleHierarchy: Record<AdminRole, number> = {
  [AdminRole.SUPER_ADMIN]: 100,
  [AdminRole.STORE_MANAGER]: 80,
  [AdminRole.FINANCE_STAFF]: 60,
  [AdminRole.RENTAL_STAFF]: 40,
  [AdminRole.MAINTENANCE_TECHNICIAN]: 40
};

export enum Permission {
  EQUIPMENT_VIEW = 'equipment:view',
  EQUIPMENT_CREATE = 'equipment:create',
  EQUIPMENT_UPDATE = 'equipment:update',
  EQUIPMENT_DELETE = 'equipment:delete',
  
  CATEGORY_VIEW = 'category:view',
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  
  RENTAL_VIEW = 'rental:view',
  RENTAL_CREATE = 'rental:create',
  RENTAL_OUTBOUND = 'rental:outbound',
  RENTAL_RETURN = 'rental:return',
  RENTAL_CANCEL = 'rental:cancel',
  
  MAINTENANCE_VIEW = 'maintenance:view',
  MAINTENANCE_CREATE = 'maintenance:create',
  MAINTENANCE_START = 'maintenance:start',
  MAINTENANCE_COMPLETE = 'maintenance:complete',
  MAINTENANCE_CANCEL = 'maintenance:cancel',
  
  FINANCE_VIEW = 'finance:view',
  FINANCE_AUDIT = 'finance:audit',
  
  STORE_VIEW = 'store:view',
  STORE_MANAGE = 'store:manage',
  
  ADMIN_VIEW = 'admin:view',
  ADMIN_MANAGE = 'admin:manage'
}

export const RolePermissions: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission),
  
  [AdminRole.STORE_MANAGER]: [
    Permission.EQUIPMENT_VIEW,
    Permission.EQUIPMENT_CREATE,
    Permission.EQUIPMENT_UPDATE,
    Permission.EQUIPMENT_DELETE,
    Permission.CATEGORY_VIEW,
    Permission.RENTAL_VIEW,
    Permission.RENTAL_CREATE,
    Permission.RENTAL_OUTBOUND,
    Permission.RENTAL_RETURN,
    Permission.RENTAL_CANCEL,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_START,
    Permission.MAINTENANCE_COMPLETE,
    Permission.MAINTENANCE_CANCEL,
    Permission.FINANCE_VIEW,
    Permission.STORE_VIEW
  ],
  
  [AdminRole.RENTAL_STAFF]: [
    Permission.EQUIPMENT_VIEW,
    Permission.CATEGORY_VIEW,
    Permission.RENTAL_VIEW,
    Permission.RENTAL_CREATE,
    Permission.RENTAL_OUTBOUND,
    Permission.RENTAL_RETURN
  ],
  
  [AdminRole.MAINTENANCE_TECHNICIAN]: [
    Permission.EQUIPMENT_VIEW,
    Permission.CATEGORY_VIEW,
    Permission.MAINTENANCE_VIEW,
    Permission.MAINTENANCE_CREATE,
    Permission.MAINTENANCE_START,
    Permission.MAINTENANCE_COMPLETE,
    Permission.MAINTENANCE_CANCEL
  ],
  
  [AdminRole.FINANCE_STAFF]: [
    Permission.EQUIPMENT_VIEW,
    Permission.CATEGORY_VIEW,
    Permission.RENTAL_VIEW,
    Permission.MAINTENANCE_VIEW,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_AUDIT
  ]
};

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  RENTED = 'rented',
  IN_MAINTENANCE = 'in_maintenance',
  SCRAPPED = 'scrapped',
  RESERVED = 'reserved'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  OUTBOUND = 'outbound',
  IN_USE = 'in_use',
  RETURNED = 'returned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  ANNUAL = 'annual',
  ACCIDENT = 'accident'
}

export interface JwtPayload {
  id: number;
  username: string;
  realName: string;
  role: AdminRole;
  storeId?: number;
  storeName?: string;
}

export interface PageQuery {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  RENTAL_OUTBOUND = 'rental_outbound',
  RENTAL_RETURN = 'rental_return',
  MAINTENANCE_START = 'maintenance_start',
  MAINTENANCE_COMPLETE = 'maintenance_complete',
  STATUS_CHANGE = 'status_change'
}

export enum OperationModule {
  EQUIPMENT = 'equipment',
  CATEGORY = 'category',
  RENTAL_ORDER = 'rental_order',
  MAINTENANCE = 'maintenance',
  STORE = 'store',
  ADMIN = 'admin'
}

export interface OperationLog {
  id?: number;
  module: OperationModule;
  type: OperationType;
  targetId?: number;
  targetName?: string;
  operatorId: number;
  operatorName: string;
  storeId?: number;
  beforeData?: string;
  afterData?: string;
  remark?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}

export enum WarningLevel {
  NORMAL = 'normal',
  REMIND = 'remind',
  WARNING = 'warning',
  DANGER = 'danger'
}

export interface EquipmentWarning {
  equipmentId: number;
  equipmentNo: string;
  name: string;
  type: 'inspection' | 'maintenance' | 'overdue';
  level: WarningLevel;
  message: string;
  dueDate?: Date;
  daysRemaining?: number;
}
