import type {
  Department,
  Doctor,
  Patient,
  Registration,
  Prescription,
  OperationLog,
  Schedule,
  User,
  VisitStatus
} from '@/types'
import { request } from './request'

export const authApi = {
  getCurrentUser: () => request.get<User>('/auth/currentUser')
}

export const departmentApi = {
  getList: () => request.get<Department[]>('/departments'),
  getById: (id: string) => request.get<Department>(`/departments/${id}`),
  create: (data: Partial<Department>) => request.post<Department>('/departments', data),
  update: (id: string, data: Partial<Department>) => request.put<Department>(`/departments/${id}`, data),
  delete: (id: string) => request.delete<boolean>(`/departments/${id}`)
}

export const doctorApi = {
  getList: () => request.get<Doctor[]>('/doctors'),
  getById: (id: string) => request.get<Doctor>(`/doctors/${id}`),
  getByDepartment: (deptId: string) => request.get<Doctor[]>(`/departments/${deptId}/doctors`),
  create: (data: Partial<Doctor>) => request.post<Doctor>('/doctors', data),
  update: (id: string, data: Partial<Doctor>) => request.put<Doctor>(`/doctors/${id}`, data),
  delete: (id: string) => request.delete<boolean>(`/doctors/${id}`)
}

export const scheduleApi = {
  getByDoctor: (doctorId: string) => request.get<Schedule[]>(`/schedules/doctor/${doctorId}`),
  updateBatch: (doctorId: string, schedules: Schedule[]) => 
    request.put<boolean>('/schedules/batch', { doctorId, newSchedules: schedules })
}

export const patientApi = {
  getList: () => request.get<Patient[]>('/patients'),
  getById: (id: string) => request.get<Patient>(`/patients/${id}`),
  create: (data: Partial<Patient>) => request.post<Patient>('/patients', data)
}

export const registrationApi = {
  getList: () => request.get<Registration[]>('/registrations'),
  getById: (id: string) => request.get<Registration>(`/registrations/${id}`),
  create: (data: Partial<Registration>) => request.post<Registration>('/registrations', data),
  updateStatus: (id: string, status: VisitStatus, diagnosis?: string) =>
    request.put<Registration>(`/registrations/${id}/status`, { status, diagnosis }),
  cancel: (id: string) => request.put<Registration>(`/registrations/${id}/cancel`)
}

export const prescriptionApi = {
  getList: () => request.get<Prescription[]>('/prescriptions'),
  getByRegistration: (regId: string) => request.get<Prescription | null>(`/prescriptions/registration/${regId}`),
  create: (data: Partial<Prescription>) => request.post<Prescription>('/prescriptions', data)
}

export const operationLogApi = {
  getList: () => request.get<OperationLog[]>('/operation-logs'),
  create: (data: Partial<OperationLog>) => request.post<OperationLog>('/operation-logs', data)
}
