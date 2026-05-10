import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, StockOperation, OperationLogFilter, OperationType } from '@/types'
import { OperationType as OperationTypeEnum } from '@/types'
import { STORAGE_KEYS, saveToStorage, getFromStorage, generateId, formatDate } from '@/utils/storage'
import { useToastStore } from './toast'

export const useOperationLogStore = defineStore('operationLog', () => {
  const logs = ref<OperationLog[]>(
    getFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, [])
  )

  const toast = useToastStore()

  const totalLogs = computed(() => logs.value.length)

  const recentLogs = computed(() => 
    [...logs.value]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)
  )

  const stockInLogs = computed(() => 
    logs.value.filter(log => log.operationType === OperationTypeEnum.STOCK_IN)
  )

  const stockOutLogs = computed(() => 
    logs.value.filter(log => log.operationType === OperationTypeEnum.STOCK_OUT)
  )

  const expiredLogs = computed(() => 
    logs.value.filter(log => log.operationType === OperationTypeEnum.EXPIRED_PROCESS)
  )

  function persist() {
    saveToStorage(STORAGE_KEYS.OPERATION_LOGS, logs.value)
  }

  function addLog(operation: StockOperation): void {
    const operationTypeLabels: Record<string, string> = {
      [OperationTypeEnum.STOCK_IN]: '入库登记',
      [OperationTypeEnum.STOCK_OUT]: '出库领用',
      [OperationTypeEnum.EXPIRED_PROCESS]: '临期处理',
      'stock-in': '入库登记',
      'stock-out': '出库领用',
      'expired-process': '临期处理'
    }

    const operationTypeLabel = operationTypeLabels[operation.operationType] || '未知操作'
    
    let operationContent = `${operationTypeLabel}：${operation.foodItemName}`
    if (operation.notes) {
      operationContent += ` - ${operation.notes}`
    }

    const log: OperationLog = {
      id: generateId(),
      operationTime: formatDate(new Date()),
      operator: operation.operator,
      operationContent,
      foodItemId: operation.foodItemId,
      foodItemName: operation.foodItemName,
      stockChange: operation.quantity,
      operationType: operation.operationType,
      notes: operation.notes,
      createdAt: formatDate(new Date())
    }

    logs.value.unshift(log)
    
    const MAX_LOGS = 500
    if (logs.value.length > MAX_LOGS) {
      logs.value = logs.value.slice(0, MAX_LOGS)
    }
    
    persist()
  }

  function getLogsByType(operationType: OperationType): OperationLog[] {
    return logs.value.filter(log => log.operationType === operationType)
  }

  function getLogsByOperator(operator: string): OperationLog[] {
    const keyword = operator.toLowerCase()
    return logs.value.filter(log => log.operator.toLowerCase().includes(keyword))
  }

  function getLogsByFoodItem(foodItemId: string): OperationLog[] {
    return logs.value.filter(log => log.foodItemId === foodItemId)
  }

  function filterLogs(filter: OperationLogFilter): OperationLog[] {
    return logs.value.filter(log => {
      if (filter.operationType && log.operationType !== filter.operationType) return false
      
      if (filter.operator) {
        const keyword = filter.operator.toLowerCase()
        if (!log.operator.toLowerCase().includes(keyword)) return false
      }

      if (filter.foodItemId && log.foodItemId !== filter.foodItemId) return false

      if (filter.startDate) {
        const logDate = new Date(log.createdAt)
        const startDate = new Date(filter.startDate)
        if (logDate < startDate) return false
      }

      if (filter.endDate) {
        const logDate = new Date(log.createdAt)
        const endDate = new Date(filter.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (logDate > endDate) return false
      }

      return true
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  function getStats(): {
    total: number
    stockIn: number
    stockOut: number
    expired: number
    today: number
  } {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    return {
      total: logs.value.length,
      stockIn: stockInLogs.value.length,
      stockOut: stockOutLogs.value.length,
      expired: expiredLogs.value.length,
      today: logs.value.filter(log => log.createdAt.startsWith(todayStr)).length
    }
  }

  function getRecentLogsByType(limit: number = 10): {
    stockIn: OperationLog[]
    stockOut: OperationLog[]
    expired: OperationLog[]
  } {
    return {
      stockIn: stockInLogs.value.slice(0, limit),
      stockOut: stockOutLogs.value.slice(0, limit),
      expired: expiredLogs.value.slice(0, limit)
    }
  }

  function clearLogs(): void {
    logs.value = []
    persist()
    toast.success('操作日志已清空')
  }

  function exportLogs(): string {
    const data = {
      exportTime: formatDate(new Date()),
      totalCount: logs.value.length,
      logs: logs.value
    }
    return JSON.stringify(data, null, 2)
  }

  return {
    logs,
    totalLogs,
    recentLogs,
    stockInLogs,
    stockOutLogs,
    expiredLogs,
    addLog,
    getLogsByType,
    getLogsByOperator,
    getLogsByFoodItem,
    filterLogs,
    getStats,
    getRecentLogsByType,
    clearLogs,
    exportLogs
  }
})
