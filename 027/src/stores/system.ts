import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Department, Doctor, Schedule, TitleLevel, OperationType, TargetType, OperationLog } from '@/types'
import { departmentApi, doctorApi, scheduleApi, operationLogApi } from '@/api'
import { mockCurrentUser } from '@/mock/data'
import { useAuditStore } from './audit'

export const useSystemStore = defineStore('system', () => {
  const departments = ref<Department[]>([])
  const doctors = ref<Doctor[]>([])
  const isLoading = ref(false)

  const activeDepartments = computed(() => 
    departments.value.filter(d => d.status === 'active')
  )

  const titleLevels: TitleLevel[] = ['主任医师', '副主任医师', '主治医师', '住院医师', '医士']

  const currentUser = ref(mockCurrentUser)

  async function fetchDepartments() {
    isLoading.value = true
    try {
      departments.value = await departmentApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDoctors() {
    isLoading.value = true
    try {
      doctors.value = await doctorApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  function getDepartmentById(id: string) {
    return departments.value.find(d => d.id === id)
  }

  function getDoctorById(id: string) {
    return doctors.value.find(d => d.id === id)
  }

  function getDoctorsByDepartment(deptId: string) {
    return doctors.value.filter(d => d.departmentId === deptId && d.status === 'on_duty')
  }

  async function createDepartment(data: Partial<Department>) {
    const dept = await departmentApi.create(data)
    departments.value.unshift(dept)
    await logOperation('create_department', '新增科室', 'department', dept.id, dept.name)
    return dept
  }

  async function updateDepartment(id: string, data: Partial<Department>) {
    const dept = await departmentApi.update(id, data)
    const index = departments.value.findIndex(d => d.id === id)
    if (index > -1) {
      departments.value[index] = dept
    }
    await logOperation('update_department', '修改科室信息', 'department', dept.id, dept.name)
    return dept
  }

  async function deleteDepartment(id: string) {
    const dept = getDepartmentById(id)
    await departmentApi.delete(id)
    departments.value = departments.value.filter(d => d.id !== id)
    if (dept) {
      await logOperation('delete_department', '删除科室', 'department', id, dept.name)
    }
  }

  async function createDoctor(data: Partial<Doctor>) {
    const doctor = await doctorApi.create(data)
    doctors.value.unshift(doctor)
    await logOperation('create_doctor', '新增医生', 'doctor', doctor.id, doctor.name)
    return doctor
  }

  async function updateDoctor(id: string, data: Partial<Doctor>) {
    const doctor = await doctorApi.update(id, data)
    const index = doctors.value.findIndex(d => d.id === id)
    if (index > -1) {
      doctors.value[index] = doctor
    }
    await logOperation('update_doctor', '修改医生信息', 'doctor', doctor.id, doctor.name)
    return doctor
  }

  async function deleteDoctor(id: string) {
    const doctor = getDoctorById(id)
    await doctorApi.delete(id)
    doctors.value = doctors.value.filter(d => d.id !== id)
    if (doctor) {
      await logOperation('delete_doctor', '删除医生', 'doctor', id, doctor.name)
    }
  }

  async function getDoctorSchedules(doctorId: string) {
    return await scheduleApi.getByDoctor(doctorId)
  }

  async function updateDoctorSchedules(doctorId: string, schedules: Schedule[]) {
    await scheduleApi.updateBatch(doctorId, schedules)
    const doctor = getDoctorById(doctorId)
    if (doctor) {
      await logOperation('update_schedule', '调整排班', 'schedule', doctorId, doctor.name)
    }
  }

  async function logOperation(
    operationType: OperationType,
    description: string,
    targetType: TargetType,
    targetId: string,
    targetName: string
  ) {
    const logData: Omit<OperationLog, 'id' | 'createdAt'> = {
      operatorId: currentUser.value.id,
      operatorName: currentUser.value.name,
      operatorRole: currentUser.value.role,
      operationType,
      operationDescription: description,
      targetType,
      targetId,
      targetName,
      ipAddress: '127.0.0.1'
    }
    try {
      const createdLog = await operationLogApi.create(logData)
      const auditStore = useAuditStore()
      auditStore.addLog(createdLog)
    } catch (e) {
      console.error('记录操作日志失败:', e)
    }
  }

  return {
    departments,
    doctors,
    isLoading,
    activeDepartments,
    titleLevels,
    currentUser,
    fetchDepartments,
    fetchDoctors,
    getDepartmentById,
    getDoctorById,
    getDoctorsByDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorSchedules,
    updateDoctorSchedules,
    logOperation
  }
}, {
  persist: {
    key: 'hospital-system',
    paths: ['currentUser']
  }
})
