export type TripType = 'domestic' | 'overseas' | 'weekend' | 'business'
export type TripStatus = 'preparing' | 'ongoing' | 'completed'
export type CheckInStatus = 'pending' | 'checked' | 'missed'
export type OperationType = 'create_trip' | 'update_trip' | 'delete_trip' | 'add_checkin' | 'update_checkin' | 'add_expense' | 'update_budget'
export type ExpenseCategory = '餐饮' | '交通' | '住宿' | '门票' | '购物' | '娱乐' | '其他'
export type TransportType = '飞机' | '高铁' | '自驾' | '游轮' | '巴士'

export interface CountdownInfo {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  isOngoing: boolean
  isFuture: boolean
  status: 'upcoming' | 'ongoing' | 'completed'
  displayText: string
}

export interface TripFormData {
  name: string
  type: TripType
  destination: string
  startDate: string
  endDate: string
  transport: TransportType
  hotel: string
  budget: number
  status: TripStatus
}

export interface AttractionFormData {
  name: string
  location: string
  plannedDate: string
  description: string
}

export interface ExpenseFormData {
  date: string
  category: ExpenseCategory
  amount: number
  description: string
}

export interface LogFilterParams {
  keyword?: string
  type?: OperationType
  dateStart?: string
  dateEnd?: string
}

export const TripTypeLabels: Record<TripType, string> = {
  domestic: '国内游',
  overseas: '出境游',
  weekend: '周末短途',
  business: '商务出差'
}

export const TripStatusLabels: Record<TripStatus, string> = {
  preparing: '筹备中',
  ongoing: '进行中',
  completed: '已结束'
}

export const CheckInStatusLabels: Record<CheckInStatus, string> = {
  pending: '未打卡',
  checked: '已打卡',
  missed: '已错过'
}

export const OperationTypeLabels: Record<OperationType, string> = {
  create_trip: '创建行程',
  update_trip: '修改行程',
  delete_trip: '删除行程',
  add_checkin: '添加打卡',
  update_checkin: '更新打卡状态',
  add_expense: '添加花费',
  update_budget: '调整预算'
}

export interface Attraction {
  id: string
  name: string
  location: string
  description: string
  plannedDate: string
  status: CheckInStatus
  checkedInAt?: string
  photos?: string[]
}

export interface DailyExpense {
  id: string
  date: string
  category: string
  amount: number
  description: string
}

export interface Trip {
  id: string
  name: string
  type: TripType
  destination: string
  startDate: string
  endDate: string
  days: number
  transport: string
  hotel: string
  budget: number
  spent: number
  status: TripStatus
  attractions: Attraction[]
  expenses: DailyExpense[]
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: string
  type: OperationType
  tripId?: string
  tripName?: string
  content: string
  operator: string
  timestamp: string
}

export interface FilterParams {
  keyword?: string
  type?: TripType
  status?: TripStatus
  budgetMin?: number
  budgetMax?: number
  dateStart?: string
  dateEnd?: string
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
