export enum ClubCategory {
  LITERATURE = 'literature',
  BASKETBALL = 'basketball',
  PROGRAMMING = 'programming',
  MUSIC = 'music',
  ART = 'art',
  SCIENCE = 'science',
  OTHER = 'other'
}

export const clubCategoryLabels: Readonly<Record<ClubCategory, string>> = {
  [ClubCategory.LITERATURE]: '文学社',
  [ClubCategory.BASKETBALL]: '篮球社',
  [ClubCategory.PROGRAMMING]: '编程社',
  [ClubCategory.MUSIC]: '音乐社',
  [ClubCategory.ART]: '美术社',
  [ClubCategory.SCIENCE]: '科技社',
  [ClubCategory.OTHER]: '其他社团'
} as const

export enum ActivityStatus {
  PREPARING = 'preparing',
  SIGNING_UP = 'signing_up',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export const activityStatusLabels: Readonly<Record<ActivityStatus, string>> = {
  [ActivityStatus.PREPARING]: '筹备中',
  [ActivityStatus.SIGNING_UP]: '报名中',
  [ActivityStatus.ENDED]: '已结束',
  [ActivityStatus.CANCELLED]: '已取消'
} as const

export enum RegistrationStatus {
  REGISTERED = 'registered',
  CHECKED_IN = 'checked_in',
  LEAVE = 'leave',
  REJECTED = 'rejected'
}

export const registrationStatusLabels: Readonly<Record<RegistrationStatus, string>> = {
  [RegistrationStatus.REGISTERED]: '已报名',
  [RegistrationStatus.CHECKED_IN]: '已签到',
  [RegistrationStatus.LEAVE]: '已请假',
  [RegistrationStatus.REJECTED]: '已取消'
} as const

export enum OperationType {
  CREATE_ACTIVITY = 'create_activity',
  UPDATE_ACTIVITY = 'update_activity',
  CANCEL_ACTIVITY = 'cancel_activity',
  APPROVE_REGISTRATION = 'approve_registration',
  REJECT_REGISTRATION = 'reject_registration',
  CHECK_IN = 'check_in',
  BATCH_CHECK_IN = 'batch_check_in',
  LEAVE = 'leave',
  EXPORT_LIST = 'export_list',
  CREATE_CLUB = 'create_club',
  UPDATE_CLUB = 'update_club',
  DELETE_CLUB = 'delete_club',
  SCAN_CHECK_IN = 'scan_check_in'
}

export const operationTypeLabels: Readonly<Record<OperationType, string>> = {
  [OperationType.CREATE_ACTIVITY]: '创建活动',
  [OperationType.UPDATE_ACTIVITY]: '更新活动',
  [OperationType.CANCEL_ACTIVITY]: '取消活动',
  [OperationType.APPROVE_REGISTRATION]: '通过报名',
  [OperationType.REJECT_REGISTRATION]: '拒绝报名',
  [OperationType.CHECK_IN]: '签到',
  [OperationType.BATCH_CHECK_IN]: '批量签到',
  [OperationType.LEAVE]: '请假',
  [OperationType.EXPORT_LIST]: '导出名单',
  [OperationType.CREATE_CLUB]: '创建社团',
  [OperationType.UPDATE_CLUB]: '更新社团',
  [OperationType.DELETE_CLUB]: '删除社团',
  [OperationType.SCAN_CHECK_IN]: '扫码签到'
} as const

export enum UserRole {
  ADMIN = 'admin',
  CLUB_MANAGER = 'club_manager',
  STUDENT = 'student'
}

export const userRoleLabels: Readonly<Record<UserRole, string>> = {
  [UserRole.ADMIN]: '系统管理员',
  [UserRole.CLUB_MANAGER]: '社团负责人',
  [UserRole.STUDENT]: '学生'
} as const

export enum CheckInMethod {
  MANUAL = 'manual',
  SCAN_CODE = 'scan_code',
  FACE = 'face'
}

export const checkInMethodLabels: Readonly<Record<CheckInMethod, string>> = {
  [CheckInMethod.MANUAL]: '手动签到',
  [CheckInMethod.SCAN_CODE]: '扫码签到',
  [CheckInMethod.FACE]: '人脸签到'
} as const

export interface CountdownInfo {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isExpired: boolean
  isStarted: boolean
  formatted: string
}

export interface Club {
  readonly id: string
  name: string
  category: ClubCategory
  description: string
  managerId: string
  managerName: string
  memberCount: number
  readonly createdAt: string
  updatedAt: string
}

export interface Activity {
  readonly id: string
  clubId: string
  clubName: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  maxParticipants: number
  currentParticipants: number
  status: ActivityStatus
  checkInEnabled: boolean
  checkInStartTime: string | null
  readonly createdAt: string
  updatedAt: string
}

export interface Registration {
  readonly id: string
  activityId: string
  activityTitle: string
  studentId: string
  studentName: string
  studentClass: string
  phone: string
  status: RegistrationStatus
  checkInMethod: CheckInMethod | null
  readonly registeredAt: string
  checkedInAt: string | null
}

export interface LogExtraData {
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  affectedCount?: number
  activityId?: string
  activityTitle?: string
}

export interface OperationLog {
  readonly id: string
  operatorId: string
  operatorName: string
  operatorRole: UserRole
  operationType: OperationType
  targetId: string
  targetName: string
  details: string
  extraData?: LogExtraData
  readonly createdAt: string
}

export interface User {
  readonly id: string
  name: string
  role: UserRole
  clubId: string | null
  clubName: string | null
}

export interface ClubFormData {
  name: string
  category: ClubCategory
  description: string
  managerName: string
  memberCount: number
}

export interface ActivityFormData {
  title: string
  clubId: string
  description: string
  location: string
  startTime: string
  endTime: string
  maxParticipants: number
  status: ActivityStatus
  checkInEnabled: boolean
  checkInStartTime: string | null
}

export interface RegistrationFormData {
  activityId: string
  studentId: string
  studentName: string
  studentClass: string
  phone: string
}

export interface ActivityFilter {
  clubId?: string
  status?: ActivityStatus
  keyword?: string
  startDate?: string
  endDate?: string
  hasRegistration?: boolean
  checkInEnabled?: boolean
}

export interface RegistrationFilter {
  activityId?: string
  status?: RegistrationStatus
  keyword?: string
  studentId?: string
  checkInMethod?: CheckInMethod
}

export interface OperationLogFilter {
  operatorId?: string
  operationType?: OperationType
  startDate?: string
  endDate?: string
  keyword?: string
  operatorRole?: UserRole
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface CheckInRecord {
  readonly id: string
  registrationId: string
  activityId: string
  studentId: string
  studentName: string
  checkInMethod: CheckInMethod
  checkInTime: string
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
}

export type SelectOption<T = string> = {
  label: string
  value: T
  disabled?: boolean
}

export interface ValidationRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  type?: string
}

export interface ActivityStats {
  total: number
  preparing: number
  signingUp: number
  ended: number
  cancelled: number
}

export interface RegistrationStats {
  total: number
  registered: number
  checkedIn: number
  leave: number
  rejected: number
}

export interface DashboardStats {
  clubs: number
  activities: number
  registrations: number
  checkedIn: number
  activityStats: ActivityStats
  registrationStats: RegistrationStats
}
