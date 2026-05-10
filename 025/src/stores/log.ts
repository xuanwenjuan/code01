import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import type { OperationLog, PaginationParams, PaginatedResponse, OperationLogFilterParams } from '@/types'
import { logApi } from '@/api'

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>([])
  const pagination = reactive<PaginationParams>({ page: 1, pageSize: 10 })
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const filterParams = reactive<OperationLogFilterParams>({
    operator: '',
    operationType: '',
    startTime: '',
    endTime: ''
  })

  async function fetchLogs(): Promise<PaginatedResponse<OperationLog>> {
    loading.value = true
    try {
      const result: PaginatedResponse<OperationLog> = await logApi.getList({
        pagination,
        ...filterParams
      })
      logs.value = result.list
      total.value = result.total
      return result
    } finally {
      loading.value = false
    }
  }

  function setFilterParams(params: Partial<OperationLogFilterParams>): void {
    Object.assign(filterParams, params)
    pagination.page = 1
  }

  function setPagination(params: Partial<PaginationParams>): void {
    Object.assign(pagination, params)
  }

  function resetFilters(): void {
    Object.assign(filterParams, {
      operator: '',
      operationType: '',
      startTime: '',
      endTime: ''
    })
    pagination.page = 1
  }

  return {
    logs,
    pagination,
    total,
    loading,
    filterParams,
    fetchLogs,
    setFilterParams,
    setPagination,
    resetFilters
  }
})
