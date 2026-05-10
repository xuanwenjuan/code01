import { ref, watch, computed } from 'vue'
import type { OperationLog, OperationType } from '@/types'
import { logStorage } from '@/utils/storage'
import { generateId, now } from '@/utils'

const logs = ref<OperationLog[]>(logStorage.get<OperationLog[]>([]))

function saveLogs(): void {
  logStorage.set(logs.value)
}

watch(logs, () => {
  saveLogs()
}, { deep: true })

export function useLogStore() {
  const addLog = (log: Omit<OperationLog, 'id' | 'timestamp'>): OperationLog => {
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      timestamp: now()
    }
    logs.value.unshift(newLog)
    return newLog
  }

  const clearLogs = (): void => {
    logs.value = []
  }

  const logsByType = computed(() => {
    return (type: OperationType): OperationLog[] => {
      return logs.value.filter(log => log.operationType === type)
    }
  })

  const logsByProductId = computed(() => {
    return (productId: string): OperationLog[] => {
      return logs.value.filter(log => log.productId === productId)
    }
  })

  return {
    logs,
    addLog,
    clearLogs,
    logsByType,
    logsByProductId
  }
}
