export type DepartmentName = '行政部' | '技术部' | '市场部' | '财务部' | '人力资源部';

export type PositionLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export type SalaryLevel = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10';

export type AttendanceStatus = '正常' | '迟到' | '早退' | '旷工' | '请假' | '加班' | '离职';

export type OperationType = '打卡' | '请假' | '离职' | '加班' | '新增员工' | '编辑员工' | '删除员工' | '新增部门' | '编辑部门' | '删除部门';

export type LeaveType = '事假' | '病假' | '年假' | '婚假' | '产假';

export type LeaveStatus = '待审批' | '已批准' | '已拒绝';

export type CheckInStatus = '正常' | '迟到' | '早退' | '旷工';

export interface Department {
  id: string;
  name: DepartmentName | string;
  description: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  employeeNo: string;
  departmentId: string;
  joinYears: number;
  positionLevel: PositionLevel;
  salaryLevel: SalaryLevel;
  attendanceStatus: AttendanceStatus;
  isResigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface OvertimeRecord {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  reason: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: CheckInStatus;
  createdAt: string;
}

export interface OperationLog {
  id: string;
  operationTime: string;
  operator: string;
  content: string;
  employeeId: string | null;
  operationType: OperationType;
}

export interface FilterParams {
  departmentId: string | null;
  joinYearsMin: number | null;
  joinYearsMax: number | null;
  positionLevel: PositionLevel | null;
  attendanceStatus: AttendanceStatus | null;
  isResigned: boolean | null;
}

export type EmployeeStatusTransition =
  | { from: '正常'; to: '迟到' | '请假' | '加班' | '离职' }
  | { from: '迟到'; to: '正常' | '请假' | '加班' | '离职' }
  | { from: '早退'; to: '正常' | '请假' | '加班' | '离职' }
  | { from: '旷工'; to: '正常' | '请假' | '加班' | '离职' }
  | { from: '请假'; to: '正常' | '离职' }
  | { from: '加班'; to: '正常' | '请假' | '离职' }
  | { from: '离职'; to: never };
