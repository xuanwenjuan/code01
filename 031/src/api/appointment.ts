import request from './request'
import type { Appointment, FilterOptions, PaginatedResponse } from '@/types'

interface GetAppointmentsParams extends FilterOptions {
  page: number
  pageSize: number
}

const appointmentApi = {
  getAppointments: (params: GetAppointmentsParams): Promise<PaginatedResponse<Appointment>> => {
    return request.get('/appointments', { params })
  },
  createAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'appointmentTime'>): Promise<Appointment> => {
    return request.post('/appointments', appointment)
  },
  checkIn: (id: string): Promise<Appointment> => {
    return request.put(`/appointments/${id}/check-in`)
  },
  cancelAppointment: (id: string): Promise<Appointment> => {
    return request.put(`/appointments/${id}/cancel`)
  },
}

export default appointmentApi
