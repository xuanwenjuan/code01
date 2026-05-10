import type { Category, Product, InventoryRecord, OperationLog, FilterParams, PaginationParams, PaginatedResponse, ApiResponse, InventoryOperationType, StockStats } from '@/types'

const BASE_URL = '/api'

async function request<T>(url: string, method: string, data?: unknown): Promise<T> {
  const response = await fetch(BASE_URL + url, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : undefined
  })
  const result = await response.json() as ApiResponse<T>
  if (result.code === 200) {
    return result.data
  }
  throw new Error(result.message)
}

export const categoryApi = {
  getList: (): Promise<Category[]> => request('/categories', 'GET'),
  add: (data: Omit<Category, 'id' | 'createTime' | 'updateTime'>): Promise<Category> =>
    request('/categories/add', 'POST', data),
  edit: (data: Category): Promise<Category> => request('/categories/edit', 'POST', data),
  delete: (id: string): Promise<boolean> => request('/categories/delete', 'POST', { id })
}

export const productApi = {
  getList: (filterParams: FilterParams, pagination: PaginationParams): Promise<PaginatedResponse<Product>> =>
    request('/products/list', 'POST', { filterParams, pagination }),
  add: (data: Omit<Product, 'id' | 'createTime' | 'updateTime' | 'status'>): Promise<Product> =>
    request('/products/add', 'POST', data),
  edit: (data: Product): Promise<Product> => request('/products/edit', 'POST', data),
  delete: (id: string): Promise<boolean> => request('/products/delete', 'POST', { id })
}

export const inventoryApi = {
  getRecords: (params: {
    pagination: PaginationParams
    productId?: string
    operationType?: string
    startTime?: string
    endTime?: string
  }): Promise<PaginatedResponse<InventoryRecord>> =>
    request('/inventory/records', 'POST', params),
  operation: (data: {
    productId: string
    operationType: InventoryOperationType
    quantity: number
    operator: string
    remark: string
  }): Promise<InventoryRecord> =>
    request('/inventory/operation', 'POST', data)
}

export const logApi = {
  getList: (params: {
    pagination: PaginationParams
    operator?: string
    operationType?: string
    startTime?: string
    endTime?: string
  }): Promise<PaginatedResponse<OperationLog>> =>
    request('/logs/list', 'POST', params),
  add: (data: Omit<OperationLog, 'id' | 'createTime'>): Promise<OperationLog> =>
    request('/logs/add', 'POST', data)
}

export const statsApi = {
  getStats: (): Promise<StockStats> => request('/stats', 'GET')
}
