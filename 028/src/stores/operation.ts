import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, FilterParams, OperationType } from '@/types'
import { operationLogs as mockLogs } from '@/mock/data'

export const useOperationStore = defineStore('operation', () => {
  const operationLogs = ref<OperationLog[]>([...mockLogs])

  const logList = computed(() => operationLogs.value)

  const addLog = (log: Omit<OperationLog, 'id' | 'operationTime' | 'ipAddress'>): void => {
    const newLog: OperationLog = {
      ...log,
      id: `log${Date.now()}`,
      operationTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.1.100'
    }
    operationLogs.value.unshift(newLog)
  }

  const filterLogs = (params: FilterParams): OperationLog[] => {
    let result = [...operationLogs.value]
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      result = result.filter(l => 
        l.operationTitle.toLowerCase().includes(keyword) ||
        l.operator.toLowerCase().includes(keyword) ||
        l.details.toLowerCase().includes(keyword)
      )
    }
    if (params.status) {
      result = result.filter(l => l.operationType === params.status as OperationType)
    }
    if (params.startDate) {
      result = result.filter(l => l.operationTime >= params.startDate)
    }
    if (params.endDate) {
      result = result.filter(l => l.operationTime <= params.endDate)
    }
    if (params.operator) {
      result = result.filter(l => l.operator.includes(params.operator))
    }
    return result
  }

  const getLogById = (logId: string): OperationLog | undefined => {
    return operationLogs.value.find(l => l.id === logId)
  }

  return {
    operationLogs,
    logList,
    addLog,
    filterLogs,
    getLogById
  }
}, {
  persist: {
    key: 'operation-store',
    paths: ['operationLogs']
  }
})
