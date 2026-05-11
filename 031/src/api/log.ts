import request from './request'
import type { OperationLog, FilterOptions, PaginatedResponse } from '@/types'

interface GetLogsParams extends FilterOptions {
  page: number
  pageSize: number
}

const logApi = {
  getLogs: (params: GetLogsParams): Promise<PaginatedResponse<OperationLog>> => {
    const { dateRange, ...restParams } = params
    const queryParams: Record<string, number | string> = { ...restParams }
    if (dateRange && dateRange.length === 2) {
      queryParams.startDate = dateRange[0]
      queryParams.endDate = dateRange[1]
    }
    return request.get('/logs', { params: queryParams })
  },
  addLog: (log: OperationLog): Promise<OperationLog> => {
    return request.post('/logs', log)
  },
}

export default logApi
