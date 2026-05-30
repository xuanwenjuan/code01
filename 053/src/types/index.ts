// ========================================
// 全局类型定义 - 统一业务类型系统
// ========================================

// 基础状态枚举
export enum Status {
  ENABLED = 'enabled',
  DISABLED = 'disabled'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female'
}

export enum TeacherStatus {
  ON = 'on',
  OFF = 'off'
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid'
}

export enum StudentClassStatus {
  PENDING = 'pending',
  ENROLLED = 'enrolled',
  SUSPENDED = 'suspended',
  GRADUATED = 'graduated'
}

export enum ClassStatus {
  RECRUITING = 'recruiting',
  ACTIVE = 'active',
  FINISHED = 'finished'
}

export enum OperationType {
  ASSIGN = 'assign',
  TRANSFER = 'transfer',
  REMOVE = 'remove'
}

// ========================================
// 时间与周期类型
// ========================================

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
}

export interface Period {
  id: number
  name: string
  time: string
}

export const PERIOD_TIMES: Period[] = [
  { id: 1, name: '第1节', time: '08:00-09:00' },
  { id: 2, name: '第2节', time: '09:10-10:10' },
  { id: 3, name: '第3节', time: '10:30-11:30' },
  { id: 4, name: '第4节', time: '14:00-15:00' },
  { id: 5, name: '第5节', time: '15:10-16:10' },
  { id: 6, name: '第6节', time: '16:30-17:30' },
  { id: 7, name: '第7节', time: '19:00-20:00' },
  { id: 8, name: '第8节', time: '20:10-21:10' }
]

// ========================================
// 通用类型
// ========================================

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

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Option {
  label: string
  value: string | number
  disabled?: boolean
  children?: Option[]
}

// ========================================
// 课程类目类型
// ========================================

export interface AvailableTime {
  day: DayOfWeek
  periods: number[]
}

export interface CourseCategory {
  id: string
  name: string
  parentId: string | null
  level: number
  sort: number
  status: Status
  children?: CourseCategory[]
  createTime: string
  updateTime?: string
}

export interface CourseCategoryForm {
  id?: string
  name: string
  parentId: string | null
  level?: number
  sort: number
  status: Status
}

export interface CourseCategorySearchParams {
  name?: string
  status?: Status
}

// ========================================
// 教师类型
// ========================================

export interface Teacher {
  id: string
  name: string
  avatar?: string
  gender: Gender
  phone: string
  email: string
  subjects: string[]
  experience: number
  education: string
  title: string
  status: TeacherStatus
  availableTime: AvailableTime[]
  createTime: string
  updateTime?: string
}

export interface TeacherForm {
  id?: string
  name: string
  avatar?: string
  gender: Gender
  phone: string
  email: string
  subjects: string[]
  experience: number
  education: string
  title: string
  status: TeacherStatus
  availableTime: AvailableTime[]
}

export interface TeacherSearchParams {
  name?: string
  subject?: string
  status?: TeacherStatus
}

// ========================================
// 学员类型
// ========================================

export interface Student {
  id: string
  name: string
  gender: Gender
  phone: string
  email?: string
  age: number
  intendedCourse: string
  paymentStatus: PaymentStatus
  classStatus: StudentClassStatus
  classId?: string
  className?: string
  createTime: string
  updateTime?: string
}

export interface StudentForm {
  id?: string
  name: string
  gender: Gender
  phone: string
  email?: string
  age: number
  intendedCourse: string
  paymentStatus: PaymentStatus
  classStatus: StudentClassStatus
  classId?: string
  className?: string
}

export interface StudentSearchParams {
  name?: string
  phone?: string
  intendedCourse?: string
  paymentStatus?: PaymentStatus
  classStatus?: StudentClassStatus
}

// ========================================
// 班级与排课类型
// ========================================

export interface ClassSchedule {
  id: string
  dayOfWeek: DayOfWeek
  period: number
  course: string
  teacherId: string
  teacherName: string
  classroom?: string
  locked: boolean
  classId?: string
  className?: string
}

export interface Class {
  id: string
  name: string
  course: string
  categoryId?: string
  categoryName?: string
  teacherId: string
  teacherName: string
  maxStudents: number
  currentStudents: number
  status: ClassStatus
  startDate?: string
  endDate?: string
  description?: string
  schedule: ClassSchedule[]
  createTime: string
  updateTime?: string
}

export interface ClassForm {
  id?: string
  name: string
  course: string
  categoryId?: string
  categoryName?: string
  teacherId: string
  teacherName: string
  maxStudents: number
  currentStudents?: number
  status: ClassStatus
  startDate?: string
  endDate?: string
  description?: string
  schedule: ClassSchedule[]
}

export interface ClassSearchParams {
  name?: string
  course?: string
  teacherId?: string
  status?: ClassStatus
}

// ========================================
// 分班记录类型
// ========================================

export interface ClassAssignmentRecord {
  id: string
  studentId: string
  studentName: string
  classId: string
  className: string
  operation: OperationType
  operator: string
  operateTime: string
  remark?: string
}

export interface AssignClassForm {
  studentId: string
  classId: string
  remark?: string
}

// ========================================
// 枚举标签映射（用于显示）
// ========================================

export const STATUS_LABELS: Record<Status, string> = {
  [Status.ENABLED]: '启用',
  [Status.DISABLED]: '停用'
}

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女'
}

export const TEACHER_STATUS_LABELS: Record<TeacherStatus, string> = {
  [TeacherStatus.ON]: '在职',
  [TeacherStatus.OFF]: '离职'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: '未缴费',
  [PaymentStatus.PARTIAL]: '部分缴费',
  [PaymentStatus.PAID]: '已缴费'
}

export const STUDENT_CLASS_STATUS_LABELS: Record<StudentClassStatus, string> = {
  [StudentClassStatus.PENDING]: '待分班',
  [StudentClassStatus.ENROLLED]: '已入班',
  [StudentClassStatus.SUSPENDED]: '休学',
  [StudentClassStatus.GRADUATED]: '结业'
}

export const CLASS_STATUS_LABELS: Record<ClassStatus, string> = {
  [ClassStatus.RECRUITING]: '招生中',
  [ClassStatus.ACTIVE]: '进行中',
  [ClassStatus.FINISHED]: '已结课'
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  [OperationType.ASSIGN]: '分班',
  [OperationType.TRANSFER]: '转班',
  [OperationType.REMOVE]: '移除'
}
