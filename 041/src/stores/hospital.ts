import { defineStore } from 'pinia'
import type { 
  Hospital, 
  Department, 
  Doctor, 
  ScheduleSlot, 
  OperationLog,
  FeeRule,
  ScheduleRule,
  RegistrationRecord,
  DoctorTitle,
  DoctorStatus,
  ScheduleTime,
  SlotStatus,
  RegistrationFee
} from '@/types'
import { 
  hospitals, 
  departments, 
  doctors, 
  slots, 
  operationLogs, 
  feeRules, 
  scheduleRules,
  registrationRecords,
  calculateFee
} from '@/mock'

interface HospitalState {
  hospitals: Hospital[]
  departments: Department[]
  doctors: Doctor[]
  slots: ScheduleSlot[]
  logs: OperationLog[]
  feeRules: FeeRule[]
  scheduleRules: ScheduleRule[]
  registrationRecords: RegistrationRecord[]
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
    feeRules: [],
    scheduleRules: [],
    registrationRecords: [],
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
    },

    lockedSlots: (state) => {
      return state.slots.filter(s => s.isLocked)
    },

    todayRegistrationCount: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.registrationRecords.filter(r => r.date === today && r.status !== 'cancelled').length
    },

    todayRevenue: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.registrationRecords
        .filter(r => r.date === today && r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.fee.totalFee, 0)
    },

    activeRegistrationRecords: (state) => {
      return state.registrationRecords.filter(r => r.status !== 'cancelled')
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

    async fetchFeeRules() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.feeRules = feeRules
      this.loading = false
    },

    async fetchScheduleRules() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.scheduleRules = scheduleRules
      this.loading = false
    },

    async fetchRegistrationRecords() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 300))
      this.registrationRecords = registrationRecords
      this.loading = false
    },

    calculateRegistrationFee(title: DoctorTitle, isExpert: boolean): RegistrationFee {
      return calculateFee(title, isExpert)
    },

    async addDoctor(doctorData: Omit<Doctor, 'id' | 'avatar'>) {
      const newDoctor: Doctor = {
        ...doctorData,
        id: `DOC${String(this.doctors.length + 1).padStart(3, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
      }
      this.doctors.unshift(newDoctor)
      
      this.addLog({
        operator: '系统管理员',
        operatorRole: 'admin',
        operationType: '添加医生',
        operationDetail: `添加新医生：${newDoctor.name}`,
        targetId: newDoctor.id,
        targetType: 'doctor'
      })
      
      return newDoctor
    },

    async updateDoctor(doctorId: string, updates: Partial<Doctor>) {
      const doctor = this.doctors.find(d => d.id === doctorId)
      if (doctor) {
        Object.assign(doctor, updates)
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '编辑医生信息',
          operationDetail: `编辑医生信息：${doctor.name}`,
          targetId: doctorId,
          targetType: 'doctor'
        })
        
        return true
      }
      return false
    },

    async deleteDoctor(doctorId: string) {
      const index = this.doctors.findIndex(d => d.id === doctorId)
      if (index > -1) {
        const doctor = this.doctors[index]
        this.doctors.splice(index, 1)
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '删除医生',
          operationDetail: `删除医生：${doctor.name}`,
          targetId: doctorId,
          targetType: 'doctor'
        })
        
        return true
      }
      return false
    },

    async updateDoctorStatus(doctorId: string, status: DoctorStatus) {
      const doctor = this.doctors.find(d => d.id === doctorId)
      if (doctor) {
        doctor.status = status
        
        const statusText = status === 'normal' ? '正常出诊' : status === 'stop' ? '停诊' : '替诊'
        
        if (status === 'stop') {
          const today = new Date().toISOString().split('T')[0]
          const doctorSlots = this.slots.filter(
            s => s.doctorId === doctorId && s.date >= today && !s.isLocked && s.reserved === 0
          )
          doctorSlots.forEach(slot => {
            slot.isLocked = true
            slot.status = 'locked'
            slot.stopReason = '医生停诊'
          })
          
          this.addLog({
            operator: '系统管理员',
            operatorRole: 'admin',
            operationType: '修改出诊状态',
            operationDetail: `修改医生${doctor.name}的出诊状态为：${statusText}，自动锁定${doctorSlots.length}个未挂号号源`,
            targetId: doctorId,
            targetType: 'doctor'
          })
        } else if (status === 'normal') {
          const today = new Date().toISOString().split('T')[0]
          const doctorSlots = this.slots.filter(
            s => s.doctorId === doctorId && s.date >= today && s.isLocked && s.stopReason === '医生停诊'
          )
          doctorSlots.forEach(slot => {
            slot.isLocked = false
            slot.stopReason = undefined
            if (slot.available === 0) slot.status = 'full'
            else if (slot.available <= 5) slot.status = 'limited'
            else slot.status = 'available'
          })
          
          this.addLog({
            operator: '系统管理员',
            operatorRole: 'admin',
            operationType: '修改出诊状态',
            operationDetail: `修改医生${doctor.name}的出诊状态为：${statusText}，自动解锁${doctorSlots.length}个号源`,
            targetId: doctorId,
            targetType: 'doctor'
          })
        } else {
          this.addLog({
            operator: '系统管理员',
            operatorRole: 'admin',
            operationType: '修改出诊状态',
            operationDetail: `修改医生${doctor.name}的出诊状态为：${statusText}`,
            targetId: doctorId,
            targetType: 'doctor'
          })
        }
        
        return true
      }
      return false
    },

    async createScheduleRule(rule: Omit<ScheduleRule, 'id' | 'createdAt' | 'createdBy'>) {
      const doctor = this.doctors.find(d => d.id === rule.doctorId)
      if (!doctor) return null
      
      const newRule: ScheduleRule = {
        ...rule,
        id: `RULE${String(this.scheduleRules.length + 1).padStart(4, '0')}`,
        doctorName: doctor.name,
        createdAt: new Date().toISOString(),
        createdBy: '系统管理员'
      }
      
      this.scheduleRules.unshift(newRule)
      
      const datesToGenerate: string[] = []
      if (rule.repeatMode === 'none') {
        datesToGenerate.push(rule.date)
      } else if (rule.repeatMode === 'daily' && rule.repeatEndDate) {
        const start = new Date(rule.date)
        const end = new Date(rule.repeatEndDate)
        while (start <= end) {
          datesToGenerate.push(start.toISOString().split('T')[0])
          start.setDate(start.getDate() + 1)
        }
      } else if (rule.repeatMode === 'weekly' && rule.repeatDays && rule.repeatEndDate) {
        const start = new Date(rule.date)
        const end = new Date(rule.repeatEndDate)
        while (start <= end) {
          if (rule.repeatDays.includes(start.getDay())) {
            datesToGenerate.push(start.toISOString().split('T')[0])
          }
          start.setDate(start.getDate() + 1)
        }
      }
      
      let generatedCount = 0
      datesToGenerate.forEach(dateStr => {
        rule.times.forEach(time => {
          const existingSlot = this.slots.find(s => 
            s.doctorId === rule.doctorId && s.date === dateStr && s.time === time
          )
          
          if (!existingSlot) {
            const total = rule.maxPatients
            const fee = this.calculateRegistrationFee(doctor.title, doctor.title === '专家')
            
            this.slots.push({
              id: `SLOT${String(this.slots.length + 1).padStart(5, '0')}`,
              doctorId: rule.doctorId,
              doctorName: doctor.name,
              departmentId: doctor.departmentId,
              departmentName: doctor.departmentName,
              hospitalId: doctor.hospitalId,
              hospitalName: doctor.hospitalName,
              date: dateStr,
              time,
              total,
              reserved: 0,
              available: total,
              status: 'available',
              isExpert: doctor.title === '专家',
              isLocked: false,
              fee,
              scheduleRuleId: newRule.id
            })
            generatedCount++
          }
        })
      })
      
      this.addLog({
        operator: '系统管理员',
        operatorRole: 'admin',
        operationType: '创建排班',
        operationDetail: `为医生${doctor.name}创建排班规则，生成${generatedCount}个号源时段`,
        targetId: newRule.id,
        targetType: 'schedule'
      })
      
      return { rule: newRule, generatedCount }
    },

    async registerPatient(slotId: string, patientData: { patientName: string; patientPhone?: string; patientIdCard?: string }) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot && slot.available > 0 && !slot.isLocked) {
        slot.available--
        slot.reserved++
        if (slot.available === 0) slot.status = 'full'
        else if (slot.available <= 5) slot.status = 'limited'
        
        const newRecord: RegistrationRecord = {
          id: `REG${String(this.registrationRecords.length + 1).padStart(6, '0')}`,
          slotId: slot.id,
          doctorId: slot.doctorId,
          doctorName: slot.doctorName,
          patientName: patientData.patientName,
          patientPhone: patientData.patientPhone,
          patientIdCard: patientData.patientIdCard,
          date: slot.date,
          time: slot.time,
          fee: slot.fee,
          status: 'registered',
          registeredAt: new Date().toISOString(),
          operator: '挂号员1',
          operatorRole: 'registrar'
        }
        this.registrationRecords.unshift(newRecord)
        
        this.addLog({
          operator: '挂号员1',
          operatorRole: 'registrar',
          operationType: '患者挂号',
          operationDetail: `患者${patientData.patientName}挂号成功，医生：${slot.doctorName}，日期：${slot.date}，费用：¥${slot.fee.totalFee}`,
          targetId: newRecord.id,
          targetType: 'registration'
        })
        
        return { success: true, record: newRecord }
      }
      
      return { success: false, message: slot?.isLocked ? '号源已锁定' : '号源不足' }
    },

    async cancelRegistration(recordId: string, reason?: string) {
      const record = this.registrationRecords.find(r => r.id === recordId)
      if (record && record.status === 'registered') {
        record.status = 'cancelled'
        record.cancelledAt = new Date().toISOString()
        record.cancelReason = reason || '患者取消'
        
        const slot = this.slots.find(s => s.id === record.slotId)
        if (slot) {
          slot.available++
          slot.reserved--
          if (slot.available > 5) slot.status = 'available'
          else if (slot.available > 0) slot.status = 'limited'
          else slot.status = 'full'
        }
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '取消挂号',
          operationDetail: `取消患者${record.patientName}的挂号，医生：${record.doctorName}，原因：${reason || '患者取消'}`,
          targetId: recordId,
          targetType: 'registration'
        })
        
        return true
      }
      return false
    },

    async checkInPatient(recordId: string) {
      const record = this.registrationRecords.find(r => r.id === recordId)
      if (record && record.status === 'registered') {
        record.status = 'checked'
        record.checkedAt = new Date().toISOString()
        
        this.addLog({
          operator: '挂号员1',
          operatorRole: 'registrar',
          operationType: '患者签到',
          operationDetail: `患者${record.patientName}签到成功，医生：${record.doctorName}，日期：${record.date}`,
          targetId: recordId,
          targetType: 'registration'
        })
        
        return true
      }
      return false
    },

    async lockSlot(slotId: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot && !slot.isLocked) {
        slot.isLocked = true
        slot.status = 'locked'
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '锁定号源',
          operationDetail: `锁定号源：${slot.doctorName} ${slot.date} ${slot.time}`,
          targetId: slotId,
          targetType: 'slot'
        })
        
        return true
      }
      return false
    },

    async unlockSlot(slotId: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot && slot.isLocked) {
        slot.isLocked = false
        if (slot.available === 0) slot.status = 'full'
        else if (slot.available <= 5) slot.status = 'limited'
        else slot.status = 'available'
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '解锁号源',
          operationDetail: `解锁号源：${slot.doctorName} ${slot.date} ${slot.time}`,
          targetId: slotId,
          targetType: 'slot'
        })
        
        return true
      }
      return false
    },

    async releaseSlot(slotId: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot && slot.reserved > 0) {
        slot.available++
        slot.reserved--
        if (slot.available > 5) slot.status = 'available'
        else if (slot.available > 0) slot.status = 'limited'
        else slot.status = 'full'
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '释放号源',
          operationDetail: `手动释放号源，医生：${slot.doctorName}，日期：${slot.date}，时段：${slot.time}`,
          targetId: slotId,
          targetType: 'slot'
        })
        
        return true
      }
      return false
    },

    async batchLockSlots(slotIds: string[]) {
      const lockableSlots = this.slots.filter(s => slotIds.includes(s.id) && !s.isLocked && s.reserved === 0)
      const lockedCount = lockableSlots.length
      
      lockableSlots.forEach(slot => {
        slot.isLocked = true
        slot.status = 'locked'
      })
      
      if (lockedCount > 0) {
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '批量锁定号源',
          operationDetail: `批量锁定${lockedCount}个号源`,
          targetType: 'slot'
        })
      }
      
      return lockedCount
    },

    async batchUnlockSlots(slotIds: string[]) {
      const unlockableSlots = this.slots.filter(s => slotIds.includes(s.id) && s.isLocked)
      const unlockedCount = unlockableSlots.length
      
      unlockableSlots.forEach(slot => {
        slot.isLocked = false
        if (slot.available === 0) slot.status = 'full'
        else if (slot.available <= 5) slot.status = 'limited'
        else slot.status = 'available'
      })
      
      if (unlockedCount > 0) {
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '批量解锁号源',
          operationDetail: `批量解锁${unlockedCount}个号源`,
          targetType: 'slot'
        })
      }
      
      return unlockedCount
    },

    async addStopNote(slotId: string, reason: string) {
      const slot = this.slots.find(s => s.id === slotId)
      if (slot) {
        slot.stopReason = reason
        
        this.addLog({
          operator: '系统管理员',
          operatorRole: 'admin',
          operationType: '添加停诊备注',
          operationDetail: `为号源添加停诊备注：${reason}`,
          targetId: slotId,
          targetType: 'slot'
        })
        
        return true
      }
      return false
    },

    addLog(log: Omit<OperationLog, 'id' | 'timestamp'>) {
      const newLog: OperationLog = {
        ...log,
        id: `LOG${String(this.logs.length + 1).padStart(5, '0')}`,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100',
        deviceInfo: navigator.userAgent
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
        this.fetchLogs(),
        this.fetchFeeRules(),
        this.fetchScheduleRules(),
        this.fetchRegistrationRecords()
      ])
    }
  },

  persist: {
    paths: ['hospitals', 'departments', 'doctors', 'slots', 'logs', 'feeRules', 'scheduleRules', 'registrationRecords']
  }
})
