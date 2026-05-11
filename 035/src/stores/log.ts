import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, OperationType, LogFilter } from '@/types'
import { mockLogs } from '@/mock'
import { generateId } from '@/utils'

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>(mockLogs)

  const recentLogs = computed(() => logs.value.slice(0, 10))

  function addLog(type: OperationType, description: string, detail: string = ''): OperationLog {
    const log: OperationLog = {
      id: generateId(),
      type,
      description,
      detail,
      timestamp: new Date().toISOString(),
    }
    logs.value.unshift(log)
    return log
  }

  function getLogsByFilter(filter: LogFilter): OperationLog[] {
    return logs.value.filter(log => {
      if (filter.type && log.type !== filter.type) return false
      
      if (filter.startDate) {
        const logDate = new Date(log.timestamp)
        const startDate = new Date(filter.startDate + 'T00:00:00')
        if (logDate < startDate) return false
      }
      
      if (filter.endDate) {
        const logDate = new Date(log.timestamp)
        const endDate = new Date(filter.endDate + 'T23:59:59')
        if (logDate > endDate) return false
      }
      
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        const matchesDesc = log.description.toLowerCase().includes(keyword)
        const matchesDetail = log.detail.toLowerCase().includes(keyword)
        if (!matchesDesc && !matchesDetail) return false
      }
      
      return true
    })
  }

  function getLogsByType(type: OperationType): OperationLog[] {
    return logs.value.filter(log => log.type === type)
  }

  function getCountByType(type: OperationType): number {
    return logs.value.filter(log => log.type === type).length
  }

  function clearLogs(): void {
    logs.value = []
  }

  function deleteLog(logId: string): boolean {
    const index = logs.value.findIndex(l => l.id === logId)
    if (index === -1) return false
    logs.value.splice(index, 1)
    return true
  }

  return {
    logs,
    recentLogs,
    addLog,
    getLogsByFilter,
    getLogsByType,
    getCountByType,
    clearLogs,
    deleteLog,
  }
}, {
  persist: {
    key: 'finance_logs',
    paths: ['logs'],
  },
})
