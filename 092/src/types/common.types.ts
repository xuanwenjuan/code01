export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export type OperationModule = 
  | 'category' 
  | 'equipment' 
  | 'order' 
  | 'user' 
  | 'auth' 
  | 'finance' 
  | 'maintenance';

export type OperationType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'confirm' 
  | 'cancel' 
  | 'outbound' 
  | 'return' 
  | 'complete' 
  | 'payment' 
  | 'scrap' 
  | 'maintenance'
  | 'login'
  | 'register'
  | 'changePassword';

export interface OperationLogData {
  module: OperationModule;
  operation: OperationType;
  recordId?: number;
  beforeData?: any;
  afterData?: any;
  changes?: string[];
}

export interface DamageCompensationRule {
  damageLevel: 'minor' | 'moderate' | 'severe' | 'total';
  percentage: number;
  description: string;
  minAmount?: number;
  maxAmount?: number;
}

export const DAMAGE_COMPENSATION_RULES: DamageCompensationRule[] = [
  {
    damageLevel: 'minor',
    percentage: 0.1,
    description: '轻微损坏，外观划痕',
    minAmount: 50,
  },
  {
    damageLevel: 'moderate',
    percentage: 0.3,
    description: '中度损坏，部分功能受影响',
    minAmount: 200,
  },
  {
    damageLevel: 'severe',
    percentage: 0.6,
    description: '严重损坏，需要大修',
    minAmount: 500,
  },
  {
    damageLevel: 'total',
    percentage: 1.0,
    description: '完全报废，无法修复',
    minAmount: 1000,
  },
];

export interface ScheduleConflict {
  equipmentId: number;
  equipmentName: string;
  assetNo: string;
  conflictOrders: {
    orderId: number;
    orderNo: string;
    startTime: Date;
    endTime: Date;
    status: string;
  }[];
}