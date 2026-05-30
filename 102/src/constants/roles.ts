export enum UserRole {
  ADMIN = 'admin',
  WINEMAKER = 'winemaker',
  CELLAR_MANAGER = 'cellar_manager',
  SALES = 'sales',
}

export const RolePermissions = {
  [UserRole.ADMIN]: ['*'],
  [UserRole.WINEMAKER]: [
    'material:view',
    'material:create',
    'material:update',
    'material:delete',
    'wine:view',
    'wine:create',
    'wine:update',
    'wine:delete',
    'workorder:view',
    'workorder:create',
    'workorder:update',
    'workorder:delete',
    'cost:view',
    'cost:create',
    'cost:update',
  ],
  [UserRole.CELLAR_MANAGER]: [
    'material:view',
    'material:update',
    'wine:view',
    'wine:update',
    'workorder:view',
    'workorder:update',
    'cost:view',
    'cost:update',
  ],
  [UserRole.SALES]: [
    'wine:view',
    'cost:view',
  ],
};

export const RoleNames = {
  [UserRole.ADMIN]: '系统管理员',
  [UserRole.WINEMAKER]: '酿酒师',
  [UserRole.CELLAR_MANAGER]: '窖藏管理员',
  [UserRole.SALES]: '销售',
};
