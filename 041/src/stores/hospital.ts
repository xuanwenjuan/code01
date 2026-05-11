import { defineStore } from 'pinia'
import type { Hospital, Department, Doctor, ScheduleSlot, OperationLog } from '@/types'
import { hospitals, departments, doctors, slots, operationLogs } from '@/mock'

interface HospitalState {
  hospitals: Hospital[]
  departments: Department[]
  doctors: Doctor[]
  slots: ScheduleSlot[]
  logs: OperationLog[]
  selectedHospital: string | null
  selectedDepartment: string | null
  loading: boolean
}

export const useHospitalStore = defineStore('hospital', {
  state: (): HospitalState => ({
    hospitals: [],
    departments: [],
    doctors: [],
    slots: [],
    logs: [],
    selectedHospital: null,
    selectedDepartment: null,
    loading: false
  }),

  getters: {
    filteredDepartments: (state) => {
      if (!state.selectedHospital) return state.departments
      return state.departments.filter(d => d.hospitalId === state.selectedHospital)
    },

    filteredDoctors: (state) => {
      let result = state.doctors
      if (state.selectedHospital) {
        result = result.filter(d => d.hospitalId === state.selectedHospital)
      }
      if (state.selectedDepartment) {
        result = result.filter(d => d.departmentId === state.selectedDepartment)
      }
      return result
    },

    expertSlots: (state) => {
      return state.slots.filter(s => s.isExpert && s.status === 'limited')
    }
  },

  actions: {
    async fetchHospitals() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.hospitals = hospitals
      this.loading = false
    },

    async fetchDepartments() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.departments = departments
      this.loading = false
    },

    async fetchDoctors() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.doctors = doctors
      this.loading = false
    },

    async fetchSlots() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.slots = slots
      this.loading = false
    },

    async fetchLogs() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.logs = operationLogs
      this.loading = false
    },

    async registerPatient(slotId: string, patientName: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot && slot.available > 0) {
        slot.available--
        slot.reserved++
        if (slot.available === 0) slot.status = 'full'
        else if (slot.available <= 5) slot.status = 'limited'
        
        this.addLog({
          operator: '挂号员1',
          operatorRole: 'registrar',
          operationType: '患者挂号',
          operationDetail: `患者${patientName}挂号成功，医生：${slot.doctorName}，日期：${slot.date}`
        })
        return true
      }
      return false
    },

    async releaseSlot(slotId: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot) {
        slot.available++
        slot.reserved--
        if (slot.available > 5) slot.status = 'available'
        else if (slot.available > 0) slot.status = 'limited'
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '释放号源',
          operationDetail: `手动释放号源，医生：${slot.doctorName}，日期：${slot.date}`
        })
        return true
      }
      return false
    },

    async updateDoctorStatus(doctorId: string, status: Doctor['status']) {
      const doctor = this.doctors.find(d => d.id === doctorId)
      if (doctor) {
        doctor.status = status
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '修改出诊状态',
          operationDetail: `修改医生${doctor.name}的出诊状态为：${status === 'normal' ? '正常出诊' : status === 'stop' ? '停诊' : '替诊'}`
        })
        return true
      }
      return false
    },

    addLog(log: Omit<OperationLog, 'id' | 'timestamp'>) {
      const newLog: OperationLog = {
        ...log,
        id: `LOG${String(this.logs.length + 1).padStart(5, '0')}`,
        timestamp: new Date().toISOString()
      }
      this.logs.unshift(newLog)
    },

    setSelectedHospital(id: string | null) {
      this.selectedHospital = id
      this.selectedDepartment = null
    },

    setSelectedDepartment(id: string | null) {
      this.selectedDepartment = id
    },

    async init() {
      await Promise.all([
        this.fetchHospitals(),
        this.fetchDepartments(),
        this.fetchDoctors(),
        this.fetchSlots(),
        this.fetchLogs()
      ])
    }
  },

  persist: {
    paths: ['hospitals', 'departments', 'doctors', 'slots', 'logs']
  }
})
