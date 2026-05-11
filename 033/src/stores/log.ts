import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OperationLog, LogFilter, ActionType } from '@/types'
import { getNowString } from '@/utils/date'
import { generateId } from '@/utils/id'
import { getMockLogs } from '@/mock'

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>([])

  function initLogs() {
    if (logs.value.length === 0) {
      logs.value = getMockLogs()
    }
  }

  function addLog(log: Omit<OperationLog, 'id' | 'operatorId' | 'createdAt'>) {
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operatorId: 'admin',
      createdAt: getNowString()
    }
    logs.value.unshift(newLog)
    return newLog
  }

  function filterLogs(filter: LogFilter) {
    let result = [...logs.value]
    
    if (filter.operatorName) {
      result = result.filter((l) => l.operatorName.includes(filter.operatorName!))
    }
    
    if (filter.actionType) {
      result = result.filter((l) => l.actionType === filter.actionType)
    }
    
    if (filter.targetType) {
      result = result.filter((l) => l.targetType === filter.targetType)
    }
    
    if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
      const start = filter.dateRange[0] + ' 00:00:00'
      const end = filter.dateRange[1] + ' 23:59:59'
      result = result.filter((l) => l.createdAt >= start && l.createdAt <= end)
    }
    
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  function getUniqueOperators() {
    const operators = new Set<string>()
    logs.value.forEach((l) => operators.add(l.operatorName))
    return Array.from(operators)
  }

  function getActionTypes(): ActionType[] {
    return ['add', 'update', 'delete', 'consume', 'replenish', 'mark_taken', 'mark_skipped', 'update_reminder']
  }

  return {
    logs,
    initLogs,
    addLog,
    filterLogs,
    getUniqueOperators,
    getActionTypes
  }
}, {
  persist: true
})
