import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, OperationType, LogFilterParams } from '@/types'
import { generateId, formatDateTime } from '@/utils'

export const useLogStore = defineStore(
  'log',
  () => {
    const logs = ref<OperationLog[]>([])
    const loading = ref(false)

    const totalLogs = computed(() => logs.value.length)

    const fetchLogs = async (): Promise<void> => {
      loading.value = true
      try {
        const response = await fetch('/api/logs')
        const result = await response.json()
        if (result.code === 200) {
          const fetchedLogs = result.data as OperationLog[]
          const existingIds = new Set(logs.value.map((l) => l.id))
          const newLogs = fetchedLogs.filter((l) => !existingIds.has(l.id))
          logs.value = [...newLogs, ...logs.value]
        }
      } finally {
        loading.value = false
      }
    }

    const addLog = (logData: Omit<OperationLog, 'id' | 'timestamp'>): OperationLog => {
      const newLog: OperationLog = {
        ...logData,
        id: generateId(),
        timestamp: formatDateTime(new Date())
      }

      logs.value.unshift(newLog)
      return newLog
    }

    const filterLogs = (params: LogFilterParams): OperationLog[] => {
      return logs.value.filter((log: OperationLog) => {
        if (params.keyword) {
          const keyword: string = params.keyword.toLowerCase()
          const matchContent: boolean = log.content.toLowerCase().includes(keyword)
          const matchTripName: boolean = log.tripName?.toLowerCase().includes(keyword) ?? false
          if (!matchContent && !matchTripName) return false
        }

        if (params.type && log.type !== params.type) return false

        if (params.dateStart && log.timestamp < params.dateStart) return false
        if (params.dateEnd && log.timestamp > `${params.dateEnd} 23:59:59`) return false

        return true
      })
    }

    const getLogTypes = (): { value: OperationType; label: string }[] => {
      return [
        { value: 'create_trip', label: '创建行程' },
        { value: 'update_trip', label: '修改行程' },
        { value: 'delete_trip', label: '删除行程' },
        { value: 'add_checkin', label: '添加打卡' },
        { value: 'update_checkin', label: '更新打卡状态' },
        { value: 'add_expense', label: '添加花费' },
        { value: 'update_budget', label: '调整预算' }
      ]
    }

    const clearLogs = (): void => {
      logs.value = []
    }

    return {
      logs,
      loading,
      totalLogs,
      fetchLogs,
      addLog,
      filterLogs,
      getLogTypes,
      clearLogs
    }
  },
  {
    persist: {
      key: 'log-store',
      paths: ['logs']
    }
  }
)
