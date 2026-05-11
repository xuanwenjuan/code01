import { defineStore } from 'pinia'
import type { Appointment, FilterOptions } from '@/types'
import appointmentApi from '@/api/appointment'
import { addOperationLog } from '@/stores/log'

interface AppointmentState {
  appointments: Appointment[]
  total: number
  page: number
  pageSize: number
  loading: boolean
}

export const useAppointmentStore = defineStore('appointment', {
  state: (): AppointmentState => ({
    appointments: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  actions: {
    async fetchAppointments(page = 1, pageSize = 10, filters: FilterOptions = {}) {
      this.loading = true
      this.page = page
      this.pageSize = pageSize
      try {
        const response = await appointmentApi.getAppointments({ page, pageSize, ...filters })
        this.appointments = response.data
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
    async createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'appointmentTime'>) {
      this.loading = true
      try {
        const response = await appointmentApi.createAppointment(appointment)
        addOperationLog({
          operationType: '预约课程',
          operationModule: '预约管理',
          targetType: '预约',
          targetId: response.id,
          targetName: response.courseName,
          details: `会员 ${response.memberName} 预约课程 ${response.courseName}`,
        })
        await this.fetchAppointments(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async checkIn(id: string, memberName: string, courseName: string) {
      this.loading = true
      try {
        const response = await appointmentApi.checkIn(id)
        addOperationLog({
          operationType: '签到核销',
          operationModule: '预约管理',
          targetType: '预约',
          targetId: id,
          targetName: memberName,
          details: `会员 ${memberName} 签到核销课程 ${courseName}`,
        })
        await this.fetchAppointments(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async cancelAppointment(id: string, memberName: string, courseName: string, reason: string = '') {
      this.loading = true
      try {
        const response = await appointmentApi.cancelAppointment(id)
        addOperationLog({
          operationType: '取消预约',
          operationModule: '预约管理',
          targetType: '预约',
          targetId: id,
          targetName: memberName,
          details: `取消会员 ${memberName} 对课程 ${courseName} 的预约${reason ? `，原因：${reason}` : ''}`,
        })
        await this.fetchAppointments(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
  },
})
