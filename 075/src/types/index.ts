
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ASSET_ADMIN = 'asset_admin',
  DEPARTMENT_HEAD = 'department_head',
  GENERAL_USER = 'general_user'
}

export enum AssetStatus {
  IDLE = 'idle',
  IN_USE = 'in_use',
  IN_REPAIR = 'in_repair',
  SCRAPPED = 'scrapped'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum ApplicationType {
  RECEIVE = 'receive',
  TRANSFER = 'transfer',
  RETURN = 'return',
  REPAIR = 'repair'
}

export enum InventoryResult {
  NORMAL = 'normal',
  PROFIT = 'profit',
  LOSS = 'loss'
}

export enum OperationModule {
  ASSET = 'asset',
  CATEGORY = 'category',
  APPLICATION = 'application',
  INVENTORY = 'inventory',
  USER = 'user',
  AUTH = 'auth'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
  INVENTORY = 'inventory',
  SCRAP = 'scrap',
  TRANSFER = 'transfer',
  RECEIVE = 'receive',
  RETURN = 'return',
  REPAIR = 'repair',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export interface JwtPayload {
  userId: number;
  username: string;
  realName: string;
  role: UserRole;
  department?: string;
}

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
  requestId?: string;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: ValidationError[];
  timestamp: number;
  path?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OperationLogData {
  userId: number;
  username: string;
  realName: string;
  module: OperationModule;
  operation: OperationType;
  description: string;
  ip?: string;
  userAgent?: string;
  requestParams?: Record<string, any>;
  responseData?: Record<string, any>;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export interface IUser {
  id: number;
  username: string;
  realName: string;
  phone?: string;
  email?: string;
  department?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssetCategory {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sort: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: IAssetCategory;
  children?: IAssetCategory[];
}

export interface IAsset {
  id: number;
  assetCode: string;
  name: string;
  categoryId: number;
  specModel?: string;
  brand?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  depreciationRate: number;
  department?: string;
  storageLocation?: string;
  responsiblePerson?: string;
  status: AssetStatus;
  warrantyDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  category?: IAssetCategory;
}

export interface IAssetApplication {
  id: number;
  applicationNo: string;
  type: ApplicationType;
  assetId: number;
  applicantId: number;
  applicantDepartment?: string;
  targetDepartment?: string;
  reason: string;
  expectedReturnDate?: Date;
  status: ApplicationStatus;
  approverId?: number;
  approvalRemark?: string;
  approvalTime?: Date;
  completionTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  asset?: IAsset;
  applicant?: IUser;
  approver?: IUser;
}

export interface IAssetInventory {
  id: number;
  inventoryNo: string;
  inventoryDate: Date;
  assetId: number;
  bookStatus?: AssetStatus;
  actualStatus?: AssetStatus;
  result: InventoryResult;
  remark?: string;
  operatorId: number;
  createdAt: Date;
  updatedAt: Date;
  asset?: IAsset;
  operator?: IUser;
}

export interface IOperationLog {
  id: number;
  userId: number;
  username: string;
  realName: string;
  module: OperationModule;
  operation: OperationType;
  description: string;
  ip?: string;
  userAgent?: string;
  requestParams?: string;
  responseData?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

export interface AssetFilterParams {
  categoryId?: number;
  department?: string;
  status?: AssetStatus;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface InventoryDiffResult {
  assetId: number;
  assetCode: string;
  assetName: string;
  bookStatus?: AssetStatus;
  actualStatus?: AssetStatus;
  result: InventoryResult;
  diffDescription: string;
  isAbnormal: boolean;
}

export interface InventorySummary {
  totalCount: number;
  normalCount: number;
  profitCount: number;
  lossCount: number;
  normalRate: string;
  profitRate: string;
  lossRate: string;
  abnormalAssets: InventoryDiffResult[];
}

export interface DepartmentStorageMapping {
  [department: string]: string;
}

export interface AssetChangeLog {
  id: number;
  assetId: number;
  field: string;
  oldValue: string;
  newValue: string;
  operatorId: number;
  operatorName: string;
  changeType: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      requestId?: string;
    }
  }
}
