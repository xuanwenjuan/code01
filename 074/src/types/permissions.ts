import { UserRole } from './enums';

export interface Permission {
  module: string;
  actions: string[];
}

export const PermissionAction = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  ATTENDANCE: 'attendance',
  PAYMENT: 'payment',
  ENROLL: 'enroll',
  RATE: 'rate',
  EXPORT: 'export',
  AUDIT: 'audit'
} as const;

export type PermissionActionType = typeof PermissionAction[keyof typeof PermissionAction];

export const PermissionModule = {
  COURSE_CATEGORY: 'course_category',
  TEACHER: 'teacher',
  STUDENT: 'student',
  CLASS: 'class',
  ENROLLMENT: 'enrollment',
  ATTENDANCE: 'attendance',
  PAYMENT: 'payment',
  AUTH: 'auth',
  SCHEDULE: 'schedule',
  REPORT: 'report',
  LOG: 'log',
  USER: 'user'
} as const;

export type PermissionModuleType = typeof PermissionModule[keyof typeof PermissionModule];

export const Permission = {
  COURSE_CATEGORY: {
    VIEW: `${PermissionModule.COURSE_CATEGORY}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.COURSE_CATEGORY}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.COURSE_CATEGORY}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.COURSE_CATEGORY}:${PermissionAction.DELETE}`
  },
  TEACHER: {
    VIEW: `${PermissionModule.TEACHER}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.TEACHER}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.TEACHER}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.TEACHER}:${PermissionAction.DELETE}`,
    RATE: `${PermissionModule.TEACHER}:${PermissionAction.RATE}`
  },
  STUDENT: {
    VIEW: `${PermissionModule.STUDENT}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.STUDENT}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.STUDENT}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.STUDENT}:${PermissionAction.DELETE}`,
    ENROLL: `${PermissionModule.STUDENT}:${PermissionAction.ENROLL}`
  },
  CLASS: {
    VIEW: `${PermissionModule.CLASS}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.CLASS}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.CLASS}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.CLASS}:${PermissionAction.DELETE}`,
    ATTENDANCE: `${PermissionModule.CLASS}:${PermissionAction.ATTENDANCE}`
  },
  ENROLLMENT: {
    VIEW: `${PermissionModule.ENROLLMENT}:${PermissionAction.VIEW}`,
    APPROVE: `${PermissionModule.ENROLLMENT}:${PermissionAction.APPROVE}`,
    REJECT: `${PermissionModule.ENROLLMENT}:${PermissionAction.REJECT}`,
    CANCEL: `${PermissionModule.ENROLLMENT}:${PermissionAction.DELETE}`
  },
  ATTENDANCE: {
    VIEW: `${PermissionModule.ATTENDANCE}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.ATTENDANCE}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.ATTENDANCE}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.ATTENDANCE}:${PermissionAction.DELETE}`,
    EXPORT: `${PermissionModule.ATTENDANCE}:${PermissionAction.EXPORT}`
  },
  PAYMENT: {
    VIEW: `${PermissionModule.PAYMENT}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.PAYMENT}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.PAYMENT}:${PermissionAction.UPDATE}`,
    AUDIT: `${PermissionModule.PAYMENT}:${PermissionAction.AUDIT}`
  },
  REPORT: {
    VIEW: `${PermissionModule.REPORT}:${PermissionAction.VIEW}`,
    EXPORT: `${PermissionModule.REPORT}:${PermissionAction.EXPORT}`
  },
  LOG: {
    VIEW: `${PermissionModule.LOG}:${PermissionAction.VIEW}`,
    EXPORT: `${PermissionModule.LOG}:${PermissionAction.EXPORT}`
  },
  USER: {
    VIEW: `${PermissionModule.USER}:${PermissionAction.VIEW}`,
    CREATE: `${PermissionModule.USER}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionModule.USER}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionModule.USER}:${PermissionAction.DELETE}`
  },
  AUTH: {
    CHANGE_PASSWORD: `${PermissionModule.AUTH}:change_password`
  }
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission).flatMap((module) => Object.values(module)),
  
  [UserRole.ADMIN]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.COURSE_CATEGORY.CREATE,
    Permission.COURSE_CATEGORY.UPDATE,
    Permission.TEACHER.VIEW,
    Permission.TEACHER.CREATE,
    Permission.TEACHER.UPDATE,
    Permission.STUDENT.VIEW,
    Permission.STUDENT.CREATE,
    Permission.STUDENT.UPDATE,
    Permission.STUDENT.ENROLL,
    Permission.CLASS.VIEW,
    Permission.CLASS.CREATE,
    Permission.CLASS.UPDATE,
    Permission.CLASS.ATTENDANCE,
    Permission.ENROLLMENT.VIEW,
    Permission.ENROLLMENT.APPROVE,
    Permission.ENROLLMENT.REJECT,
    Permission.ATTENDANCE.VIEW,
    Permission.ATTENDANCE.CREATE,
    Permission.ATTENDANCE.UPDATE,
    Permission.PAYMENT.VIEW,
    Permission.REPORT.VIEW,
    Permission.AUTH.CHANGE_PASSWORD
  ],

  [UserRole.EDUCATION_ADMIN]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.STUDENT.CREATE,
    Permission.STUDENT.UPDATE,
    Permission.STUDENT.ENROLL,
    Permission.CLASS.VIEW,
    Permission.CLASS.CREATE,
    Permission.CLASS.UPDATE,
    Permission.CLASS.ATTENDANCE,
    Permission.ENROLLMENT.VIEW,
    Permission.ENROLLMENT.APPROVE,
    Permission.ENROLLMENT.REJECT,
    Permission.ATTENDANCE.VIEW,
    Permission.ATTENDANCE.CREATE,
    Permission.ATTENDANCE.UPDATE,
    Permission.ATTENDANCE.EXPORT,
    Permission.REPORT.VIEW,
    Permission.AUTH.CHANGE_PASSWORD
  ],

  [UserRole.FINANCE_ADMIN]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.CLASS.VIEW,
    Permission.ENROLLMENT.VIEW,
    Permission.ATTENDANCE.VIEW,
    Permission.PAYMENT.VIEW,
    Permission.PAYMENT.CREATE,
    Permission.PAYMENT.UPDATE,
    Permission.PAYMENT.AUDIT,
    Permission.REPORT.VIEW,
    Permission.REPORT.EXPORT,
    Permission.AUTH.CHANGE_PASSWORD
  ],

  [UserRole.TEACHER]: [
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.CLASS.VIEW,
    Permission.CLASS.ATTENDANCE,
    Permission.ATTENDANCE.VIEW,
    Permission.ATTENDANCE.CREATE,
    Permission.ATTENDANCE.UPDATE,
    Permission.AUTH.CHANGE_PASSWORD
  ],

  [UserRole.STAFF]: [
    Permission.COURSE_CATEGORY.VIEW,
    Permission.TEACHER.VIEW,
    Permission.STUDENT.VIEW,
    Permission.STUDENT.CREATE,
    Permission.STUDENT.UPDATE,
    Permission.STUDENT.ENROLL,
    Permission.CLASS.VIEW,
    Permission.ATTENDANCE.VIEW,
    Permission.AUTH.CHANGE_PASSWORD
  ]
};
