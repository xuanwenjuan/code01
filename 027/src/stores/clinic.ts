import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Registration, Prescription, Patient, VisitStatus, TimeSlot, PaymentStatus } from '@/types'
import { registrationApi, prescriptionApi, patientApi } from '@/api'
import { useSystemStore } from './system'

export interface FilterParams {
  departmentId?: string
  doctorId?: string
  doctorTitle?: string
  visitStatus?: VisitStatus
  timeSlot?: TimeSlot
  scheduleDate?: string
  patientName?: string
}

type StatusTransition = Record<VisitStatus, VisitStatus[]>

const STATUS_TRANSITIONS: StatusTransition = {
  waiting: ['ongoing', 'cancelled'],
  ongoing: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
}

const PAYMENT_STATUS_MAP: Partial<Record<VisitStatus, PaymentStatus>> = {
  waiting: 'pending',
  ongoing: 'paid',
  completed: 'paid',
  cancelled: 'refunded'
}

function canTransition(from: VisitStatus, to: VisitStatus): boolean {
  const allowed = STATUS_TRANSITIONS[from]
  return allowed.includes(to)
}

function getStatusErrorMessage(from: VisitStatus, to: VisitStatus): string {
  const statusLabels: Record<VisitStatus, string> = {
    waiting: '候诊中',
    ongoing: '就诊中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return `无法从「${statusLabels[from]}」状态切换到「${statusLabels[to]}」状态`
}

export const useClinicStore = defineStore('clinic', () => {
  const registrations = ref<Registration[]>([])
  const prescriptions = ref<Prescription[]>([])
  const patients = ref<Patient[]>([])
  const isLoading = ref(false)
  const filterParams = ref<FilterParams>({})

  const systemStore = useSystemStore()

  const filteredRegistrations = computed(() => {
    return registrations.value.filter(reg => {
      if (filterParams.value.departmentId && reg.departmentId !== filterParams.value.departmentId) {
        return false
      }
      if (filterParams.value.doctorId && reg.doctorId !== filterParams.value.doctorId) {
        return false
      }
      if (filterParams.value.doctorTitle) {
        const doctor = systemStore.getDoctorById(reg.doctorId)
        if (doctor?.title !== filterParams.value.doctorTitle) {
          return false
        }
      }
      if (filterParams.value.visitStatus && reg.status !== filterParams.value.visitStatus) {
        return false
      }
      if (filterParams.value.timeSlot && reg.timeSlot !== filterParams.value.timeSlot) {
        return false
      }
      if (filterParams.value.scheduleDate && reg.scheduleDate !== filterParams.value.scheduleDate) {
        return false
      }
      if (filterParams.value.patientName) {
        if (!reg.patientName.includes(filterParams.value.patientName)) {
          return false
        }
      }
      return true
    })
  })

  const waitingCount = computed(() => 
    registrations.value.filter(r => r.status === 'waiting').length
  )

  const ongoingCount = computed(() => 
    registrations.value.filter(r => r.status === 'ongoing').length
  )

  const completedCount = computed(() => 
    registrations.value.filter(r => r.status === 'completed').length
  )

  const cancelledCount = computed(() => 
    registrations.value.filter(r => r.status === 'cancelled').length
  )

  const queueStats = computed(() => ({
    waiting: waitingCount.value,
    ongoing: ongoingCount.value,
    completed: completedCount.value,
    cancelled: cancelledCount.value
  }))

  const currentCalling = computed(() => {
    return registrations.value.find(r => r.status === 'ongoing')?.visitNumber || null
  })

  const nextInQueue = computed(() => {
    const waitingList = registrations.value.filter(r => r.status === 'waiting')
    return waitingList.length > 0 ? waitingList[0].visitNumber : null
  })

  async function fetchRegistrations() {
    isLoading.value = true
    try {
      registrations.value = await registrationApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPrescriptions() {
    isLoading.value = true
    try {
      prescriptions.value = await prescriptionApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPatients() {
    isLoading.value = true
    try {
      patients.value = await patientApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  function setFilterParams(params: Partial<FilterParams>) {
    filterParams.value = { ...filterParams.value, ...params }
  }

  function clearFilters() {
    filterParams.value = {}
  }

  function updateRegistrationLocal(reg: Registration) {
    const index = registrations.value.findIndex(r => r.id === reg.id)
    if (index > -1) {
      registrations.value[index] = reg
    }
  }

  function getRegistrationById(id: string): Registration | undefined {
    return registrations.value.find(r => r.id === id)
  }

  async function createRegistration(data: Partial<Registration>) {
    const reg = await registrationApi.create(data)
    registrations.value.unshift(reg)
    await systemStore.logOperation(
      'create_registration',
      '患者挂号',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.departmentName}`
    )
    ElMessage.success('挂号成功')
    return reg
  }

  async function cancelRegistration(id: string) {
    const currentReg = getRegistrationById(id)
    if (!currentReg) {
      throw new Error('挂号单不存在')
    }

    if (!canTransition(currentReg.status, 'cancelled')) {
      const errorMsg = getStatusErrorMessage(currentReg.status, 'cancelled')
      ElMessage.error(errorMsg)
      throw new Error(errorMsg)
    }

    const reg = await registrationApi.cancel(id)
    updateRegistrationLocal(reg)
    await systemStore.logOperation(
      'cancel_registration',
      '退号处理',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.departmentName}`
    )
    ElMessage.success('退号成功')
    return reg
  }

  async function startVisit(id: string) {
    const currentReg = getRegistrationById(id)
    if (!currentReg) {
      throw new Error('挂号单不存在')
    }

    if (!canTransition(currentReg.status, 'ongoing')) {
      const errorMsg = getStatusErrorMessage(currentReg.status, 'ongoing')
      ElMessage.error(errorMsg)
      throw new Error(errorMsg)
    }

    const hasOngoing = registrations.value.some(
      r => r.status === 'ongoing' && r.doctorId === currentReg.doctorId
    )
    if (hasOngoing) {
      ElMessage.warning('该医生当前有正在进行的就诊，请先完成当前就诊')
      throw new Error('该医生当前有正在进行的就诊')
    }

    const reg = await registrationApi.updateStatus(id, 'ongoing')
    updateRegistrationLocal(reg)
    await systemStore.logOperation(
      'start_visit',
      '开始接诊',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.doctorName}`
    )
    ElMessage.success('已开始接诊')
    return reg
  }

  async function completeVisit(id: string, diagnosis: string) {
    const currentReg = getRegistrationById(id)
    if (!currentReg) {
      throw new Error('挂号单不存在')
    }

    if (!canTransition(currentReg.status, 'completed')) {
      const errorMsg = getStatusErrorMessage(currentReg.status, 'completed')
      ElMessage.error(errorMsg)
      throw new Error(errorMsg)
    }

    if (!diagnosis || !diagnosis.trim()) {
      ElMessage.error('请输入诊断结果')
      throw new Error('诊断结果不能为空')
    }

    const reg = await registrationApi.updateStatus(id, 'completed', diagnosis.trim())
    updateRegistrationLocal(reg)
    await systemStore.logOperation(
      'complete_visit',
      '完成就诊',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.doctorName}`
    )
    ElMessage.success('就诊已完成')
    return reg
  }

  async function createPrescription(data: Partial<Prescription>) {
    const presc = await prescriptionApi.create(data)
    prescriptions.value.unshift(presc)
    
    const registration = getRegistrationById(presc.registrationId)
    if (registration) {
      const updatedReg: Registration = {
        ...registration,
        totalFee: registration.registrationFee + presc.totalPrice
      }
      updateRegistrationLocal(updatedReg)
    }
    
    await systemStore.logOperation(
      'create_prescription',
      '开具处方',
      'prescription',
      presc.id,
      `${presc.patientName} - ${presc.doctorName}`
    )
    ElMessage.success('处方已开具')
    return presc
  }

  async function getPrescriptionByRegistration(regId: string) {
    return await prescriptionApi.getByRegistration(regId)
  }

  return {
    registrations,
    prescriptions,
    patients,
    isLoading,
    filterParams,
    filteredRegistrations,
    queueStats,
    currentCalling,
    nextInQueue,
    fetchRegistrations,
    fetchPrescriptions,
    fetchPatients,
    setFilterParams,
    clearFilters,
    getRegistrationById,
    createRegistration,
    cancelRegistration,
    startVisit,
    completeVisit,
    createPrescription,
    getPrescriptionByRegistration
  }
})
