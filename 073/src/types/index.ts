export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  RESEARCHER = 'researcher',
  WAREHOUSE = 'warehouse'
}

export enum ReagentCategoryType {
  CHEMICAL = 'chemical',
  CONSUMABLE = 'consumable',
  GLASSWARE = 'glassware',
  ACCESSORY = 'accessory'
}

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export enum StockStatus {
  PENDING = 'pending',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  IN_STOCK = 'in_stock'
}

export enum RequisitionStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELIVERED = 'delivered',
  PARTIAL_RETURNED = 'partial_returned',
  RETURNED = 'returned',
  SCRAPPED = 'scrapped',
  CANCELLED = 'cancelled'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  RETURN = 'return',
  SCRAP = 'scrap',
  ADJUST = 'adjust'
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
  errors?: any;
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
  role: UserRole;
}

export interface TreeNode {
  id: number;
  name: string;
  code: string;
  type: ReagentCategoryType;
  parentId: number | null;
  sortOrder: number;
  status: boolean;
  children?: TreeNode[];
}

export interface IUser {
  id: number;
  username: string;
  password?: string;
  realName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  department?: string;
  quota: number;
  usedQuota: number;
  status: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReagentCategory {
  id: number;
  name: string;
  code: string;
  type: ReagentCategoryType;
  parentId: number | null;
  sortOrder: number;
  description?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplier {
  id: number;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  businessLicense?: string;
  qualificationCert?: string;
  qualificationExpiry?: Date;
  businessScope?: string;
  supplyCategories?: string;
  status: SupplierStatus;
  rating?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReagent {
  id: number;
  name: string;
  code: string;
  casNo?: string;
  molecularFormula?: string;
  specification: string;
  unit: string;
  categoryId: number;
  supplierId: number;
  price: number;
  safetyLevel?: string;
  storageCondition?: string;
  description?: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStock {
  id: number;
  reagentId: number;
  batchNo: string;
  quantity: number;
  availableQuantity: number;
  unitPrice: number;
  productionDate?: Date;
  expiryDate?: Date;
  location?: string;
  status: StockStatus;
  inspectorId?: number;
  inspectionRemark?: string;
  inboundBy: number;
  inboundAt: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequisition {
  id: number;
  requisitionNo: string;
  applicantId: number;
  approverId?: number;
  department?: string;
  purpose: string;
  totalAmount: number;
  status: RequisitionStatus;
  approvalRemark?: string;
  approvedAt?: Date;
  deliveredBy?: number;
  deliveredAt?: Date;
  returnedAt?: Date;
  scrappedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRequisitionItem {
  id: number;
  requisitionId: number;
  reagentId?: number;
  stockId: number;
  quantity: number;
  unitPrice: number;
  returnedQuantity: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOperationLog {
  id: number;
  userId: number;
  userName?: string;
  operationType: OperationType;
  module: string;
  recordId: number;
  beforeData?: any;
  afterData?: any;
  description?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface IStockFlow {
  id: number;
  stockId: number;
  reagentId: number;
  flowType: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  operatorId: number;
  relatedType?: string;
  relatedId?: number;
  remarks?: string;
  createdAt: Date;
}
