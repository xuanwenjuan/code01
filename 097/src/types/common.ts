export interface IResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  success: boolean;
}

export interface IPaginationParams {
  page: number;
  pageSize: number;
}

export interface IPaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PURCHASER = 'purchaser',
  WAREHOUSE_KEEPER = 'warehouse_keeper',
  SALESMAN = 'salesman',
  FINANCE = 'finance'
}

export const RolePermissionMatrix: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'category:read', 'category:write', 'category:delete',
    'product:read', 'product:write', 'product:delete',
    'supplier:read', 'supplier:write', 'supplier:delete',
    'document:read', 'document:create', 'document:approve', 'document:delete',
    'inventory:adjust', 'statistics:read', 'finance:view',
    'user:read', 'user:write', 'user:delete',
    'log:read'
  ],
  [UserRole.ADMIN]: [
    'category:read', 'category:write', 'category:delete',
    'product:read', 'product:write', 'product:delete',
    'supplier:read', 'supplier:write', 'supplier:delete',
    'document:read', 'document:create', 'document:approve',
    'inventory:adjust', 'statistics:read', 'finance:view',
    'user:read', 'log:read'
  ],
  [UserRole.PURCHASER]: [
    'category:read',
    'product:read',
    'supplier:read', 'supplier:write',
    'document:read', 'document:create:purchase',
    'statistics:read'
  ],
  [UserRole.WAREHOUSE_KEEPER]: [
    'category:read',
    'product:read',
    'document:read', 'document:create:transfer', 'document:create:damage', 'document:approve',
    'inventory:adjust',
    'statistics:read'
  ],
  [UserRole.SALESMAN]: [
    'category:read',
    'product:read',
    'document:read', 'document:create:retail', 'document:create:return',
    'statistics:read'
  ],
  [UserRole.FINANCE]: [
    'category:read',
    'product:read',
    'supplier:read',
    'document:read',
    'statistics:read', 'finance:view', 'finance:export'
  ]
};

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum DocumentType {
  PURCHASE = 'purchase',
  TRANSFER_OUT = 'transfer_out',
  RETAIL = 'retail',
  RETURN = 'return',
  DAMAGE = 'damage'
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  CANCEL = 'cancel',
  EXPORT = 'export',
  IMPORT = 'import',
  ADJUST = 'adjust'
}

export enum ModuleType {
  CATEGORY = 'category',
  PRODUCT = 'product',
  SUPPLIER = 'supplier',
  DOCUMENT = 'document',
  INVENTORY = 'inventory',
  USER = 'user',
  STATISTICS = 'statistics'
}

export interface IDocumentItemProfit {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  unitProfit: number;
  totalProfit: number;
  profitRate: number;
}
