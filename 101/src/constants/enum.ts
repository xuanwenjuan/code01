export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  BREEDER = 'BREEDER',
  TRAINER = 'TRAINER',
  FINANCE = 'FINANCE'
}

export enum PigeonType {
  BLOOD = 'BLOOD',
  RACE = 'RACE',
  BREEDING = 'BREEDING',
  YOUNG = 'YOUNG'
}

export enum PigeonStatus {
  IN_LOFT = 'IN_LOFT',
  TRAINING = 'TRAINING',
  RACING = 'RACING',
  RETIRED = 'RETIRED',
  DECEASED = 'DECEASED'
}

export enum HealthStatus {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  NORMAL = 'NORMAL',
  SICK = 'SICK',
  INJURED = 'INJURED'
}

export enum WorkOrderType {
  HOME_FLY = 'HOME_FLY',
  SHORT_DISTANCE = 'SHORT_DISTANCE',
  FORMAL_RACE = 'FORMAL_RACE'
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  LOCKED = 'LOCKED'
}

export enum ExpenseType {
  FEED = 'FEED',
  MEDICINE = 'MEDICINE',
  TRAINING = 'TRAINING',
  RACE_FEE = 'RACE_FEE',
  BREEDING = 'BREEDING',
  OTHER = 'OTHER'
}

export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  QUERY = 'QUERY',
  LOCK = 'LOCK',
  UNLOCK = 'UNLOCK',
  CONFIRM = 'CONFIRM',
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE'
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '超级管理员',
  [UserRole.ADMIN]: '管理员',
  [UserRole.BREEDER]: '繁育员',
  [UserRole.TRAINER]: '训放员',
  [UserRole.FINANCE]: '财务'
};

export const PIGEON_TYPE_LABELS: Record<PigeonType, string> = {
  [PigeonType.BLOOD]: '血统鸽',
  [PigeonType.RACE]: '比赛鸽',
  [PigeonType.BREEDING]: '种鸽',
  [PigeonType.YOUNG]: '幼鸽'
};

export const PIGEON_STATUS_LABELS: Record<PigeonStatus, string> = {
  [PigeonStatus.IN_LOFT]: '在棚',
  [PigeonStatus.TRAINING]: '外训',
  [PigeonStatus.RACING]: '参赛',
  [PigeonStatus.RETIRED]: '退役',
  [PigeonStatus.DECEASED]: '死亡'
};

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  [HealthStatus.EXCELLENT]: '优秀',
  [HealthStatus.GOOD]: '良好',
  [HealthStatus.NORMAL]: '正常',
  [HealthStatus.SICK]: '生病',
  [HealthStatus.INJURED]: '受伤'
};

export const WORK_ORDER_TYPE_LABELS: Record<WorkOrderType, string> = {
  [WorkOrderType.HOME_FLY]: '家飞训练',
  [WorkOrderType.SHORT_DISTANCE]: '短途训放',
  [WorkOrderType.FORMAL_RACE]: '正式赛事'
};

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  [WorkOrderStatus.PENDING]: '待确认',
  [WorkOrderStatus.CONFIRMED]: '已确认',
  [WorkOrderStatus.IN_PROGRESS]: '进行中',
  [WorkOrderStatus.COMPLETED]: '已完成',
  [WorkOrderStatus.CANCELLED]: '已取消',
  [WorkOrderStatus.LOCKED]: '已锁定'
};

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  [ExpenseType.FEED]: '饲料耗材',
  [ExpenseType.MEDICINE]: '医药防疫',
  [ExpenseType.TRAINING]: '训放费用',
  [ExpenseType.RACE_FEE]: '赛事报名费',
  [ExpenseType.BREEDING]: '繁育成本',
  [ExpenseType.OTHER]: '其他支出'
};

export const CATEGORY_STATUS_LABELS: Record<CategoryStatus, string> = {
  [CategoryStatus.ACTIVE]: '启用',
  [CategoryStatus.INACTIVE]: '下架'
};

export const PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'category:read', 'category:write', 'category:delete', 'category:status',
    'pigeon:read', 'pigeon:write', 'pigeon:delete', 'pigeon:status',
    'workorder:read', 'workorder:write', 'workorder:delete', 'workorder:lock', 'workorder:status',
    'expense:read', 'expense:write', 'expense:delete', 'expense:approve',
    'user:read', 'user:write', 'user:delete', 'user:role',
    'log:read', 'system:config'
  ],
  [UserRole.ADMIN]: [
    'category:read', 'category:write', 'category:status',
    'pigeon:read', 'pigeon:write', 'pigeon:status',
    'workorder:read', 'workorder:write', 'workorder:lock', 'workorder:status',
    'expense:read', 'expense:write',
    'user:read'
  ],
  [UserRole.BREEDER]: [
    'category:read',
    'pigeon:read', 'pigeon:write',
    'workorder:read'
  ],
  [UserRole.TRAINER]: [
    'category:read',
    'pigeon:read', 'pigeon:status',
    'workorder:read', 'workorder:write', 'workorder:status'
  ],
  [UserRole.FINANCE]: [
    'category:read',
    'pigeon:read',
    'workorder:read',
    'expense:read', 'expense:write', 'expense:approve'
  ]
};
