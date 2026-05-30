import { EmployeeStatus } from '../models/Employee';
import { UserRole } from '../models/User';
import { AttendanceStatus, AttendanceType } from '../models/Attendance';
import { PerformanceLevel } from '../models/Performance';
import { MakeupCardStatus } from '../models/MakeupCard';
import { LeaveStatus, LeaveType } from '../models/LeaveRequest';

export {
  EmployeeStatus,
  UserRole,
  AttendanceStatus,
  AttendanceType,
  PerformanceLevel,
  MakeupCardStatus,
  LeaveStatus,
  LeaveType,
};

export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  success: boolean;
  timestamp: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  employeeId?: number;
  tokenVersion?: number;
}

export interface EmployeeDTO {
  id: number;
  employeeNo: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: Date;
  idCardNo?: string;
  phone: string;
  email?: string;
  address?: string;
  departmentId: number;
  department?: {
    id: number;
    name: string;
    code?: string;
  };
  position: string;
  baseSalary: number;
  hireDate: Date;
  confirmationDate?: Date;
  resignationDate?: Date;
  status: EmployeeStatus;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeDTO {
  employeeNo: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: Date;
  idCardNo?: string;
  phone: string;
  email?: string;
  address?: string;
  departmentId: number;
  position: string;
  baseSalary: number;
  hireDate: Date;
  status?: EmployeeStatus;
  remark?: string;
}

export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {}

export interface AttendanceDTO {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  date: Date;
  type: AttendanceType;
  time: Date;
  status: AttendanceStatus;
  latitude?: number;
  longitude?: number;
  location?: string;
  device?: string;
  ip?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClockInDTO {
  latitude?: number;
  longitude?: number;
  location?: string;
  device?: string;
  ip?: string;
}

export interface AttendanceJudgmentDTO {
  status: AttendanceStatus;
  lateLevel?: string;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  workHours?: number;
  isAbsent: boolean;
  deductionAmount: number;
  judgmentReason?: string;
}

export interface LeaveRequestDTO {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approverId?: number;
  approver?: {
    id: number;
    name: string;
  };
  approvalRemark?: string;
  approvalTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeaveRequestDTO {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
}

export interface MakeupCardDTO {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  attendanceDate: Date;
  type: AttendanceType;
  makeupTime: Date;
  reason: string;
  status: MakeupCardStatus;
  approverId?: number;
  approver?: {
    id: number;
    name: string;
  };
  approvalRemark?: string;
  approvalTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMakeupCardDTO {
  attendanceDate: Date;
  type: AttendanceType;
  makeupTime: Date;
  reason: string;
}

export interface PerformanceDTO {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  year: number;
  month: number;
  level: PerformanceLevel;
  score?: number;
  bonusAmount?: number;
  evaluatorId?: number;
  evaluator?: {
    id: number;
    name: string;
  };
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePerformanceDTO {
  employeeId: number;
  year: number;
  month: number;
  level: PerformanceLevel;
  score?: number;
  bonusAmount?: number;
  comment?: string;
}

export interface SalaryDTO {
  id: number;
  employeeId: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  departmentId: number;
  department?: {
    id: number;
    name: string;
  };
  year: number;
  month: number;
  baseSalary: number;
  performanceBonus: number;
  attendanceBonus: number;
  otherAllowance: number;
  lateDeduction: number;
  earlyLeaveDeduction: number;
  absentDeduction: number;
  socialSecurity: number;
  housingFund: number;
  personalIncomeTax: number;
  otherDeduction: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  isPaid: boolean;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalaryCalculationDetailsDTO {
  employee: {
    id: number;
    name: string;
    employeeNo: string;
    baseSalary: number;
  };
  attendanceStats: {
    lateLevel1Days: number;
    lateLevel2Days: number;
    lateLevel3Days: number;
    earlyLeaveLevel1Days: number;
    earlyLeaveLevel2Days: number;
    earlyLeaveLevel3Days: number;
    absentDays: number;
    leaveDays: number;
    normalDays: number;
    totalWorkDays: number;
    lateTotalDeduction: number;
    earlyLeaveTotalDeduction: number;
    absentTotalDeduction: number;
    totalAttendanceDeduction: number;
    isFullAttendance: boolean;
  };
  performance: {
    level: PerformanceLevel;
    bonusAmount: number;
    hasPerformanceData: boolean;
  };
  earnings: {
    baseSalary: number;
    performanceBonus: number;
    attendanceBonus: number;
    totalEarnings: number;
  };
  deductions: {
    lateDeduction: number;
    earlyLeaveDeduction: number;
    absentDeduction: number;
    socialSecurity: number;
    housingFund: number;
    personalIncomeTax: number;
    totalDeductions: number;
  };
  netSalary: number;
}

export interface DepartmentDTO {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  parent?: {
    id: number;
    name: string;
  };
  children?: DepartmentDTO[];
  level: number;
  isActive: boolean;
  sortOrder: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  parentId?: number;
  level?: number;
  isActive?: boolean;
  sortOrder?: number;
  remark?: string;
}

export interface UpdateDepartmentDTO extends Partial<CreateDepartmentDTO> {}

export interface UserDTO {
  id: number;
  username: string;
  role: UserRole;
  employeeId?: number;
  employee?: {
    id: number;
    name: string;
    employeeNo: string;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDTO;
}

export interface EmployeeHistoryDTO {
  id: number;
  employeeId: number;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  operatorId: number;
  operator?: {
    id: number;
    name: string;
  };
  remark?: string;
  createdAt: Date;
}

export interface AttendanceStatsDTO {
  totalDays: number;
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  leaveDays: number;
  totalWorkHours: number;
  totalDeduction: number;
  attendanceRate: number;
}

export interface MonthlyAttendanceReportDTO {
  employee: {
    id: number;
    name: string;
    employeeNo: string;
  };
  totalDays: number;
  normalDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  absentDays: number;
  leaveDays: number;
}

export interface PerformanceStatsDTO {
  totalEmployees: number;
  levelCounts: Record<PerformanceLevel, number>;
  totalBonus: number;
  averageBonus: number;
  averageScore?: number;
}

export interface SalaryStatsDTO {
  totalEmployees: number;
  totalBaseSalary: number;
  totalPerformanceBonus: number;
  totalAttendanceBonus: number;
  totalOtherAllowance: number;
  totalEarnings: number;
  totalDeductions: number;
  totalNetSalary: number;
  paidCount: number;
  unpaidCount: number;
  avgSalary: number;
  maxSalary: number;
  minSalary: number;
}

export interface OperationLogDTO {
  id: number;
  userId: number;
  username: string;
  action: string;
  resource: string;
  resourceId?: number;
  ip?: string;
  userAgent?: string;
  detail?: string;
  createdAt: Date;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EmployeeQueryParams extends QueryParams {
  departmentId?: number;
  status?: EmployeeStatus;
}

export interface AttendanceQueryParams extends QueryParams {
  employeeId?: number;
  departmentId?: number;
  status?: AttendanceStatus;
  type?: AttendanceType;
}

export interface LeaveQueryParams extends QueryParams {
  employeeId?: number;
  status?: LeaveStatus;
  type?: LeaveType;
}

export interface PerformanceQueryParams extends QueryParams {
  employeeId?: number;
  departmentId?: number;
  year?: number;
  month?: number;
  level?: PerformanceLevel;
}

export interface SalaryQueryParams extends QueryParams {
  employeeId?: number;
  departmentId?: number;
  year?: number;
  month?: number;
  isPaid?: boolean;
}

export interface DepartmentQueryParams extends QueryParams {
  parentId?: number;
  isActive?: boolean;
}
