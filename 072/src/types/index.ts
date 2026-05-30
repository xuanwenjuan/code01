export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  DEPARTMENT_MANAGER = 'department_manager',
  OPERATOR = 'operator',
  EMPLOYEE = 'employee'
}

export enum ActivityStatus {
  DRAFT = 0,
  REGISTERING = 1,
  REGISTRATION_CLOSED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  CANCELLED = 5,
  CLOSED = 6
}

export enum RegistrationStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  CANCELLED = 3,
  CHECKED_IN = 4
}

export enum MerchantStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  SUSPENDED = 3
}

export interface DepartmentTree {
  id: number;
  name: string;
  parentId: number | null;
  children: DepartmentTree[];
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface OperationLogData {
  userId: number;
  userName: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  details?: any;
  ip?: string;
  userAgent?: string;
}

export interface ActivityStatistics {
  totalRegistrations: number;
  byStatus: { status: number; count: number }[];
  byDepartment: { departmentId: number; name: string; count: number }[];
  byActivity: { activityId: number; title: string; count: number }[];
}

export interface AuthTokenPayload {
  id: number;
  username: string;
  role: string;
  departmentId?: number;
}

export const PERMISSIONS = {
  CATEGORY: {
    VIEW: 'category:view',
    CREATE: 'category:create',
    UPDATE: 'category:update',
    DELETE: 'category:delete'
  },
  MERCHANT: {
    VIEW: 'merchant:view',
    CREATE: 'merchant:create',
    UPDATE: 'merchant:update',
    DELETE: 'merchant:delete',
    AUDIT: 'merchant:audit'
  },
  ACTIVITY: {
    VIEW: 'activity:view',
    CREATE: 'activity:create',
    UPDATE: 'activity:update',
    DELETE: 'activity:delete',
    PUBLISH: 'activity:publish'
  },
  REGISTRATION: {
    VIEW: 'registration:view',
    APPROVE: 'registration:approve',
    CHECKIN: 'registration:checkin',
    CANCEL: 'registration:cancel'
  },
  USER: {
    VIEW: 'user:view',
    CREATE: 'user:create',
    UPDATE: 'user:update',
    DELETE: 'user:delete'
  },
  DEPARTMENT: {
    VIEW: 'department:view',
    CREATE: 'department:create',
    UPDATE: 'department:update',
    DELETE: 'department:delete'
  }
} as const;

export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: Object.values(PERMISSIONS).flatMap(Object.values),
  [UserRole.ADMIN]: [
    PERMISSIONS.CATEGORY.VIEW,
    PERMISSIONS.CATEGORY.CREATE,
    PERMISSIONS.CATEGORY.UPDATE,
    PERMISSIONS.MERCHANT.VIEW,
    PERMISSIONS.MERCHANT.CREATE,
    PERMISSIONS.MERCHANT.UPDATE,
    PERMISSIONS.MERCHANT.AUDIT,
    PERMISSIONS.ACTIVITY.VIEW,
    PERMISSIONS.ACTIVITY.CREATE,
    PERMISSIONS.ACTIVITY.UPDATE,
    PERMISSIONS.ACTIVITY.PUBLISH,
    PERMISSIONS.REGISTRATION.VIEW,
    PERMISSIONS.REGISTRATION.APPROVE,
    PERMISSIONS.REGISTRATION.CHECKIN,
    PERMISSIONS.USER.VIEW,
    PERMISSIONS.DEPARTMENT.VIEW
  ],
  [UserRole.DEPARTMENT_MANAGER]: [
    PERMISSIONS.CATEGORY.VIEW,
    PERMISSIONS.MERCHANT.VIEW,
    PERMISSIONS.ACTIVITY.VIEW,
    PERMISSIONS.ACTIVITY.CREATE,
    PERMISSIONS.REGISTRATION.VIEW,
    PERMISSIONS.REGISTRATION.APPROVE,
    PERMISSIONS.REGISTRATION.CHECKIN
  ],
  [UserRole.OPERATOR]: [
    PERMISSIONS.CATEGORY.VIEW,
    PERMISSIONS.MERCHANT.VIEW,
    PERMISSIONS.ACTIVITY.VIEW,
    PERMISSIONS.REGISTRATION.VIEW
  ],
  [UserRole.EMPLOYEE]: [
    PERMISSIONS.CATEGORY.VIEW,
    PERMISSIONS.ACTIVITY.VIEW
  ]
} as const;

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.DRAFT]: '草稿',
  [ActivityStatus.REGISTERING]: '报名中',
  [ActivityStatus.REGISTRATION_CLOSED]: '报名截止',
  [ActivityStatus.IN_PROGRESS]: '进行中',
  [ActivityStatus.COMPLETED]: '已完成',
  [ActivityStatus.CANCELLED]: '已取消',
  [ActivityStatus.CLOSED]: '已关闭'
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  [RegistrationStatus.PENDING]: '待审核',
  [RegistrationStatus.APPROVED]: '已通过',
  [RegistrationStatus.REJECTED]: '已拒绝',
  [RegistrationStatus.CANCELLED]: '已取消',
  [RegistrationStatus.CHECKED_IN]: '已签到'
};

export const MERCHANT_STATUS_LABELS: Record<MerchantStatus, string> = {
  [MerchantStatus.PENDING]: '待审核',
  [MerchantStatus.APPROVED]: '已通过',
  [MerchantStatus.REJECTED]: '已拒绝',
  [MerchantStatus.SUSPENDED]: '已暂停'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '超级管理员',
  [UserRole.ADMIN]: '管理员',
  [UserRole.DEPARTMENT_MANAGER]: '部门经理',
  [UserRole.OPERATOR]: '运营人员',
  [UserRole.EMPLOYEE]: '普通员工'
};
