export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OperationLogData {
  module: string;
  operation: string;
  userId?: number;
  username?: string;
  description: string;
  details?: any;
  ip?: string;
}

export type StatusType = 'active' | 'inactive' | 'closed';
