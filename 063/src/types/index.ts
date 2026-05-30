export enum RoleCode {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEPT_MANAGER = 'DEPT_MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum CategoryStatus {
  ARCHIVED = 0,
  ACTIVE = 1
}

export enum MaterialStatus {
  DISABLED = 0,
  ACTIVE = 1
}

export enum RequisitionStatus {
  PENDING = 1,
  APPROVING = 2,
  APPROVED = 3,
  REJECTED = 4,
  DELIVERED = 5,
  CANCELLED = 6
}

export enum InventoryCheckStatus {
  DRAFT = 1,
  CONFIRMED = 2,
  COMPLETED = 3
}

export enum CheckResultType {
  NORMAL = 1,
  PROFIT = 2,
  LOSS = 3
}

export enum StockLogType {
  IN = 1,
  OUT = 2,
  CHECK_IN = 3,
  CHECK_OUT = 4,
  LOSS = 5,
  REQUISITION_OUT = 6
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  APPROVE = 'approve',
  REJECT = 'reject',
  DELIVER = 'deliver',
  CANCEL = 'cancel',
  CONFIRM = 'confirm',
  COMPLETE = 'complete',
  LOSS = 'loss'
}

export interface AuthUser {
  id: number;
  username: string;
  roleId: number;
  departmentId: number;
  roleCode?: RoleCode;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  code: string;
  parentId?: number;
  sort?: number;
}

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  code?: string;
  parentId?: number;
  sort?: number;
  status?: CategoryStatus;
}

export interface CreateMaterialRequest {
  name: string;
  code: string;
  specification?: string;
  model?: string;
  unit: string;
  unitPrice: number;
  categoryId: number;
  warehouseId: number;
  stockQuantity?: number;
  minStockThreshold?: number;
  location?: string;
  description?: string;
}

export interface UpdateMaterialRequest {
  id: number;
  name?: string;
  code?: string;
  specification?: string;
  model?: string;
  unit?: string;
  unitPrice?: number;
  categoryId?: number;
  warehouseId?: number;
  minStockThreshold?: number;
  location?: string;
  description?: string;
  status?: MaterialStatus;
}

export interface StockOperationRequest {
  materialId: number;
  quantity: number;
  remark?: string;
  operatorId: number;
}

export interface CreateRequisitionRequest {
  applicantId: number;
  departmentId: number;
  reason?: string;
  items: Array<{
    materialId: number;
    quantity: number;
  }>;
}

export interface ApproveRequisitionRequest {
  id: number;
  approverId: number;
  rejectReason?: string;
}

export interface CreateInventoryCheckRequest {
  warehouseId: number;
  checkDate: string;
  operatorId: number;
  remark?: string;
}

export interface UpdateInventoryItemsRequest {
  id: number;
  items: Array<{
    materialId: number;
    actualQuantity: number;
  }>;
}

export interface LowStockAlert {
  materialId: number;
  materialName: string;
  materialCode: string;
  currentStock: number;
  minThreshold: number;
  warehouseId: number;
  warehouseName: string;
  categoryId: number;
  categoryName: string;
}

export interface StockLogDetail {
  id: number;
  logNo: string;
  materialId: number;
  materialName: string;
  warehouseId: number;
  warehouseName: string;
  type: StockLogType;
  typeName: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  operatorId: number;
  operatorName: string;
  remark?: string;
  relatedId?: number;
  relatedType?: string;
  createdAt: Date;
}
