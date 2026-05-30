export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
}

export enum StaffStatus {
  ON_DUTY = 'on_duty',
  ON_LEAVE = 'on_leave',
  RESIGNED = 'resigned',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum BillingStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
  CANCELLED = 'cancelled',
}

export enum ProjectStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}

export interface JwtPayload {
  userId: number;
  role: UserRole;
  username: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
