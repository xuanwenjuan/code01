import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Registration, Prescription, Patient, VisitStatus, TimeSlot } from '@/types'
import { registrationApi, prescriptionApi, patientApi, operationLogApi } from '@/api'
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
    return reg
  }

  async function cancelRegistration(id: string) {
    const reg = await registrationApi.cancel(id)
    const index = registrations.value.findIndex(r => r.id === id)
    if (index > -1) {
      registrations.value[index] = reg
    }
    await systemStore.logOperation(
      'cancel_registration',
      '退号处理',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.departmentName}`
    )
    return reg
  }

  async function startVisit(id: string) {
    const reg = await registrationApi.updateStatus(id, 'ongoing')
    const index = registrations.value.findIndex(r => r.id === id)
    if (index > -1) {
      registrations.value[index] = reg
    }
    await systemStore.logOperation(
      'start_visit',
      '开始接诊',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.doctorName}`
    )
    return reg
  }

  async function completeVisit(id: string, diagnosis: string) {
    const reg = await registrationApi.updateStatus(id, 'completed', diagnosis)
    const index = registrations.value.findIndex(r => r.id === id)
    if (index > -1) {
      registrations.value[index] = reg
    }
    await systemStore.logOperation(
      'complete_visit',
      '完成就诊',
      'registration',
      reg.id,
      `${reg.patientName} - ${reg.doctorName}`
    )
    return reg
  }

  async function createPrescription(data: Partial<Prescription>) {
    const presc = await prescriptionApi.create(data)
    prescriptions.value.unshift(presc)
    await systemStore.logOperation(
      'create_prescription',
      '开具处方',
      'prescription',
      presc.id,
      `${presc.patientName} - ${presc.doctorName}`
    )
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
    fetchRegistrations,
    fetchPrescriptions,
    fetchPatients,
    setFilterParams,
    clearFilters,
    createRegistration,
    cancelRegistration,
    startVisit,
    completeVisit,
    createPrescription,
    getPrescriptionByRegistration
  }
})
