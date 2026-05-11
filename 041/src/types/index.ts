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
}

export type ScheduleTime = 'morning' | 'afternoon' | 'night'

export type SlotStatus = 'available' | 'limited' | 'full'

export interface ScheduleSlot {
  id: string
  doctorId: string
  doctorName: string
  date: string
  time: ScheduleTime
  total: number
  reserved: number
  available: number
  status: SlotStatus
  isExpert: boolean
}

export interface OperationLog {
  id: string
  operator: string
  operatorRole: 'admin' | 'registrar'
  operationType: string
  operationDetail: string
  timestamp: string
  targetId?: string
  targetType?: 'doctor' | 'schedule' | 'slot'
}

export type OperationType = 
  | 'add_doctor'
  | 'edit_doctor'
  | 'change_status'
  | 'create_schedule'
  | 'edit_schedule'
  | 'lock_slot'
  | 'unlock_slot'
  | 'release_slot'
  | 'add_note'
  | 'register_patient'
  | 'cancel_register'
