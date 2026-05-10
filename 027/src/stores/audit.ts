import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, UserRole, OperationType } from '@/types'
import { operationLogApi } from '@/api'

export interface LogFilterParams {
  operatorRole?: UserRole
  operationType?: OperationType
  targetType?: string
  startTime?: string
  endTime?: string
  operatorName?: string
}

export const useAuditStore = defineStore('audit', () => {
  const operationLogs = ref<OperationLog[]>([])
  const isLoading = ref(false)
  const filterParams = ref<LogFilterParams>({})

  const operationTypeOptions = [
    { value: 'create_department', label: '新增科室' },
    { value: 'update_department', label: '修改科室信息' },
    { value: 'delete_department', label: '删除科室' },
    { value: 'create_doctor', label: '新增医生' },
    { value: 'update_doctor', label: '修改医生信息' },
    { value: 'delete_doctor', label: '删除医生' },
    { value: 'update_schedule', label: '调整排班' },
    { value: 'create_registration', label: '患者挂号' },
    { value: 'cancel_registration', label: '退号处理' },
    { value: 'start_visit', label: '开始接诊' },
    { value: 'complete_visit', label: '完成就诊' },
    { value: 'create_prescription', label: '开具处方' }
  ]

  const userRoleOptions = [
    { value: 'admin', label: '系统管理员' },
    { value: 'doctor', label: '医生' },
    { value: 'reception', label: '挂号员' },
    { value: 'nurse', label: '护士' }
  ]

  const targetTypeOptions = [
    { value: 'department', label: '科室' },
    { value: 'doctor', label: '医生' },
    { value: 'registration', label: '挂号单' },
    { value: 'prescription', label: '处方' },
    { value: 'schedule', label: '排班' }
  ]

  const filteredLogs = computed(() => {
    return operationLogs.value.filter(log => {
      if (filterParams.value.operatorRole && log.operatorRole !== filterParams.value.operatorRole) {
        return false
      }
      if (filterParams.value.operationType && log.operationType !== filterParams.value.operationType) {
        return false
      }
      if (filterParams.value.targetType && log.targetType !== filterParams.value.targetType) {
        return false
      }
      if (filterParams.value.operatorName) {
        if (!log.operatorName.includes(filterParams.value.operatorName)) {
          return false
        }
      }
      if (filterParams.value.startTime) {
        if (new Date(log.createdAt) < new Date(filterParams.value.startTime)) {
          return false
        }
      }
      if (filterParams.value.endTime) {
        if (new Date(log.createdAt) > new Date(filterParams.value.endTime + ' 23:59:59')) {
          return false
        }
      }
      return true
    })
  })

  async function fetchLogs() {
    isLoading.value = true
    try {
      operationLogs.value = await operationLogApi.getList()
    } finally {
      isLoading.value = false
    }
  }

  function setFilterParams(params: Partial<LogFilterParams>) {
    filterParams.value = { ...filterParams.value, ...params }
  }

  function clearFilters() {
    filterParams.value = {}
  }

  return {
    operationLogs,
    isLoading,
    filterParams,
    operationTypeOptions,
    userRoleOptions,
    targetTypeOptions,
    filteredLogs,
    fetchLogs,
    setFilterParams,
    clearFilters
  }
})
