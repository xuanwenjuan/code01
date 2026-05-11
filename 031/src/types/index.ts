export const CARD_TYPE_MAP = {
  month: '月卡',
  quarter: '季卡',
  year: '年卡',
  times: '次卡',
} as const

export const MEMBER_STATUS_MAP = {
  normal: '正常',
  expired: '已过期',
  frozen: '已冻结',
} as const

export const APPOINTMENT_STATUS_MAP = {
  booked: '已预约',
  checked_in: '已签到',
  cancelled: '已取消',
} as const

export const COURSE_STATUS_MAP = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消',
} as const

export const CARD_STATUS_MAP = {
  active: '启用',
  inactive: '禁用',
} as const

export const ROLE_MAP = {
  admin: '管理员',
  receptionist: '前台',
  coach: '教练',
} as const

export const GENDER_MAP = {
  male: '男',
  female: '女',
} as const

export type CardType = keyof typeof CARD_TYPE_MAP

export type MemberStatus = keyof typeof MEMBER_STATUS_MAP

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_MAP

export type CourseStatus = keyof typeof COURSE_STATUS_MAP

export type CardStatus = keyof typeof CARD_STATUS_MAP

export type UserRole = keyof typeof ROLE_MAP

export type Gender = keyof typeof GENDER_MAP

export type OperationModule =
  | '会员管理'
  | '卡种管理'
  | '课程管理'
  | '预约管理'
  | '财务管理'
  | '系统管理'

export type OperationType =
  | '新增会员'
  | '更新会员信息'
  | '删除会员'
  | '冻结会员'
  | '解冻会员'
  | '开卡'
  | '续卡'
  | '充值'
  | '退款'
  | '新增卡种'
  | '更新卡种'
  | '删除卡种'
  | '启用卡种'
  | '禁用卡种'
  | '新增课程'
  | '更新课程'
  | '取消课程'
  | '预约课程'
  | '签到核销'
  | '取消预约'
  | '手动签到'

export interface MemberCard {
  id: string
  memberId: string
  cardId: string
  cardName: string
  cardType: CardType
  purchaseDate: string
  expiryDate: string
  remainingDays?: number
  remainingTimes?: number
  status: MemberStatus
  createTime: string
  updateTime: string
}

export interface Member {
  id: string
  name: string
  phone: string
  gender: Gender
  birthDate: string
  joinDate: string
  status: MemberStatus
  cardType: CardType
  cardNumber: string
  remainingDays?: number
  remainingTimes?: number
  expiryDate?: string
  purchaseDate?: string
  balance: number
  avatar?: string
  address?: string
  remarks?: string
  createTime: string
  updateTime: string
}

export interface Card {
  id: string
  name: string
  type: CardType
  price: number
  duration?: number
  times?: number
  description: string
  status: CardStatus
  createTime: string
  updateTime: string
}

export interface Course {
  id: string
  name: string
  coachId: string
  coachName: string
  category: string
  duration: number
  price: number
  maxParticipants: number
  currentParticipants: number
  startTime: string
  endTime: string
  date: string
  room: string
  status: CourseStatus
  createTime: string
  updateTime: string
}

export interface Appointment {
  id: string
  memberId: string
  memberName: string
  phone: string
  courseId: string
  courseName: string
  coachName: string
  appointmentTime: string
  checkInTime?: string
  cancelTime?: string
  status: AppointmentStatus
  operatorId?: string
  operatorName?: string
  remarks?: string
  createTime: string
  updateTime: string
}

export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  operatorRole: UserRole
  operationType: OperationType | string
  operationModule: OperationModule | string
  operationTime: string
  targetType: string
  targetId: string
  targetName: string
  details: string
  ip?: string
}

export interface FilterOptions {
  cardType?: CardType | ''
  memberStatus?: MemberStatus | ''
  appointmentStatus?: AppointmentStatus | ''
  dateRange?: [string, string]
  operatorName?: string
  memberName?: string
  phone?: string
  coachName?: string
  courseName?: string
  operatorRole?: UserRole | ''
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface User {
  id: string
  name: string
  username: string
  role: UserRole
  avatar?: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export type TimeCard = Pick<Card, 'id' | 'name' | 'type' | 'price' | 'times'> & { type: 'times' }

export type DurationCard = Pick<Card, 'id' | 'name' | 'type' | 'price' | 'duration'> & {
  type: 'month' | 'quarter' | 'year'
}

export type DiscriminantCard = TimeCard | DurationCard

export interface ConflictCheckResult {
  hasConflict: boolean
  message?: string
  conflictingAppointment?: Appointment
}

export interface MemberStatistics {
  total: number
  normal: number
  expired: number
  frozen: number
  byCardType: Record<CardType, number>
}

export interface AppointmentStatistics {
  total: number
  booked: number
  checkedIn: number
  cancelled: number
  today: number
}

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
