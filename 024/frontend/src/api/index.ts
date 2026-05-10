import request from './request'
import type {
  Category,
  Product,
  InventoryRecord,
  OperationLog,
  ProductFilters,
  InventoryFilters,
  LogFilters,
  PaginationParams,
  ProductStats,
  InventoryStats,
  LogStats,
  InboundFormData,
  SaleFormData,
  OfflineFormData,
  ApiResponse
} from '@/types'

interface CategoryListResponse {
  data: Category[]
  flat: Category[]
}

export const categoryApi = {
  getList(): Promise<ApiResponse<CategoryListResponse>> {
    return request.get<ApiResponse<CategoryListResponse>>('/categories')
  },
  create(data: Partial<Category>): Promise<ApiResponse<Category>> {
    return request.post<ApiResponse<Category>>('/categories', data)
  },
  update(id: number, data: Partial<Category>): Promise<ApiResponse<void>> {
    return request.put<ApiResponse<void>>(`/categories/${id}`, data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete<ApiResponse<void>>(`/categories/${id}`)
  }
}

export const productApi = {
  getList(params: ProductFilters & PaginationParams): Promise<ApiResponse<Product[]>> {
    return request.get<ApiResponse<Product[]>>('/products', { params })
  },
  getStats(): Promise<ApiResponse<ProductStats>> {
    return request.get<ApiResponse<ProductStats>>('/products/stats')
  },
  getById(id: number): Promise<ApiResponse<Product>> {
    return request.get<ApiResponse<Product>>(`/products/${id}`)
  },
  create(data: Partial<Product>): Promise<ApiResponse<{ id: number }>> {
    return request.post<ApiResponse<{ id: number }>>('/products', data)
  },
  update(id: number, data: Partial<Product>): Promise<ApiResponse<void>> {
    return request.put<ApiResponse<void>>(`/products/${id}`, data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete<ApiResponse<void>>(`/products/${id}`)
  }
}

export const inventoryApi = {
  inbound(data: InboundFormData): Promise<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>> {
    return request.post<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>>('/inventory/inbound', data)
  },
  sale(data: SaleFormData): Promise<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>> {
    return request.post<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>>('/inventory/sale', data)
  },
  offline(data: OfflineFormData): Promise<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>> {
    return request.post<ApiResponse<{ id: number; product_id: number; quantity: number; new_stock: number }>>('/inventory/offline', data)
  },
  getRecords(params: InventoryFilters & PaginationParams): Promise<ApiResponse<InventoryRecord[]>> {
    return request.get<ApiResponse<InventoryRecord[]>>('/inventory/records', { params })
  },
  getStats(params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<InventoryStats>> {
    return request.get<ApiResponse<InventoryStats>>('/inventory/stats', { params })
  }
}

export const logApi = {
  getList(params: LogFilters & PaginationParams): Promise<ApiResponse<OperationLog[]>> {
    return request.get<ApiResponse<OperationLog[]>>('/operation-logs', { params })
  },
  getStats(): Promise<ApiResponse<LogStats>> {
    return request.get<ApiResponse<LogStats>>('/operation-logs/stats')
  }
}
