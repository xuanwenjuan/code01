import type { OperationLog, OperationType, LogFilterParams } from '@/types/log'
import type { PaginatedResponse, PaginationParams } from '@/types/common'
import { mockLogs } from '@/mock/logs'
import dayjs from 'dayjs'

type LogListener = (log: OperationLog) => void

let logsData: OperationLog[] = [...mockLogs]
const listeners: LogListener[] = []

const delay = (ms: number = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))

const notifyListeners = (log: OperationLog): void => {
  listeners.forEach(listener => listener(log))
}

export const subscribeToLogs = (listener: LogListener): (() => void) => {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }
}

export const getLogList = async (
  params: PaginationParams & LogFilterParams
): Promise<PaginatedResponse<OperationLog>> => {
  await delay()
  
  let filtered: OperationLog[] = [...logsData]
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    filtered = filtered.filter(
      log =>
        log.targetName.toLowerCase().includes(keyword) ||
        log.operator.toLowerCase().includes(keyword) ||
        log.description.toLowerCase().includes(keyword)
    )
  }
  
  if (params.operationType) {
    filtered = filtered.filter(log => log.operationType === params.operationType)
  }
  
  if (params.operator) {
    filtered = filtered.filter(log => log.operator === params.operator)
  }
  
  if (params.targetType) {
    filtered = filtered.filter(log => log.targetType === params.targetType)
  }
  
  if (params.startTime) {
    filtered = filtered.filter(log => 
      new Date(log.operationTime) >= new Date(params.startTime)
    )
  }
  
  if (params.endTime) {
    filtered = filtered.filter(log => 
      new Date(log.operationTime) <= new Date(dayjs(params.endTime).endOf('day').toISOString())
    )
  }
  
  const start = (params.page - 1) * params.pageSize
  const end = start + params.pageSize
  const list: OperationLog[] = filtered.slice(start, end)
  
  return {
    list,
    total: filtered.length,
    page: params.page,
    pageSize: params.pageSize
  }
}

export const addOperationLog = async (
  operationType: OperationType,
  targetId: string,
  targetName: string,
  targetType: 'asset' | 'borrow',
  description: string,
  operator: string = '系统管理员',
  remark?: string,
  beforeData?: string,
  afterData?: string
): Promise<OperationLog> => {
  await delay()
  
  const newLog: OperationLog = {
    id: `log-${Date.now()}`,
    operationType,
    operator,
    targetId,
    targetName,
    targetType,
    operationTime: new Date().toISOString(),
    description,
    remark,
    beforeData,
    afterData
  }
  
  logsData.unshift(newLog)
  notifyListeners(newLog)
  
  return newLog
}

export const getLogById = async (id: string): Promise<OperationLog | undefined> => {
  await delay()
  return logsData.find(log => log.id === id)
}

export const getOperationTypes = (): OperationType[] => {
  return ['create', 'update', 'delete', 'borrow', 'return', 'approve', 'reject', 'repair', 'scrap', 'adjust']
}

export const getLogsByTarget = (targetId: string, targetType: 'asset' | 'borrow'): OperationLog[] => {
  return logsData.filter(log => log.targetId === targetId && log.targetType === targetType)
}

export const getOperationStats = (): Record<OperationType, number> => {
  const stats: Partial<Record<OperationType, number>> = {}
  logsData.forEach(log => {
    stats[log.operationType] = (stats[log.operationType] || 0) + 1
  })
  return stats as Record<OperationType, number>
}

export const clearAllLogs = (): void => {
  logsData = []
}
