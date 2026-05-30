export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DISTRICT_ADMIN = 'district_admin',
  MAINTENANCE = 'maintenance',
  FINANCE = 'finance',
  INSPECTOR = 'inspector'
}

export enum SiteStatus {
  NORMAL = 'normal',
  FAULT = 'fault',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive'
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  FAULT_REPORTED = 'fault_reported',
  MAINTENANCE = 'maintenance',
  REINSPECTION = 'reinspection',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum CategoryStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export enum OperationModule {
  USER = 'user',
  CATEGORY = 'category',
  SITE = 'site',
  WORK_ORDER = 'work_order',
  CONSUMABLE = 'consumable',
  SCHEDULE = 'schedule',
  INVENTORY = 'inventory'
}

export enum ConsumableType {
  IN = 'in',
  OUT = 'out'
}

export enum ScheduleLockStatus {
  UNLOCKED = 'unlocked',
  LOCKED = 'locked',
  CONFIRMED = 'confirmed'
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  traceId?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  district?: string;
}

export interface UserAttributes {
  id?: number;
  username: string;
  password?: string;
  realName: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  district?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EquipmentCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  description?: string;
  status: CategoryStatus;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ObservationSiteAttributes {
  id?: number;
  siteCode: string;
  name: string;
  address: string;
  district: string;
  longitude: number;
  latitude: number;
  altitude?: number;
  buildDate: Date;
  status: SiteStatus;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  contactPerson?: string;
  contactPhone?: string;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InspectionWorkOrderAttributes {
  id?: number;
  orderNo: string;
  siteId: number;
  equipmentCategoryId?: number;
  plannedDate: Date;
  actualDate?: Date;
  inspectorId?: number;
  maintenancePersonId?: number;
  status: WorkOrderStatus;
  priority: PriorityLevel;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  windDirection?: string;
  airPressure?: number;
  radiation?: number;
  equipmentCheckResult?: string;
  faultDescription?: string;
  faultLevel?: string;
  maintenanceMeasures?: string;
  maintenanceCost?: number;
  maintenanceStartTime?: Date;
  maintenanceEndTime?: Date;
  reinspectionDate?: Date;
  reinspectionResult?: string;
  remark?: string;
  lockedBy?: number;
  lockedAt?: Date;
  scheduleLockStatus: ScheduleLockStatus;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsumableRecordAttributes {
  id?: number;
  recordNo: string;
  siteId?: number;
  equipmentCategoryId?: number;
  workOrderId?: number;
  name: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: ConsumableType;
  operatorId?: number;
  receiveDate?: Date;
  approvedBy?: number;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsumableInventoryAttributes {
  id?: number;
  name: string;
  specification?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  unitPrice: number;
  totalValue: number;
  equipmentCategoryId?: number;
  lastInboundAt?: Date;
  lastOutboundAt?: Date;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: OperationModule;
  operation: OperationType;
  method?: string;
  url?: string;
  ip?: string;
  params?: string;
  result?: string;
  status: 'success' | 'fail';
  errorMessage?: string;
  duration?: number;
  targetId?: number;
  targetType?: string;
  beforeData?: string;
  afterData?: string;
  createdAt?: Date;
}

export interface MaintenanceScheduleAttributes {
  id?: number;
  scheduleDate: Date;
  userId: number;
  workOrderId?: number;
  siteId?: number;
  isLocked: boolean;
  lockedBy?: number;
  lockedAt?: Date;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkOrderQueryParams {
  orderNo?: string;
  siteId?: number;
  district?: string;
  equipmentCategoryId?: number;
  inspectorId?: number;
  maintenancePersonId?: number;
  status?: WorkOrderStatus;
  priority?: PriorityLevel;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface SiteQueryParams {
  siteCode?: string;
  name?: string;
  district?: string;
  status?: SiteStatus;
  equipmentCategoryId?: number;
  hasPendingWorkOrder?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CategoryQueryParams {
  name?: string;
  code?: string;
  status?: CategoryStatus;
  parentId?: number;
  level?: number;
  page?: number;
  pageSize?: number;
}

export interface ConsumableQueryParams {
  name?: string;
  siteId?: number;
  equipmentCategoryId?: number;
  workOrderId?: number;
  type?: ConsumableType;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateWorkOrderDto {
  siteId: number;
  equipmentCategoryId?: number;
  plannedDate: Date;
  inspectorId?: number;
  priority?: PriorityLevel;
  remark?: string;
}

export interface AssignWorkOrderDto {
  workOrderId: number;
  inspectorId: number;
  plannedDate: Date;
  remark?: string;
}

export interface MaintenanceConsumableDto {
  workOrderId: number;
  items: Array<{
    name: string;
    specification?: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    equipmentCategoryId?: number;
  }>;
  remark?: string;
}

export interface UserQueryParams {
  keyword?: string;
  role?: UserRole;
  district?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
