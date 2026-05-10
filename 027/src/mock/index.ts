import Mock from 'mockjs'
import {
  mockDepartments,
  mockDoctors,
  mockSchedules,
  mockPatients,
  mockRegistrations,
  mockPrescriptions,
  mockOperationLogs,
  mockCurrentUser
} from './data'
import type {
  Department,
  Doctor,
  Patient,
  Registration,
  Prescription,
  PrescriptionItem,
  OperationLog,
  User,
  Schedule,
  VisitStatus,
  DepartmentStatus,
  DoctorStatus,
  PrescriptionStatus,
  Gender,
  TimeSlot
} from '@/types'

interface MockOptions {
  url: string
  type: string
  body: string
}

interface RegistrationStatusUpdate {
  status: VisitStatus
  diagnosis?: string
}

interface BatchScheduleUpdate {
  doctorId: string
  newSchedules: Schedule[]
}

const delay = 200

let departments: Department[] = [...mockDepartments]
let doctors: Doctor[] = [...mockDoctors]
let schedules: Schedule[] = [...mockSchedules]
let patients: Patient[] = [...mockPatients]
let registrations: Registration[] = [...mockRegistrations]
let prescriptions: Prescription[] = [...mockPrescriptions]
let operationLogs: OperationLog[] = [...mockOperationLogs]

const generateId = (): string => Mock.Random.guid()

const createResponse = <T>(data: T, success = true, message = '操作成功') => {
  return { code: success ? 200 : 500, data, message }
}

const extractIdFromUrl = (url: string, pattern: RegExp): string | null => {
  const match = url.match(pattern)
  return match ? match[1] : null
}

Mock.setup({ timeout: delay })

Mock.mock('/api/auth/currentUser', 'get', () => {
  return createResponse<User>(mockCurrentUser)
})

Mock.mock('/api/departments', 'get', () => {
  return createResponse<Department[]>(departments)
})

Mock.mock(/\/api\/departments\/[^/]+$/, 'get', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/departments\/([^/]+)$/)
  if (!id) return createResponse(null, false, '科室不存在')
  const dept = departments.find(d => d.id === id)
  return dept ? createResponse<Department>(dept) : createResponse(null, false, '科室不存在')
})

Mock.mock('/api/departments', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<Department>
  const now = new Date().toISOString()
  const newDept: Department = {
    id: generateId(),
    name: data.name || '',
    description: data.description || '',
    location: data.location || '',
    phone: data.phone || '',
    status: (data.status as DepartmentStatus) || 'active',
    createdAt: now,
    updatedAt: now
  }
  departments.unshift(newDept)
  return createResponse<Department>(newDept)
})

Mock.mock(/\/api\/departments\/[^/]+$/, 'put', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/departments\/([^/]+)$/)
  if (!id) return createResponse(null, false, '科室不存在')
  const data = JSON.parse(options.body) as Partial<Department>
  const index = departments.findIndex(d => d.id === id)
  if (index > -1) {
    departments[index] = { 
      ...departments[index], 
      ...data, 
      updatedAt: new Date().toISOString() 
    }
    return createResponse<Department>(departments[index])
  }
  return createResponse(null, false, '科室不存在')
})

Mock.mock(/\/api\/departments\/[^/]+$/, 'delete', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/departments\/([^/]+)$/)
  if (!id) return createResponse(null, false, '科室不存在')
  const index = departments.findIndex(d => d.id === id)
  if (index > -1) {
    departments.splice(index, 1)
    return createResponse(true)
  }
  return createResponse(null, false, '科室不存在')
})

Mock.mock('/api/doctors', 'get', () => {
  return createResponse<Doctor[]>(doctors)
})

Mock.mock(/\/api\/doctors\/[^/]+$/, 'get', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/doctors\/([^/]+)$/)
  if (!id) return createResponse(null, false, '医生不存在')
  const doctor = doctors.find(d => d.id === id)
  return doctor ? createResponse<Doctor>(doctor) : createResponse(null, false, '医生不存在')
})

Mock.mock('/api/doctors', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<Doctor>
  const now = new Date().toISOString()
  const newDoctor: Doctor = {
    id: generateId(),
    name: data.name || '',
    gender: (data.gender as Gender) || 'male',
    age: data.age || 30,
    title: data.title || '主治医师',
    departmentId: data.departmentId || '',
    phone: data.phone || '',
    email: data.email || '',
    specialty: data.specialty || '',
    education: data.education || '本科',
    avatar: '',
    status: (data.status as DoctorStatus) || 'on_duty',
    createdAt: now,
    updatedAt: now
  }
  doctors.unshift(newDoctor)
  return createResponse<Doctor>(newDoctor)
})

Mock.mock(/\/api\/doctors\/[^/]+$/, 'put', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/doctors\/([^/]+)$/)
  if (!id) return createResponse(null, false, '医生不存在')
  const data = JSON.parse(options.body) as Partial<Doctor>
  const index = doctors.findIndex(d => d.id === id)
  if (index > -1) {
    doctors[index] = { ...doctors[index], ...data, updatedAt: new Date().toISOString() }
    return createResponse<Doctor>(doctors[index])
  }
  return createResponse(null, false, '医生不存在')
})

Mock.mock(/\/api\/doctors\/[^/]+$/, 'delete', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/doctors\/([^/]+)$/)
  if (!id) return createResponse(null, false, '医生不存在')
  const index = doctors.findIndex(d => d.id === id)
  if (index > -1) {
    doctors.splice(index, 1)
    return createResponse(true)
  }
  return createResponse(null, false, '医生不存在')
})

Mock.mock(/\/api\/departments\/[^/]+\/doctors$/, 'get', (options: MockOptions) => {
  const deptId = extractIdFromUrl(options.url, /\/api\/departments\/([^/]+)\/doctors$/)
  if (!deptId) return createResponse<Doctor[]>([])
  const deptDoctors = doctors.filter(d => d.departmentId === deptId)
  return createResponse<Doctor[]>(deptDoctors)
})

Mock.mock(/\/api\/schedules\/doctor\/[^/]+$/, 'get', (options: MockOptions) => {
  const doctorId = extractIdFromUrl(options.url, /\/api\/schedules\/doctor\/([^/]+)$/)
  if (!doctorId) return createResponse<Schedule[]>([])
  const doctorSchedules = schedules.filter(s => s.doctorId === doctorId)
  return createResponse<Schedule[]>(doctorSchedules)
})

Mock.mock('/api/schedules/batch', 'put', (options: MockOptions) => {
  const data = JSON.parse(options.body) as BatchScheduleUpdate
  const { doctorId, newSchedules } = data
  schedules = schedules.filter(s => s.doctorId !== doctorId)
  schedules.push(...newSchedules)
  return createResponse(true)
})

Mock.mock('/api/patients', 'get', () => {
  return createResponse<Patient[]>(patients)
})

Mock.mock('/api/patients', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<Patient>
  const now = new Date().toISOString()
  const newPatient: Patient = {
    id: generateId(),
    name: data.name || '',
    gender: (data.gender as Gender) || 'male',
    age: data.age || 30,
    phone: data.phone || '',
    idCard: data.idCard || '',
    address: data.address || '',
    emergencyContact: data.emergencyContact || '',
    emergencyPhone: data.emergencyPhone || '',
    medicalHistory: data.medicalHistory || '',
    createdAt: now,
    updatedAt: now
  }
  patients.unshift(newPatient)
  return createResponse<Patient>(newPatient)
})

Mock.mock(/\/api\/patients\/[^/]+$/, 'get', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/patients\/([^/]+)$/)
  if (!id) return createResponse(null, false, '患者不存在')
  const patient = patients.find(p => p.id === id)
  return patient ? createResponse<Patient>(patient) : createResponse(null, false, '患者不存在')
})

Mock.mock('/api/registrations', 'get', () => {
  return createResponse<Registration[]>(registrations)
})

Mock.mock('/api/registrations', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<Registration>
  const now = new Date().toISOString()
  const sameDayRegs = registrations.filter(
    r => r.doctorId === data.doctorId && 
         r.scheduleDate === data.scheduleDate && 
         r.timeSlot === data.timeSlot
  )
  const newReg: Registration = {
    id: generateId(),
    patientId: data.patientId || '',
    patientName: data.patientName || '',
    doctorId: data.doctorId || '',
    doctorName: data.doctorName || '',
    departmentId: data.departmentId || '',
    departmentName: data.departmentName || '',
    scheduleDate: data.scheduleDate || '',
    timeSlot: (data.timeSlot as TimeSlot) || 'morning',
    visitNumber: sameDayRegs.length + 1,
    status: 'waiting',
    symptoms: data.symptoms,
    createdAt: now,
    updatedAt: now
  }
  registrations.unshift(newReg)
  return createResponse<Registration>(newReg)
})

Mock.mock(/\/api\/registrations\/[^/]+$/, 'get', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/registrations\/([^/]+)$/)
  if (!id) return createResponse(null, false, '挂号单不存在')
  const reg = registrations.find(r => r.id === id)
  return reg ? createResponse<Registration>(reg) : createResponse(null, false, '挂号单不存在')
})

Mock.mock(/\/api\/registrations\/[^/]+\/status$/, 'put', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/registrations\/([^/]+)\/status$/)
  if (!id) return createResponse(null, false, '挂号单不存在')
  const data = JSON.parse(options.body) as RegistrationStatusUpdate
  const index = registrations.findIndex(r => r.id === id)
  if (index > -1) {
    const now = new Date().toISOString()
    const updates: Partial<Registration> = {
      status: data.status,
      updatedAt: now
    }
    if (data.status === 'ongoing') {
      updates.actualVisitTime = now
    }
    if (data.status === 'completed') {
      updates.completeTime = now
      updates.diagnosis = data.diagnosis
    }
    registrations[index] = { ...registrations[index], ...updates }
    return createResponse<Registration>(registrations[index])
  }
  return createResponse(null, false, '挂号单不存在')
})

Mock.mock(/\/api\/registrations\/[^/]+\/cancel$/, 'put', (options: MockOptions) => {
  const id = extractIdFromUrl(options.url, /\/api\/registrations\/([^/]+)\/cancel$/)
  if (!id) return createResponse(null, false, '挂号单不存在')
  const index = registrations.findIndex(r => r.id === id)
  if (index > -1) {
    registrations[index] = {
      ...registrations[index],
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    }
    return createResponse<Registration>(registrations[index])
  }
  return createResponse(null, false, '挂号单不存在')
})

Mock.mock('/api/prescriptions', 'get', () => {
  return createResponse<Prescription[]>(prescriptions)
})

Mock.mock('/api/prescriptions', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<Prescription>
  const items = (data.items || []) as PrescriptionItem[]
  const now = new Date().toISOString()
  const totalPrice = items.reduce((sum: number, item: PrescriptionItem) => 
    sum + item.price * item.quantity, 0
  )
  const newPrescription: Prescription = {
    id: generateId(),
    registrationId: data.registrationId || '',
    patientId: data.patientId || '',
    patientName: data.patientName || '',
    doctorId: data.doctorId || '',
    doctorName: data.doctorName || '',
    departmentId: data.departmentId || '',
    departmentName: data.departmentName || '',
    items,
    totalPrice,
    remark: data.remark || '',
    status: (data.status as PrescriptionStatus) || 'pending',
    createdAt: now,
    updatedAt: now
  }
  prescriptions.unshift(newPrescription)
  return createResponse<Prescription>(newPrescription)
})

Mock.mock(/\/api\/prescriptions\/registration\/[^/]+$/, 'get', (options: MockOptions) => {
  const regId = extractIdFromUrl(options.url, /\/api\/prescriptions\/registration\/([^/]+)$/)
  if (!regId) return createResponse<Prescription | null>(null)
  const presc = prescriptions.find(p => p.registrationId === regId)
  return createResponse<Prescription | null>(presc || null)
})

Mock.mock('/api/operation-logs', 'get', () => {
  return createResponse<OperationLog[]>(operationLogs)
})

Mock.mock('/api/operation-logs', 'post', (options: MockOptions) => {
  const data = JSON.parse(options.body) as Partial<OperationLog>
  const now = new Date().toISOString()
  const newLog: OperationLog = {
    id: generateId(),
    operatorId: data.operatorId || '',
    operatorName: data.operatorName || '',
    operatorRole: data.operatorRole || 'admin',
    operationType: data.operationType || 'create_department',
    operationDescription: data.operationDescription || '',
    targetType: data.targetType || 'department',
    targetId: data.targetId || '',
    targetName: data.targetName || '',
    oldValue: data.oldValue,
    newValue: data.newValue,
    ipAddress: data.ipAddress || '127.0.0.1',
    createdAt: now
  }
  operationLogs.unshift(newLog)
  return createResponse<OperationLog>(newLog)
})
