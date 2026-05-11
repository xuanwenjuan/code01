import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OperationLog, LogFilterParams } from '@/types'
import { OperationType } from '@/types'
import { generateId } from '@/utils'
import { mockLogs } from '@/mock'

export interface AddLogParams {
  type: OperationType
  courseId?: string
  courseName?: string
  description: string
  detail: Record<string, unknown>
}

export const useLogStore = defineStore('log', () => {
  const logs = ref<OperationLog[]>([])
  
  const initializeLogs = (): void => {
    if (logs.value.length === 0) {
      logs.value = mockLogs
    }
  }
  
  const totalLogs = computed(() => logs.value.length)
  
  const addLog = (params: AddLogParams): void => {
    const log: OperationLog = {
      id: generateId(),
      type: params.type,
      courseId: params.courseId,
      courseName: params.courseName,
      description: params.description,
      detail: params.detail,
      createdAt: new Date().toISOString()
    }
    
    logs.value.unshift(log)
  }
  
  const filterLogs = (params: LogFilterParams): OperationLog[] => {
    return logs.value.filter(log => {
      if (params.type && log.type !== params.type) {
        return false
      }
      if (params.startTime) {
        const logTime = new Date(log.createdAt).getTime()
        const startTime = new Date(params.startTime).getTime()
        if (logTime < startTime) {
          return false
        }
      }
      if (params.endTime) {
        const logTime = new Date(log.createdAt).getTime()
        const endTime = new Date(params.endTime).getTime()
        if (logTime > endTime) {
          return false
        }
      }
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        const matchDescription = log.description.toLowerCase().includes(keyword)
        const matchCourseName = log.courseName?.toLowerCase().includes(keyword) ?? false
        if (!matchDescription && !matchCourseName) {
          return false
        }
      }
      return true
    })
  }
  
  const isCourseWarning = (courseId: string): boolean => {
    const courseLogs = logs.value.filter(
      log => log.courseId === courseId
    )
    
    if (courseLogs.length === 0) {
      return false
    }
    
    const latestCheckIn = courseLogs.find(log => 
      log.type === OperationType.CHECK_IN || log.type === OperationType.UPDATE_PROGRESS
    )
    
    if (!latestCheckIn) {
      return true
    }
    
    const daysSinceCheckIn = Math.floor(
      (Date.now() - new Date(latestCheckIn.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return daysSinceCheckIn >= 7
  }
  
  const getRecentActivity = (limit: number = 10): OperationLog[] => {
    return logs.value.slice(0, limit)
  }
  
  return {
    logs,
    totalLogs,
    initializeLogs,
    addLog,
    filterLogs,
    isCourseWarning,
    getRecentActivity
  }
}, {
  persist: {
    key: 'log-store',
    paths: ['logs']
  }
})
