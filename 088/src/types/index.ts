export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COLLECTION_MANAGER = 'collection_manager',
  RESTORATION_TECHNICIAN = 'restoration_technician',
  EXHIBITION_PLANNER = 'exhibition_planner'
}

export enum CollectionStatus {
  INTACT = 'intact',
  NEEDS_RESTORATION = 'needs_restoration',
  UNDER_RESTORATION = 'under_restoration',
  IN_EXHIBITION = 'in_exhibition',
  ARCHIVED = 'archived',
  LOCKED = 'locked'
}

export enum RestorationStatus {
  SUBMITTED = 'submitted',
  PLAN_APPROVED = 'plan_approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INSPECTED = 'inspected',
  RETURNED = 'returned',
  CANCELLED = 'cancelled'
}

export enum CategoryType {
  ARTIFACT = 'artifact',
  SPECIMEN = 'specimen',
  ANCIENT_BOOK = 'ancient_book',
  FOLKLORE = 'folklore',
  OTHER = 'other'
}

export enum OperationModule {
  USER = 'user',
  CATEGORY = 'category',
  COLLECTION = 'collection',
  RESTORATION = 'restoration',
  EXHIBITION = 'exhibition',
  MAINTENANCE = 'maintenance'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  UNARCHIVE = 'unarchive',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  START = 'start',
  COMPLETE = 'complete',
  INSPECT = 'inspect',
  RETURN = 'return',
  ROTATE = 'rotate',
  IMPORT = 'import',
  EXPORT = 'export',
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp?: string;
  requestId?: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  realName?: string;
}

export interface RequestWithUser extends Express.Request {
  user?: JwtPayload;
  requestId?: string;
}

export interface CollectionFilterParams {
  categoryId?: number;
  status?: CollectionStatus;
  era?: string;
  material?: string;
  origin?: string;
  preservationLevel?: number;
  keyword?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateCollectionDTO {
  name: string;
  categoryId: number;
  collectionNo?: string;
  era?: string;
  material?: string;
  origin?: string;
  preservationLevel?: number;
  description?: string;
  location?: string;
  maintenanceCycleDays?: number;
}

export interface UpdateCollectionDTO {
  name?: string;
  categoryId?: number;
  era?: string;
  material?: string;
  origin?: string;
  preservationLevel?: number;
  description?: string;
  location?: string;
  status?: CollectionStatus;
  maintenanceCycleDays?: number;
}

export interface CreateRestorationDTO {
  collectionId: number;
  damageDescription?: string;
  expectedCompletionDate?: Date;
  priority?: number;
}

export interface ApproveRestorationDTO {
  restorationPlan: string;
  estimatedCost?: number;
}

export interface CompleteRestorationDTO {
  restorationNotes: string;
  actualCost?: number;
  actualCompletionDate?: Date;
}

export interface CreateExhibitionDTO {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  organizer?: string;
}

export interface UpdateExhibitionDTO {
  name?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  description?: string;
  organizer?: string;
}

export interface RotateCollectionDTO {
  oldCollectionId: number;
  newCollectionId: number;
  position?: string;
  reason?: string;
}

export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
  parentId?: number;
  sortOrder?: number;
  description?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  type?: CategoryType;
  parentId?: number | null;
  sortOrder?: number;
  description?: string;
  isArchived?: boolean;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  realName: string;
  role: UserRole;
  phone?: string;
  email?: string;
}

export interface UpdateUserDTO {
  realName?: string;
  role?: UserRole;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface MaintenanceRecordDTO {
  maintenanceType: string;
  description?: string;
  cost?: number;
  nextMaintenanceDate?: Date;
}

export interface BatchImportResult<T> {
  success: T[];
  failed: Array<{ data: any; reason: string }>;
  total: number;
  successCount: number;
  failedCount: number;
}

export interface ExhibitionStatistics {
  totalExhibitions: number;
  totalCollections: number;
  totalMaintenanceCost: number;
  averageCostPerExhibition: number;
  averageRotationsPerCollection: number;
  exhibitionsByLocation: Record<string, number>;
}

export interface CollectionStatistics {
  total: number;
  byStatus: Record<CollectionStatus, number>;
  byCategory: Record<string, number>;
  maintenance: {
    dueIn7Days: number;
    overdue: number;
    completedThisMonth: number;
  };
}

export interface IUser {
  id: number;
  username: string;
  realName: string;
  role: UserRole;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: number;
  name: string;
  type: CategoryType;
  parentId?: number;
  sortOrder: number;
  isArchived: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  children?: ICategory[];
}

export interface ICollection {
  id: number;
  collectionNo: string;
  name: string;
  categoryId: number;
  era?: string;
  material?: string;
  origin?: string;
  preservationLevel: number;
  status: CollectionStatus;
  description?: string;
  location?: string;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  maintenanceCycleDays: number;
  exhibitionCount: number;
  totalExhibitionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRestoration {
  id: number;
  collectionId: number;
  submittedBy: number;
  submissionDate: Date;
  status: RestorationStatus;
  damageDescription?: string;
  restorationPlan?: string;
  planApprovedBy?: number;
  planApprovedDate?: Date;
  technicianId?: number;
  startDate?: Date;
  endDate?: Date;
  restorationNotes?: string;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  estimatedCost?: number;
  actualCost?: number;
  inspectorId?: number;
  inspectionDate?: Date;
  inspectionNotes?: string;
  priority?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExhibition {
  id: number;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  organizer?: string;
  totalCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExhibitionCollection {
  id: number;
  exhibitionId: number;
  collectionId: number;
  position?: string;
  displayOrder: number;
  inDate?: Date;
  outDate?: Date;
  maintenanceCost?: number;
  rotationCount: number;
  totalExhibitionDays: number;
  maintenanceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMaintenanceRecord {
  id: number;
  collectionId: number;
  performedBy: number;
  maintenanceDate: Date;
  maintenanceType: string;
  description?: string;
  cost?: number;
  nextMaintenanceDate?: Date;
  createdAt: Date;
}

export interface IOperationLog {
  id: number;
  userId: number;
  username: string;
  operation: string;
  module: string;
  ip?: string;
  userAgent?: string;
  requestParams?: string;
  responseData?: string;
  status: boolean;
  errorMessage?: string;
  createdAt: Date;
}
