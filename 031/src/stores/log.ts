import { defineStore } from 'pinia'
import type { OperationLog, FilterOptions, UserRole } from '@/types'
import logApi from '@/api/log'

interface LogState {
  logs: OperationLog[]
  total: number
  page: number
  pageSize: number
  loading: boolean
}

export const useLogStore = defineStore('log', {
  state: (): LogState => ({
    logs: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  persist: {
    key: 'gym-operation-logs',
    paths: ['logs'],
  },
  actions: {
    async fetchLogs(page = 1, pageSize = 10, filters: FilterOptions = {}) {
      this.loading = true
      this.page = page
      this.pageSize = pageSize
      try {
        const response = await logApi.getLogs({ page, pageSize, ...filters })
        this.logs = response.data
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
    async addLog(log: Omit<OperationLog, 'id' | 'operationTime'>) {
      const newLog: OperationLog = {
        ...log,
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operationTime: new Date().toISOString(),
      }
      const response = await logApi.addLog(newLog)
      this.logs.unshift(response)
      if (this.logs.length > this.total) {
        this.total += 1
      }
      return response
    },
  },
})

export function addOperationLog(
  log: Omit<OperationLog, 'id' | 'operatorId' | 'operatorName' | 'operatorRole' | 'operationTime'>
) {
  const user = window.currentUser
  const newLog: Omit<OperationLog, 'id' | 'operationTime'> = {
    ...log,
    operatorId: user.id,
    operatorName: user.name,
    operatorRole: user.role as UserRole,
  }
  const logStore = useLogStore()
  logStore.addLog(newLog)
}
