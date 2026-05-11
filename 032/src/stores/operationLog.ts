import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, OperationLogFilter, OperationType, User, LogExtraData } from '@/types'
import { mockOperationLogs, mockUser } from '@/mock'
import dayjs from 'dayjs'

export const useOperationLogStore = defineStore(
  'operationLog',
  () => {
    const logs = ref<OperationLog[]>([...mockOperationLogs])
    const currentUser = ref<User>(mockUser)

    const logList = computed(() => logs.value)

    const recentLogs = computed(() => logs.value.slice(0, 10))

    function getLogById(id: string): OperationLog | undefined {
      return logs.value.find((log) => log.id === id)
    }

    function getLogsByOperator(operatorId: string): OperationLog[] {
      return logs.value.filter((log) => log.operatorId === operatorId)
    }

    function getLogsByType(type: OperationType): OperationLog[] {
      return logs.value.filter((log) => log.operationType === type)
    }

    function getLogsByTarget(targetId: string): OperationLog[] {
      return logs.value.filter((log) => log.targetId === targetId)
    }

    function filterLogs(filter: OperationLogFilter): OperationLog[] {
      return logs.value.filter((log) => {
        if (filter.operatorId && log.operatorId !== filter.operatorId) {
          return false
        }
        if (filter.operationType && log.operationType !== filter.operationType) {
          return false
        }
        if (filter.startDate && dayjs(log.createdAt).isBefore(dayjs(filter.startDate))) {
          return false
        }
        if (filter.endDate && dayjs(log.createdAt).isAfter(dayjs(filter.endDate).endOf('day'))) {
          return false
        }
        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase()
          const operatorName = log.operatorName.toLowerCase()
          const targetName = log.targetName.toLowerCase()
          const details = log.details.toLowerCase()
          if (
            !operatorName.includes(keyword) &&
            !targetName.includes(keyword) &&
            !details.includes(keyword)
          ) {
            return false
          }
        }
        return true
      })
    }

    function addLog(log: OperationLog): void {
      logs.value.unshift(log)
    }

    function recordOperation(
      operationType: OperationType,
      targetId: string,
      targetName: string,
      details: string,
      extraData?: LogExtraData
    ): void {
      const log: OperationLog = {
        id: crypto.randomUUID(),
        operatorId: currentUser.value.id,
        operatorName: currentUser.value.name,
        operatorRole: currentUser.value.role,
        operationType,
        targetId,
        targetName,
        details,
        extraData,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
      addLog(log)
    }

    function clearLogs(): void {
      logs.value = [...mockOperationLogs]
    }

    return {
      logs,
      currentUser,
      logList,
      recentLogs,
      getLogById,
      getLogsByOperator,
      getLogsByType,
      getLogsByTarget,
      filterLogs,
      addLog,
      recordOperation,
      clearLogs
    }
  },
  {
    persist: true
  }
)
