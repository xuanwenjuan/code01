import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import type { OperationLog, LogFilterParams, OperationType } from '@/types/log'
import type { PaginationParams } from '@/types/common'
import * as logApi from '@/api/log'

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>([])
  const total = ref(0)
  const loading = ref(false)
  const isListening = ref(false)
  let unsubscribe: (() => void) | undefined

  const pagination = ref<PaginationParams>({
    page: 1,
    pageSize: 10
  })

  const filters = ref<LogFilterParams>({
    keyword: '',
    operationType: '',
    operator: '',
    targetType: '',
    startTime: '',
    endTime: ''
  })

  const operationTypes: OperationType[] = logApi.getOperationTypes()

  const startListening = (): void => {
    if (isListening.value) return
    
    unsubscribe = logApi.subscribeToLogs((newLog: OperationLog) => {
      if (pagination.value.page === 1) {
        logs.value.unshift(newLog)
        total.value++
        if (logs.value.length > pagination.value.pageSize * 2) {
          logs.value = logs.value.slice(0, pagination.value.pageSize)
        }
      }
    })
    
    isListening.value = true
  }

  const stopListening = (): void => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = undefined
    }
    isListening.value = false
  }

  const fetchLogs = async (): Promise<void> => {
    loading.value = true
    try {
      const response = await logApi.getLogList({
        ...pagination.value,
        ...filters.value
      })
      logs.value = response.list
      total.value = response.total
    } finally {
      loading.value = false
    }
  }

  const resetFilters = (): void => {
    filters.value = {
      keyword: '',
      operationType: '',
      operator: '',
      targetType: '',
      startTime: '',
      endTime: ''
    }
    pagination.value.page = 1
  }

  const setPage = (page: number): void => {
    pagination.value.page = page
  }

  const setPageSize = (pageSize: number): void => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
  }

  const setFilters = (newFilters: Partial<LogFilterParams>): void => {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  const getLogsByTarget = (targetId: string, targetType: 'asset' | 'borrow'): OperationLog[] => {
    return logApi.getLogsByTarget(targetId, targetType)
  }

  const refresh = async (): Promise<void> => {
    await fetchLogs()
  }

  onUnmounted(() => {
    stopListening()
  })

  return {
    logs,
    total,
    loading,
    isListening,
    pagination,
    filters,
    operationTypes,
    fetchLogs,
    resetFilters,
    setPage,
    setPageSize,
    setFilters,
    startListening,
    stopListening,
    getLogsByTarget,
    refresh
  }
}, {
  persist: {
    key: 'log-store',
    paths: ['pagination', 'filters']
  }
})
