export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  WINEMAKER = 'winemaker',
  CELLAR_MANAGER = 'cellar_manager',
  SALES = 'sales',
}

export const RoleNames = {
  [UserRole.SUPER_ADMIN]: '超级管理员',
  [UserRole.WINEMAKER]: '酿酒师',
  [UserRole.CELLAR_MANAGER]: '窖藏管理员',
  [UserRole.SALES]: '销售专员',
};

export enum Permission {
  MATERIAL_VIEW = 'material:view',
  MATERIAL_CREATE = 'material:create',
  MATERIAL_UPDATE = 'material:update',
  MATERIAL_DELETE = 'material:delete',
  MATERIAL_STOCK_IN = 'material:stock_in',
  MATERIAL_STOCK_OUT = 'material:stock_out',
  MATERIAL_LOCK = 'material:lock',
  
  CATEGORY_VIEW = 'category:view',
  CATEGORY_CREATE = 'category:create',
  CATEGORY_UPDATE = 'category:update',
  CATEGORY_DELETE = 'category:delete',
  
  WINE_VIEW = 'wine:view',
  WINE_CREATE = 'wine:create',
  WINE_UPDATE = 'wine:update',
  WINE_DELETE = 'wine:delete',
  
  WORKORDER_VIEW = 'workorder:view',
  WORKORDER_CREATE = 'workorder:create',
  WORKORDER_UPDATE = 'workorder:update',
  WORKORDER_DELETE = 'workorder:delete',
  WORKORDER_ADVANCE = 'workorder:advance',
  WORKORDER_COMPLETE = 'workorder:complete',
  WORKORDER_MATERIAL_SELECT = 'workorder:material_select',
  WORKORDER_LOSS_RECORD = 'workorder:loss_record',
  
  COST_VIEW = 'cost:view',
  COST_CREATE = 'cost:create',
  COST_UPDATE = 'cost:update',
  COST_DELETE = 'cost:delete',
  COST_CALCULATE = 'cost:calculate',
  
  LOG_VIEW = 'log:view',
  SYSTEM_CONFIG = 'system:config',
}

export const RolePermissionMatrix = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.WINEMAKER]: [
    Permission.MATERIAL_VIEW,
    Permission.MATERIAL_STOCK_IN,
    Permission.MATERIAL_LOCK,
    Permission.CATEGORY_VIEW,
    Permission.WINE_VIEW,
    Permission.WINE_CREATE,
    Permission.WINE_UPDATE,
    Permission.WORKORDER_VIEW,
    Permission.WORKORDER_CREATE,
    Permission.WORKORDER_UPDATE,
    Permission.WORKORDER_ADVANCE,
    Permission.WORKORDER_COMPLETE,
    Permission.WORKORDER_MATERIAL_SELECT,
    Permission.WORKORDER_LOSS_RECORD,
    Permission.COST_VIEW,
    Permission.COST_CALCULATE,
  ],
  
  [UserRole.CELLAR_MANAGER]: [
    Permission.MATERIAL_VIEW,
    Permission.MATERIAL_STOCK_IN,
    Permission.MATERIAL_STOCK_OUT,
    Permission.CATEGORY_VIEW,
    Permission.WINE_VIEW,
    Permission.WINE_UPDATE,
    Permission.WORKORDER_VIEW,
    Permission.WORKORDER_UPDATE,
    Permission.WORKORDER_ADVANCE,
    Permission.WORKORDER_COMPLETE,
    Permission.COST_VIEW,
  ],
  
  [UserRole.SALES]: [
    Permission.WINE_VIEW,
    Permission.COST_VIEW,
  ],
};

export enum MaterialCategoryType {
  GRAPE = 'grape',
  YEAST = 'yeast',
  ADDITIVE = 'additive',
  BARREL = 'barrel',
}

export enum WineStatus {
  BREWING = 'brewing',
  FERMENTING = 'fermenting',
  AGING = 'aging',
  BLENDING = 'blending',
  BOTTLING = 'bottling',
  CELLARING = 'cellaring',
  FINISHED = 'finished',
  SOLD = 'sold',
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  SORTING = 'sorting',
  FERMENTING = 'fermenting',
  AGING = 'aging',
  BLENDING = 'blending',
  BOTTLING = 'bottling',
  STORING = 'storing',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum WorkOrderStage {
  SORTING_PRESSING = 'sorting_pressing',
  CONSTANT_TEMP_FERMENTATION = 'constant_temp_fermentation',
  BARREL_AGING = 'barrel_aging',
  WINE_BLENDING = 'wine_blending',
  BOTTLING_SEALING = 'bottling_sealing',
  WAREHOUSE_STORAGE = 'warehouse_storage',
}

export const StageFlow: Record<string, string | null> = {
  [WorkOrderStage.SORTING_PRESSING]: WorkOrderStage.CONSTANT_TEMP_FERMENTATION,
  [WorkOrderStage.CONSTANT_TEMP_FERMENTATION]: WorkOrderStage.BARREL_AGING,
  [WorkOrderStage.BARREL_AGING]: WorkOrderStage.WINE_BLENDING,
  [WorkOrderStage.WINE_BLENDING]: WorkOrderStage.BOTTLING_SEALING,
  [WorkOrderStage.BOTTLING_SEALING]: WorkOrderStage.WAREHOUSE_STORAGE,
  [WorkOrderStage.WAREHOUSE_STORAGE]: null,
};

export enum MaterialStatus {
  NORMAL = 'normal',
  LOCKED = 'locked',
  USED = 'used',
  SCRAPPED = 'scrapped',
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  SCRAP = 'scrap',
  COMPLETE = 'complete',
  ADVANCE_STAGE = 'advance_stage',
  ROLLBACK_STAGE = 'rollback_stage',
  SUSPEND = 'suspend',
  RESUME = 'resume',
}

export const CostType = {
  MATERIAL: 'material',
  LABOR: 'labor',
  STORAGE: 'storage',
  ENERGY: 'energy',
  LOSS: 'loss',
  OTHER: 'other',
};

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
  requestId?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
