export enum CourseCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  PRODUCT = 'product',
  LANGUAGE = 'language'
}

export const CourseCategoryMap: Readonly<Record<CourseCategory, string>> = {
  [CourseCategory.FRONTEND]: '前端开发',
  [CourseCategory.BACKEND]: '后端架构',
  [CourseCategory.PRODUCT]: '产品设计',
  [CourseCategory.LANGUAGE]: '外语学习'
} as const

export enum LearningStatus {
  NOT_STARTED = 'not_started',
  LEARNING = 'learning',
  COMPLETED = 'completed'
}

export const LearningStatusMap: Readonly<Record<LearningStatus, string>> = {
  [LearningStatus.NOT_STARTED]: '未开始',
  [LearningStatus.LEARNING]: '学习中',
  [LearningStatus.COMPLETED]: '已结业'
} as const

export enum ProgressStatus {
  LAGGING = 'lagging',
  NORMAL = 'normal',
  ADVANCED = 'advanced'
}

export const ProgressStatusMap: Readonly<Record<ProgressStatus, string>> = {
  [ProgressStatus.LAGGING]: '落后',
  [ProgressStatus.NORMAL]: '正常',
  [ProgressStatus.ADVANCED]: '超前'
} as const

export enum PlatformType {
  BILIBILI = 'bilibili',
  COURSERA = 'coursera',
  MOOC = 'mooc',
  NETEASE = 'netease',
  UDEMY = 'udemy',
  OTHER = 'other'
}

export const PlatformTypeMap: Readonly<Record<PlatformType, string>> = {
  [PlatformType.BILIBILI]: '哔哩哔哩',
  [PlatformType.COURSERA]: 'Coursera',
  [PlatformType.MOOC]: '中国大学MOOC',
  [PlatformType.NETEASE]: '网易云课堂',
  [PlatformType.UDEMY]: 'Udemy',
  [PlatformType.OTHER]: '其他'
} as const

export enum OperationType {
  ADD_COURSE = 'add_course',
  UPDATE_COURSE = 'update_course',
  DELETE_COURSE = 'delete_course',
  CHECK_IN = 'check_in',
  UPDATE_PROGRESS = 'update_progress',
  UPDATE_STATUS = 'update_status',
  ADD_NOTE = 'add_note',
  UPDATE_PLAN = 'update_plan'
}

export const OperationTypeMap: Readonly<Record<OperationType, string>> = {
  [OperationType.ADD_COURSE]: '添加课程',
  [OperationType.UPDATE_COURSE]: '更新课程信息',
  [OperationType.DELETE_COURSE]: '删除课程',
  [OperationType.CHECK_IN]: '学习打卡',
  [OperationType.UPDATE_PROGRESS]: '更新学习进度',
  [OperationType.UPDATE_STATUS]: '更新学习状态',
  [OperationType.ADD_NOTE]: '添加学习心得',
  [OperationType.UPDATE_PLAN]: '修改学习计划'
} as const

export interface CourseNote {
  id: string
  content: string
  createdAt: string
}

export interface CheckInRecord {
  id: string
  date: string
  hours: number
}

export interface Course {
  id: string
  name: string
  instructor: string
  category: CourseCategory
  platform: PlatformType
  totalHours: number
  studiedHours: number
  status: LearningStatus
  progressStatus: ProgressStatus
  progressPercentage: number
  lastStudyDate: string | null
  planHoursPerDay: number
  notes: CourseNote[]
  checkInHistory: CheckInRecord[]
  createdAt: string
  updatedAt: string
}

export interface CourseFormData {
  name: string
  instructor: string
  category: CourseCategory
  platform: PlatformType
  totalHours: number
  studiedHours?: number
  planHoursPerDay: number
}

export interface OperationLog {
  id: string
  type: OperationType
  courseId?: string
  courseName?: string
  description: string
  detail: Record<string, unknown>
  createdAt: string
}

export interface CheckInFormData {
  courseId: string
  date: string
  hours: number
}

export interface CourseFilterParams {
  category?: CourseCategory
  platform?: PlatformType
  status?: LearningStatus
  progressRange?: [number, number]
  keyword?: string
}

export interface LogFilterParams {
  type?: OperationType
  startTime?: string
  endTime?: string
  keyword?: string
}

export interface CourseStats {
  total: number
  completed: number
  learning: number
  notStarted: number
  totalStudyHours: number
  lagging: number
}

export interface FilterResult<T> {
  data: T[]
  total: number
}

export type CourseOrId = Course | string

export type Maybe<T> = T | undefined | null
