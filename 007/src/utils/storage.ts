import { Department, Employee, LeaveRecord, OvertimeRecord, AttendanceRecord, OperationLog } from '../types';

const STORAGE_KEYS = {
  DEPARTMENTS: 'ems_departments',
  EMPLOYEES: 'ems_employees',
  LEAVE_RECORDS: 'ems_leave_records',
  OVERTIME_RECORDS: 'ems_overtime_records',
  ATTENDANCE_RECORDS: 'ems_attendance_records',
  OPERATION_LOGS: 'ems_operation_logs',
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

const defaultDepartments: Department[] = [
  { id: 'dept_001', name: '行政部', description: '负责公司行政事务管理', createdAt: new Date().toISOString() },
  { id: 'dept_002', name: '技术部', description: '负责产品研发和技术支持', createdAt: new Date().toISOString() },
  { id: 'dept_003', name: '市场部', description: '负责市场营销和客户拓展', createdAt: new Date().toISOString() },
  { id: 'dept_004', name: '财务部', description: '负责财务核算和资金管理', createdAt: new Date().toISOString() },
  { id: 'dept_005', name: '人力资源部', description: '负责招聘培训和员工关系', createdAt: new Date().toISOString() },
];

const defaultEmployees: Employee[] = [
  {
    id: generateId(),
    name: '张三',
    employeeNo: 'EMP001',
    departmentId: 'dept_002',
    joinYears: 3,
    positionLevel: 'P4',
    salaryLevel: 'S6',
    attendanceStatus: '正常',
    isResigned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: '李四',
    employeeNo: 'EMP002',
    departmentId: 'dept_002',
    joinYears: 5,
    positionLevel: 'M2',
    salaryLevel: 'S8',
    attendanceStatus: '正常',
    isResigned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: '王五',
    employeeNo: 'EMP003',
    departmentId: 'dept_001',
    joinYears: 1,
    positionLevel: 'P2',
    salaryLevel: 'S3',
    attendanceStatus: '正常',
    isResigned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const storageUtils = {
  generateId,
  
  getDepartments: (): Department[] => {
    const existing = getFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, []);
    if (existing.length === 0) {
      saveToStorage(STORAGE_KEYS.DEPARTMENTS, defaultDepartments);
      return defaultDepartments;
    }
    return existing;
  },
  saveDepartments: (data: Department[]) => saveToStorage(STORAGE_KEYS.DEPARTMENTS, data),

  getEmployees: (): Employee[] => {
    const existing = getFromStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    if (existing.length === 0) {
      saveToStorage(STORAGE_KEYS.EMPLOYEES, defaultEmployees);
      return defaultEmployees;
    }
    return existing;
  },
  saveEmployees: (data: Employee[]) => saveToStorage(STORAGE_KEYS.EMPLOYEES, data),

  getLeaveRecords: (): LeaveRecord[] => getFromStorage<LeaveRecord[]>(STORAGE_KEYS.LEAVE_RECORDS, []),
  saveLeaveRecords: (data: LeaveRecord[]) => saveToStorage(STORAGE_KEYS.LEAVE_RECORDS, data),

  getOvertimeRecords: (): OvertimeRecord[] => getFromStorage<OvertimeRecord[]>(STORAGE_KEYS.OVERTIME_RECORDS, []),
  saveOvertimeRecords: (data: OvertimeRecord[]) => saveToStorage(STORAGE_KEYS.OVERTIME_RECORDS, data),

  getAttendanceRecords: (): AttendanceRecord[] => getFromStorage<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_RECORDS, []),
  saveAttendanceRecords: (data: AttendanceRecord[]) => saveToStorage(STORAGE_KEYS.ATTENDANCE_RECORDS, data),

  getOperationLogs: (): OperationLog[] => getFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []),
  saveOperationLogs: (data: OperationLog[]) => saveToStorage(STORAGE_KEYS.OPERATION_LOGS, data),

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
