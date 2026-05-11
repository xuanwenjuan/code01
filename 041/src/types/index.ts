export interface Hospital {
  id: string
  name: string
  address: string
}

export interface Department {
  id: string
  name: string
  hospitalId: string
  hospitalName: string
}

export type DoctorTitle = '主任医师' | '副主任医师' | '主治医师' | '住院医师' | '专家'

export type DoctorStatus = 'normal' | 'stop' | 'substitute'

export interface Doctor {
  id: string
  name: string
  title: DoctorTitle
  departmentId: string
  departmentName: string
  hospitalId: string
  hospitalName: string
  specialty: string
  status: DoctorStatus
  avatar: string
  phone?: string
  email?: string
  joinDate?: string
}

export interface FeeRule {
  title: DoctorTitle
  baseFee: number
  expertPremium: number
  description: string
}

export interface RegistrationFee {
  baseFee: number
  expertPremium: number
  totalFee: number
  title: DoctorTitle
  isExpert: boolean
}

export type ScheduleTime = 'morning' | 'afternoon' | 'night'

export type SlotStatus = 'available' | 'limited' | 'full' | 'locked'

export interface ScheduleRule {
  id?: string
  doctorId: string
  doctorName?: string
  departmentId: string
  date: string
  times: ScheduleTime[]
  maxPatients: number
  repeatMode: 'none' | 'daily' | 'weekly'
  repeatDays?: number[]
  repeatEndDate?: string
  isExpert: boolean
  notes?: string
  createdAt?: string
  createdBy?: string
}

export interface ScheduleSlot {
  id: string
  doctorId: string
  doctorName: string
  departmentId: string
  departmentName: string
  hospitalId: string
  hospitalName: string
  date: string
  time: ScheduleTime
  total: number
  reserved: number
  available: number
  status: SlotStatus
  isExpert: boolean
  isLocked: boolean
  fee: RegistrationFee
  stopReason?: string
  substituteDoctorId?: string
  substituteDoctorName?: string
  scheduleRuleId?: string
}

export interface RegistrationRecord {
  id: string
  slotId: string
  doctorId: string
  doctorName: string
  patientName: string
  patientPhone?: string
  patientIdCard?: string
  date: string
  time: ScheduleTime
  fee: RegistrationFee
  status: 'registered' | 'checked' | 'cancelled'
  registeredAt: string
  checkedAt?: string
  cancelledAt?: string
  cancelReason?: string
  operator: string
  operatorRole: 'admin' | 'registrar'
}

export interface OperationLog {
  id: string
  operator: string
  operatorRole: 'admin' | 'registrar'
  operationType: string
  operationDetail: string
  timestamp: string
  targetId?: string
  targetType?: 'doctor' | 'schedule' | 'slot' | 'registration'
  ipAddress?: string
  deviceInfo?: string
}

export type OperationType = 
  | 'add_doctor'
  | 'edit_doctor'
  | 'delete_doctor'
  | 'change_doctor_status'
  | 'create_schedule'
  | 'edit_schedule'
  | 'delete_schedule'
  | 'lock_slot'
  | 'unlock_slot'
  | 'release_slot'
  | 'add_stop_note'
  | 'add_substitute'
  | 'register_patient'
  | 'cancel_registration'
  | 'check_in_patient'
  | 'modify_fee'
  | 'batch_create_schedule'

export interface AdvancedFilter {
  hospitalId?: string | null
  departmentId?: string | null
  doctorId?: string | null
  title?: DoctorTitle | ''
  status?: DoctorStatus | ''
  slotStatus?: SlotStatus | ''
  time?: ScheduleTime | ''
  startDate?: string
  endDate?: string
  keyword?: string
  operator?: string
  operationType?: string
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
