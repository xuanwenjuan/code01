// ==================== 基础类型定义 ====================

export type CoachType = 'fulltime' | 'parttime'
export type CoachStatus = 'active' | 'inactive'
export type CourseStatus = 'online' | 'offline'
export type CourseCategory = '私教一对一' | '小班团课' | '瑜伽普拉提' | '有氧燃脂'
export type PurchaseStatus = 'valid' | 'expired' | 'usedup'
export type BookingStatus = 'booked' | 'completed' | 'cancelled' | 'expired'
export type ScheduleStatus = 'available' | 'full' | 'cancelled'
export type MemberLevel = '普通会员' | '银卡会员' | '金卡会员' | '钻石会员'

// ==================== 时间槽相关 ====================

export interface TimeSlot {
  day: number
  start: string
  end: string
}

// ==================== 教练相关 ====================

export interface Coach {
  id: string
  name: string
  avatar: string
  type: CoachType
  specialties: string[]
  level: number
  phone: string
  status: CoachStatus
  availableSlots: TimeSlot[]
  createdAt: string
}

export interface CoachForm {
  id?: string
  name: string
  type: CoachType
  level: number
  specialties: string[]
  phone: string
  status: CoachStatus
}

export interface CoachSearchParams {
  name?: string
  type?: CoachType | ''
  status?: CoachStatus | ''
}

// ==================== 课程相关 ====================

export interface Course {
  id: string
  name: string
  category: CourseCategory
  duration: number
  price: number
  description: string
  status: CourseStatus
  maxStudents?: number
  createdAt: string
}

export interface CourseForm {
  id?: string
  name: string
  category: CourseCategory
  duration: number
  price: number
  description: string
  status: CourseStatus
  maxStudents?: number
}

export interface CourseSearchParams {
  name?: string
  category?: CourseCategory | ''
  status?: CourseStatus | ''
}

// ==================== 会员相关 ====================

export interface Member {
  id: string
  name: string
  phone: string
  avatar: string
  memberLevel: MemberLevel
  createdAt: string
}

export interface MemberSearchParams {
  name?: string
  phone?: string
  memberLevel?: MemberLevel | ''
}

// ==================== 购课记录相关 ====================

export interface PurchaseRecord {
  id: string
  memberId: string
  memberName: string
  courseId: string
  courseName: string
  totalHours: number
  remainingHours: number
  purchaseDate: string
  expireDate: string
  status: PurchaseStatus
}

export interface PurchaseSearchParams {
  memberName?: string
  courseName?: string
  status?: PurchaseStatus | ''
}

// ==================== 约课记录相关 ====================

export interface Booking {
  id: string
  memberId: string
  memberName: string
  courseId: string
  courseName: string
  coachId: string
  coachName: string
  date: string
  timeSlot: string
  status: BookingStatus
  createdAt: string
}

export interface BookingForm {
  memberId: string
  courseId: string
  coachId: string
  date: string
  timeSlot: string
}

export interface BookingSearchParams {
  memberName?: string
  coachName?: string
  status?: BookingStatus | ''
}

// ==================== 排班相关 ====================

export interface Schedule {
  id: string
  coachId: string
  coachName: string
  courseId: string
  courseName: string
  date: string
  timeSlot: string
  maxStudents: number
  currentStudents: number
  status: ScheduleStatus
}

// ==================== 消课统计相关 ====================

export interface ConsumptionStats {
  coachId: string
  coachName: string
  courseCategory: string
  date: string
  hours: number
  count: number
}

export interface StatsSearchParams {
  coachId?: string
  category?: CourseCategory | ''
  dateRange?: string[]
}

// ==================== 分页相关 ====================

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ==================== UI 组件 Props 类型 ====================

export interface FormDialogProps<T = Record<string, unknown>> {
  modelValue: boolean
  title: string
  formData: T
  rules?: Record<string, { required?: boolean; message?: string; trigger?: string; pattern?: RegExp }[]>
  width?: string
  labelWidth?: string
  loading?: boolean
}

export interface SearchFormProps<T = Record<string, unknown>> {
  initialValues: T
  inline?: boolean
  labelWidth?: string
}

// ==================== 全局状态相关 ====================

export interface LoadingState {
  global: boolean
  [key: string]: boolean
}

export interface UiState {
  loading: LoadingState
}

// ==================== Store 完整状态 ====================

export interface AppStoreState {
  coaches: Coach[]
  courses: Course[]
  members: Member[]
  purchaseRecords: PurchaseRecord[]
  bookings: Booking[]
  schedules: Schedule[]
  pagination: {
    coach: PaginationParams
    course: PaginationParams
    member: PaginationParams
    booking: PaginationParams
  }
  loading: {
    global: boolean
    coachList: boolean
    courseList: boolean
    memberList: boolean
    bookingList: boolean
  }
}

// ==================== 工具类型 ====================

export type Nullable<T> = T | null
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireOnly<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>
