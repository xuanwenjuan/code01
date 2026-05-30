export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    realName: string;
    role: string;
    phone?: string;
    email?: string;
  };
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ErrorResponse {
  code: number;
  message: string;
  errors?: any[];
  timestamp: number;
  path?: string;
}
