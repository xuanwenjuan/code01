export interface Department {
  id: string
  name: string
  code: string
}

export interface Warehouse {
  id: string
  name: string
  location: string
}

export interface Employee {
  id: string
  name: string
  department: string
  position: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  success: boolean
}


