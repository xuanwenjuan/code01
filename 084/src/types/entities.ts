import { Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password: string;
  realName?: string;
  phone?: string;
  role: string;
  status: string;
  lastLogin?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'status'>;

export interface CleanerAttributes {
  id: number;
  employeeNo: string;
  name: string;
  idCard: string;
  phone: string;
  workAreaId: number;
  workType: string;
  shiftType: string;
  status: string;
  qualifications?: string;
  hireDate: Date;
  contractExpiryDate: Date;
  contractReminded: boolean;
  userId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CleanerCreationAttributes = Optional<CleanerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'qualifications' | 'userId' | 'contractReminded'>;

export interface WorkAreaAttributes {
  id: number;
  name: string;
  areaType: string;
  parentId?: number;
  sort: number;
  status: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkAreaCreationAttributes = Optional<WorkAreaAttributes, 'id' | 'createdAt' | 'updatedAt' | 'parentId' | 'sort' | 'description' | 'status'>;

export interface WorkOrderAttributes {
  id: number;
  orderNo: string;
  title: string;
  description?: string;
  workAreaId: number;
  assignedTo?: number;
  assignedBy: number;
  status: string;
  priority: string;
  scheduledDate: Date;
  scheduledTime: Date;
  deadlineTime: Date;
  scheduleLocked: boolean;
  acceptedTime?: Date;
  startTime?: Date;
  reportTime?: Date;
  reportContent?: string;
  completedTime?: Date;
  reviewedTime?: Date;
  reviewedBy?: number;
  reviewComment?: string;
  reassignCount: number;
  autoReassign: boolean;
  completionNote?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkOrderCreationAttributes = Optional<WorkOrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'scheduleLocked' | 'reassignCount' | 'autoReassign' | 'acceptedTime' | 'startTime' | 'reportTime' | 'completedTime' | 'reviewedTime'>;

export interface PerformanceAttributes {
  id: number;
  cleanerId: number;
  workAreaId: number;
  year: number;
  month: number;
  totalOrders: number;
  completedOrders: number;
  reviewedOrders: number;
  cancelledOrders: number;
  timeoutOrders: number;
  completionRate: number;
  attendanceDays: number;
  violationPoints: number;
  performanceBonus: number;
  finalScore: number;
  calculatedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PerformanceCreationAttributes = Optional<PerformanceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'totalOrders' | 'completedOrders' | 'reviewedOrders' | 'cancelledOrders' | 'timeoutOrders' | 'completionRate' | 'attendanceDays' | 'violationPoints' | 'performanceBonus' | 'finalScore' | 'calculatedAt'>;

export interface OperationLogAttributes {
  id: number;
  module: string;
  operationType: string;
  recordId: number;
  recordName?: string;
  operatorId: number;
  operatorName: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OperationLogCreationAttributes = Optional<OperationLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'ipAddress' | 'userAgent'>;

export interface WorkOrderLogAttributes {
  id: number;
  workOrderId: number;
  action: string;
  oldStatus?: string;
  newStatus: string;
  operatorId?: number;
  cleanerId?: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkOrderLogCreationAttributes = Optional<WorkOrderLogAttributes, 'id' | 'createdAt' | 'updatedAt' | 'operatorId' | 'cleanerId' | 'remark' | 'oldStatus'>;

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  timestamp: number;
}
