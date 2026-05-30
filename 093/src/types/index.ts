export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DESIGN = 'design',
  PRODUCTION = 'production',
  WAREHOUSE = 'warehouse',
  FINANCE = 'finance',
}

export enum MaterialStatus {
  AVAILABLE = 'available',
  LOCKED = 'locked',
  USED = 'used',
  PENDING_SCRAP = 'pending_scrap',
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  DESIGNING = 'designing',
  PRODUCTION_SCHEDULED = 'production_scheduled',
  CNC_PROCESSING = 'cnc_processing',
  QUALITY_CHECKING = 'quality_checking',
  POLISHING = 'polishing',
  COMPLETED = 'completed',
  READY_TO_SHIP = 'ready_to_ship',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum MaterialType {
  ALUMINUM = 'aluminum',
  CARBON_FIBER = 'carbon_fiber',
  PLASTIC_RESIN = 'plastic_resin',
  ALLOY = 'alloy',
}

export enum LockType {
  PRODUCTION_SCHEDULE = 'production_schedule',
  ORDER_RESERVATION = 'order_reservation',
  TEMPORARY = 'temporary',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  CONSUME = 'consume',
  STOCK_IN = 'stock_in',
  SCHEDULE = 'schedule',
  COMPLETE = 'complete',
  CALCULATE_COST = 'calculate_cost',
}

export enum OperationModule {
  CATEGORY = 'category',
  MATERIAL = 'material',
  ORDER = 'order',
  COST_REPORT = 'cost_report',
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

export interface MaterialFilterParams {
  types?: MaterialType[];
  statuses?: MaterialStatus[];
  name?: string;
  batchNumber?: string;
  supplier?: string;
  minQuantity?: number;
  maxQuantity?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ScheduleProductionParams {
  orderId: number;
  materialId: number;
  requiredQuantity: number;
  lockType?: LockType;
  remarks?: string;
}

export interface CompleteOrderParams {
  orderId: number;
  actualMaterialUsed: number;
  laborHours: number;
  machineHours: number;
  additionalCosts?: number;
  remarks?: string;
}

export interface CostCalculationResult {
  materialCost: number;
  laborCost: number;
  machineCost: number;
  additionalCosts: number;
  totalCost: number;
  materialWastage: number;
  wastageRate: number;
}

export interface OperationLogData {
  module: OperationModule;
  operationType: OperationType;
  recordId: number;
  previousData?: any;
  newData?: any;
  changes?: string[];
  remarks?: string;
}
