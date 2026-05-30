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

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

export * from './entities';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DISPATCHER = 'dispatcher',
  AREA_MANAGER = 'area_manager',
  FINANCE = 'finance',
  WORKER = 'worker'
}

export enum WorkOrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  REPORTED = 'reported',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  REASSIGNED = 'reassigned',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum CleanerStatus {
  ON_DUTY = 'on_duty',
  LEAVE = 'leave',
  RESIGNED = 'resigned'
}

export enum WorkType {
  STREET = 'street',
  COMMUNITY = 'community',
  PARK = 'park',
  BUILDING = 'building'
}

export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  FULL_DAY = 'full_day'
}
