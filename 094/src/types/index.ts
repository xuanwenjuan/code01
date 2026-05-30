export enum UserRole {
  ADMIN = 'admin',
  MATERIAL_ADMIN = 'material_admin',
  OPERATION = 'operation',
  FINANCE = 'finance',
  ARTISAN = 'artisan',
}

export enum WorkOrderStatus {
  PENDING_DEPOSIT = 'pending_deposit',
  CONFIRMED = 'confirmed',
  DESIGN_FINALIZED = 'design_finalized',
  MATERIAL_COLLECTED = 'material_collected',
  IN_PRODUCTION = 'in_production',
  QUALITY_INSPECTION = 'quality_inspection',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum MaterialStatus {
  SUFFICIENT = 'sufficient',
  LOW = 'low',
  EXHAUSTED = 'exhausted',
}

export enum StockOperationType {
  IN = 'in',
  OUT = 'out',
  LOCK = 'lock',
  UNLOCK = 'unlock',
}

export enum LogModule {
  MATERIAL_CATEGORY = 'material_category',
  MATERIAL = 'material',
  WORK_ORDER = 'work_order',
  MATERIAL_CONSUMPTION = 'material_consumption',
  USER = 'user',
  AUTH = 'auth',
}

export enum LogAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  CONFIRM = 'confirm',
  FINALIZE = 'finalize',
  CANCEL = 'cancel',
  COMPLETE = 'complete',
  DELIVER = 'deliver',
  PAY = 'pay',
  COLLECT = 'collect',
}

export interface IUser {
  id: number;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  status: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaterialCategory {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  path?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  isPurchasable: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  children?: IMaterialCategory[];
  parent?: IMaterialCategory;
}

export interface IMaterial {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  specification?: string;
  unit: string;
  origin?: string;
  grade?: string;
  batchNumber?: string;
  warehouseLocation?: string;
  unitPrice: number;
  currentStock: number;
  lockedStock: number;
  availableStock: number;
  minStock: number;
  maxStock?: number;
  status: MaterialStatus;
  isPurchasable: boolean;
  description?: string;
  imageUrl?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  category?: IMaterialCategory;
}

export interface IWorkOrder {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  productName: string;
  patternDesign?: string;
  patternImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  depositAmount: number;
  isDepositPaid: boolean;
  payMethod?: string;
  payRemark?: string;
  deadline?: Date;
  status: WorkOrderStatus;
  artisanId?: number;
  remark?: string;
  cancelledReason?: string;
  cancelledAt?: Date;
  completedAt?: Date;
  deliveredAt?: Date;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  artisan?: IUser;
  creator?: IUser;
  materialConsumptions?: IMaterialConsumption[];
  processes?: IWorkOrderProcess[];
}

export interface IWorkOrderProcess {
  id: number;
  workOrderId: number;
  processName: string;
  processOrder: number;
  status: string;
  startedAt?: Date;
  completedAt?: Date;
  inspectorId?: number;
  inspectionResult?: string;
  inspectionRemark?: string;
  inspectedAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaterialConsumption {
  id: number;
  workOrderId: number;
  materialId: number;
  plannedQuantity: number;
  actualQuantity: number;
  wasteQuantity: number;
  unitPrice: number;
  totalCost: number;
  remark?: string;
  operatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
  material?: IMaterial;
  workOrder?: IWorkOrder;
  operator?: IUser;
}

export interface IOperationLog {
  id: number;
  userId?: number;
  username?: string;
  operation: string;
  module: LogModule;
  action: LogAction;
  ip?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestParams?: string;
  responseData?: string;
  status: boolean;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
  user?: IUser;
}

export interface IApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export interface IPaginationParams {
  page?: number;
  pageSize?: number;
}

export interface IPaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IMaterialFilterParams extends IPaginationParams {
  keyword?: string;
  categoryId?: number;
  origin?: string;
  grade?: string;
  status?: MaterialStatus;
  isPurchasable?: boolean;
  minStockMin?: number;
  minStockMax?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ICreateWorkOrderDto {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  productName: string;
  patternDesign?: string;
  patternImage?: string;
  quantity: number;
  unitPrice: number;
  depositAmount?: number;
  deadline?: Date;
  artisanId?: number;
  remark?: string;
  materialItems?: Array<{
    materialId: number;
    plannedQuantity: number;
  }>;
}

export interface IStockLockItem {
  materialId: number;
  quantity: number;
  lockReason: string;
}

export interface IMaterialCostSummary {
  totalMaterialCost: number;
  totalActualQuantity: number;
  totalWasteQuantity: number;
  wasteRate: number;
  unitMaterialCost: number;
  details: IMaterialConsumption[];
}

export interface IWorkOrderCost {
  workOrderId: number;
  orderNo: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  materialCost: IMaterialCostSummary;
  grossProfit: number;
  grossProfitMargin: string;
}

export interface IDecodedToken {
  id: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken;
    }
  }
}
