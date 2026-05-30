export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATION = 'operation',
  WAREHOUSE = 'warehouse',
  PROCESSOR = 'processor',
}

export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  AUDIT = 'audit',
  LOCK = 'lock',
  UNLOCK = 'unlock',
}

export enum PermissionModule {
  USER = 'user',
  CATEGORY = 'category',
  MATERIAL = 'material',
  PROCESS = 'process',
  INVENTORY = 'inventory',
  TASK = 'task',
  LOG = 'log',
  REPORT = 'report',
}

export const RolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
    'user:read',
    'user:create',
    'user:update',
    'user:delete',
    'category:read',
    'category:create',
    'category:update',
    'category:delete',
    'category:lock',
    'category:unlock',
    'material:read',
    'material:create',
    'material:update',
    'material:delete',
    'material:lock',
    'material:unlock',
    'process:read',
    'process:create',
    'process:update',
    'process:delete',
    'inventory:read',
    'inventory:create',
    'inventory:update',
    'inventory:delete',
    'inventory:export',
    'task:read',
    'log:read',
    'log:export',
    'report:read',
    'report:export',
  ],
  [UserRole.OPERATION]: [
    'category:read',
    'material:read',
    'material:create',
    'material:update',
    'process:read',
    'inventory:read',
    'inventory:create',
    'task:read',
    'report:read',
  ],
  [UserRole.WAREHOUSE]: [
    'category:read',
    'material:read',
    'material:update',
    'process:read',
    'inventory:read',
    'inventory:create',
    'inventory:update',
    'task:read',
  ],
  [UserRole.PROCESSOR]: [
    'category:read',
    'material:read',
    'process:read',
    'process:create',
    'process:update',
  ],
};

export const checkPermission = (userRole: UserRole, module: PermissionModule, action: PermissionAction): boolean => {
  const permission = `${module}:${action}`;
  const permissions = RolePermissions[userRole];
  return permissions.includes('*') || permissions.includes(permission);
};

