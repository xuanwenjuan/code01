export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TRAINER = 'trainer',
  WAREHOUSE = 'warehouse',
  PURCHASER = 'purchaser',
  ADMIN = 'admin'
}

export const RolePermissions = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: ['*'],
  [UserRole.TRAINER]: [
    'horse:read',
    'horse:write',
    'horse:vaccination',
    'application:create',
    'application:read',
    'application:update',
    'application:cancel',
    'application:complete',
    'forage:read',
    'stable:read'
  ],
  [UserRole.WAREHOUSE]: [
    'forage:read',
    'forage:write',
    'forage:delete',
    'horse:read',
    'application:read',
    'application:approve',
    'application:reject',
    'application:deliver',
    'application:return',
    'application:damage',
    'inventory:read',
    'inventory:write',
    'cost:read',
    'cost:generate',
    'stable:read'
  ],
  [UserRole.PURCHASER]: [
    'forage:read',
    'cost:read',
    'cost:generate',
    'inventory:read',
    'application:read'
  ]
};

export enum HorseStatus {
  HEALTHY = 'healthy',
  RESTING = 'resting',
  RACING = 'racing',
  SICK = 'sick',
  INJURED = 'injured',
  RETIRED = 'retired'
}

export enum ForageCategoryType {
  CONCENTRATE = 'concentrate',
  FORAGE = 'forage',
  SUPPLEMENT = 'supplement',
  MEDICINE = 'medicine'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  LOCKED = 'locked'
}

export enum ForageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OBSOLETE = 'obsolete'
}

export const ModuleNames = {
  FORAGE_CATEGORY: 'forage-category',
  HORSE: 'horse',
  APPLICATION: 'forage-application',
  INVENTORY: 'inventory',
  COST: 'cost',
  STABLE: 'stable',
  USER: 'user'
};

export const ActionTypes = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read',
  APPROVE: 'approve',
  REJECT: 'reject',
  DELIVER: 'deliver',
  RETURN: 'return',
  DAMAGE: 'damage',
  COMPLETE: 'complete',
  CANCEL: 'cancel',
  VACCINATION: 'vaccination',
  STATUS_CHANGE: 'statusChange',
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  GENERATE_REPORT: 'generateReport'
};
