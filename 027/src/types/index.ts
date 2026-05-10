export type DepartmentId = string
export type DoctorId = string
export type PatientId = string
export type RegistrationId = string
export type PrescriptionId = string
export type OperationLogId = string
export type UserId = string
export type MedicineId = string

export type TitleLevel = '主任医师' | '副主任医师' | '主治医师' | '住院医师' | '医士'
export type VisitStatus = 'waiting' | 'ongoing' | 'completed' | 'cancelled'
export type WeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type TimeSlot = 'morning' | 'afternoon'
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'reception'
export type TargetType = 'department' | 'doctor' | 'registration' | 'prescription' | 'schedule'
export type OperationType = 
  | 'create_department' | 'update_department' | 'delete_department'
  | 'create_doctor' | 'update_doctor' | 'delete_doctor'
  | 'update_schedule'
  | 'create_registration' | 'cancel_registration'
  | 'start_visit' | 'complete_visit'
  | 'create_prescription'
export type PrescriptionStatus = 'pending' | 'issued' | 'dispensed'
export type DepartmentStatus = 'active' | 'inactive'
export type DoctorStatus = 'on_duty' | 'off_duty' | 'leave'
export type ScheduleStatus = 'available' | 'unavailable'
export type Gender = 'male' | 'female'
export type FeeType = 'registration' | 'medicine' | 'examination' | 'treatment'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export interface TitleFeeConfig {
  title: TitleLevel
  registrationFee: number
}

export interface Payment {
  id: string
  registrationId: RegistrationId
  prescriptionId?: PrescriptionId
  feeType: FeeType
  amount: number
  status: PaymentStatus
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface Medicine {
  id: MedicineId
  name: string
  specification: string
  price: number
  unit: string
  manufacturer: string
  category: string
}

export interface Department {
  id: DepartmentId
  name: string
  description: string
  location: string
  phone: string
  status: DepartmentStatus
  createdAt: string
  updatedAt: string
}

export interface Doctor {
  id: DoctorId
  name: string
  gender: Gender
  age: number
  title: TitleLevel
  departmentId: DepartmentId
  phone: string
  email: string
  specialty: string
  education: string
  avatar: string
  status: DoctorStatus
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  doctorId: DoctorId
  departmentId: DepartmentId
  weekDay: WeekDay
  timeSlot: TimeSlot
  maxPatients: number
  status: ScheduleStatus
}

export interface Patient {
  id: PatientId
  name: string
  gender: Gender
  age: number
  phone: string
  idCard: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  medicalHistory: string
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: RegistrationId
  patientId: PatientId
  patientName: string
  doctorId: DoctorId
  doctorName: string
  departmentId: DepartmentId
  departmentName: string
  scheduleDate: string
  timeSlot: TimeSlot
  visitNumber: number
  status: VisitStatus
  registrationFee: number
  totalFee: number
  paymentStatus: PaymentStatus
  actualVisitTime?: string
  completeTime?: string
  symptoms?: string
  diagnosis?: string
  createdAt: string
  updatedAt: string
}

export interface PrescriptionItem {
  id: string
  medicineName: string
  specification: string
  dosage: string
  usage: string
  quantity: number
  unit: string
  price: number
}

export interface Prescription {
  id: PrescriptionId
  registrationId: RegistrationId
  patientId: PatientId
  patientName: string
  doctorId: DoctorId
  doctorName: string
  departmentId: DepartmentId
  departmentName: string
  items: PrescriptionItem[]
  totalPrice: number
  remark: string
  status: PrescriptionStatus
  createdAt: string
  updatedAt: string
}

export interface OperationLog {
  id: OperationLogId
  operatorId: UserId
  operatorName: string
  operatorRole: UserRole
  operationType: OperationType
  operationDescription: string
  targetType: TargetType
  targetId: string
  targetName: string
  oldValue?: string
  newValue?: string
  ipAddress: string
  createdAt: string
}

export interface User {
  id: UserId
  username: string
  name: string
  role: UserRole
  avatar: string
}
