export enum UserRole {
  ADMIN = 'admin',
  CULTIVATOR = 'cultivator',
  QC = 'qc',
  RESEARCHER = 'researcher'
}

export enum CategoryType {
  EDIBLE = 'edible',
  MEDICINAL = 'medicinal',
  FERMENTED = 'fermented',
  RESEARCH = 'research'
}

export enum MotherStrainStatus {
  BREEDING = 'breeding',
  DORMANT = 'dormant',
  DEGRADED = 'degraded',
  SCRAPPED = 'scrapped'
}

export enum BatchStatus {
  PENDING = 'pending',
  INOCULATED = 'inoculated',
  CULTIVATING = 'cultivating',
  QC_INSPECTION = 'qc_inspection',
  QC_PASSED = 'qc_passed',
  QC_FAILED = 'qc_failed',
  PACKAGED = 'packaged',
  IN_STOCK = 'in_stock',
  SHIPPED = 'shipped',
  ABNORMAL = 'abnormal',
  SCRAPPED = 'scrapped',
  LOCKED = 'locked'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  QC_INSPECTION = 'qc_inspection',
  GENERATE_REPORT = 'generate_report'
}

export interface JwtPayload {
  userId: number;
  username: string;
  realName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface MotherStrainFilterParams extends PaginationParams, DateRangeParams {
  strainCode?: string;
  strainName?: string;
  categoryId?: number;
  status?: MotherStrainStatus;
  generation?: number;
}

export interface CultivationBatchFilterParams extends PaginationParams, DateRangeParams {
  batchCode?: string;
  motherStrainId?: number;
  categoryId?: number;
  status?: BatchStatus;
  cultivatorId?: number;
  qcInspectorId?: number;
}

export interface CategoryFilterParams extends PaginationParams {
  categoryName?: string;
  categoryCode?: string;
  categoryType?: CategoryType;
  isActive?: boolean;
  parentId?: number;
}

export interface TraceabilityFilterParams extends PaginationParams, DateRangeParams {
  recordCode?: string;
  categoryId?: number;
}

export interface CreateCategoryRequest {
  categoryName: string;
  categoryCode: string;
  categoryType: CategoryType;
  parentId?: number;
  description?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  categoryName?: string;
  categoryCode?: string;
  categoryType?: CategoryType;
  parentId?: number;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateMotherStrainRequest {
  strainCode: string;
  strainName: string;
  categoryId: number;
  generation: number;
  mediumFormula: string;
  storageTemperature: number;
  originSource?: string;
  viabilityDate?: string;
  remark?: string;
}

export interface UpdateMotherStrainRequest {
  strainName?: string;
  categoryId?: number;
  generation?: number;
  mediumFormula?: string;
  storageTemperature?: number;
  originSource?: string;
  viabilityDate?: string;
  status?: MotherStrainStatus;
  remark?: string;
}

export interface CreateCultivationBatchRequest {
  batchCode: string;
  motherStrainId: number;
  quantity: number;
  cultureMedium: string;
  cultivationTemperature: number;
  cultivationHumidity: number;
  estimatedDays: number;
  remark?: string;
}

export interface UpdateCultivationBatchRequest {
  quantity?: number;
  cultureMedium?: string;
  cultivationTemperature?: number;
  cultivationHumidity?: number;
  estimatedDays?: number;
  actualQuantity?: number;
  remark?: string;
}

export interface QcInspectionRequest {
  qcResult: 'pass' | 'fail';
  qcRemark: string;
  qcItems: string[];
  sampleCount?: number;
  passCount?: number;
}

export interface GenerateTraceabilityRequest {
  categoryId: number;
  startDate: string;
  endDate: string;
  remark?: string;
}

export interface OperationLog {
  id: number;
  operationType: OperationType;
  module: string;
  recordId: number;
  recordCode?: string;
  operatorId: number;
  operatorName: string;
  oldValue?: string;
  newValue?: string;
  remark?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface LossStatistic {
  id: number;
  batchId: number;
  batchCode: string;
  categoryId: number;
  lossType: 'qc_failed' | 'contamination' | 'abnormal' | 'other';
  lossQuantity: number;
  lossReason: string;
  lossDate: Date;
  recordedBy: number;
  createdAt: Date;
}

export const BATCH_STATUS_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  [BatchStatus.PENDING]: [BatchStatus.INOCULATED, BatchStatus.SCRAPPED],
  [BatchStatus.INOCULATED]: [BatchStatus.CULTIVATING, BatchStatus.ABNORMAL, BatchStatus.SCRAPPED],
  [BatchStatus.CULTIVATING]: [BatchStatus.QC_INSPECTION, BatchStatus.ABNORMAL, BatchStatus.SCRAPPED],
  [BatchStatus.QC_INSPECTION]: [BatchStatus.QC_PASSED, BatchStatus.QC_FAILED, BatchStatus.ABNORMAL],
  [BatchStatus.QC_PASSED]: [BatchStatus.PACKAGED, BatchStatus.ABNORMAL, BatchStatus.SCRAPPED],
  [BatchStatus.QC_FAILED]: [BatchStatus.CULTIVATING, BatchStatus.LOCKED, BatchStatus.SCRAPPED],
  [BatchStatus.PACKAGED]: [BatchStatus.IN_STOCK, BatchStatus.ABNORMAL, BatchStatus.SCRAPPED],
  [BatchStatus.IN_STOCK]: [BatchStatus.SHIPPED, BatchStatus.ABNORMAL, BatchStatus.SCRAPPED],
  [BatchStatus.SHIPPED]: [BatchStatus.ABNORMAL],
  [BatchStatus.ABNORMAL]: [BatchStatus.CULTIVATING, BatchStatus.LOCKED, BatchStatus.SCRAPPED],
  [BatchStatus.SCRAPPED]: [],
  [BatchStatus.LOCKED]: []
};

export const QC_FAILED_LOCKED_STATUSES: BatchStatus[] = [
  BatchStatus.QC_FAILED,
  BatchStatus.LOCKED
];

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: [
    'category:create', 'category:update', 'category:delete', 'category:read',
    'mother_strain:create', 'mother_strain:update', 'mother_strain:delete', 'mother_strain:read', 'mother_strain:status',
    'batch:create', 'batch:update', 'batch:delete', 'batch:read', 'batch:status', 'batch:qc', 'batch:unlock',
    'traceability:create', 'traceability:read', 'traceability:delete',
    'log:read', 'user:create', 'user:update', 'user:delete', 'user:read'
  ],
  [UserRole.RESEARCHER]: [
    'category:read',
    'mother_strain:create', 'mother_strain:update', 'mother_strain:read', 'mother_strain:status',
    'batch:read',
    'traceability:create', 'traceability:read'
  ],
  [UserRole.CULTIVATOR]: [
    'category:read',
    'mother_strain:read',
    'batch:create', 'batch:update', 'batch:read', 'batch:status'
  ],
  [UserRole.QC]: [
    'category:read',
    'mother_strain:read',
    'batch:read', 'batch:qc'
  ]
};

export { Op, fn, col, where, literal } from 'sequelize';
