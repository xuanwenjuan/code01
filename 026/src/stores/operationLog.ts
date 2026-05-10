import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, FilterParams, OperationType, TargetType } from '@/types'
import { operationLogs as mockLogs } from '@/mock'
import { getCurrentDateTime } from '@/utils/date'

export const useOperationLogStore = defineStore('operationLog', () => {
  const logs = ref<OperationLog[]>([...mockLogs])
  const filterParams = ref<FilterParams>({})

  const filteredLogs = computed<OperationLog[]>(() => {
    return logs.value.filter((log: OperationLog) => {
      if (filterParams.value.keyword) {
        const keyword: string = filterParams.value.keyword.toLowerCase()
        if (
          !log.operatorName.toLowerCase().includes(keyword) &&
          !log.description.toLowerCase().includes(keyword)
        ) {
          return false
        }
      }
      return true
    })
  })

  function addLog(log: Omit<OperationLog, 'id' | 'createTime' | 'ip'>): void {
    const newLog: OperationLog = {
      ...log,
      id: `log_${Date.now()}`,
      createTime: getCurrentDateTime(),
      ip: '127.0.0.1'
    }
    logs.value.unshift(newLog)
  }

  function setFilterParams(params: Partial<FilterParams>): void {
    filterParams.value = { ...filterParams.value, ...params }
  }

  function clearFilterParams(): void {
    filterParams.value = {}
  }

  return {
    logs,
    filterParams,
    filteredLogs,
    addLog,
    setFilterParams,
    clearFilterParams
  }
}, {
  persist: true
})
