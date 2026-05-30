export enum EquipmentStatus {
  NORMAL = 'normal',
  FAULT = 'fault',
  SCRAPPED = 'scrapped',
}

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXCEPTION = 'exception',
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ACCEPTED = 'accepted',
  CLOSED = 'closed',
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  INSPECTOR = 'inspector',
  MAINTENANCE = 'maintenance',
  USER = 'user',
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
