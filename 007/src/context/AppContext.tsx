import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import {
  Department,
  Employee,
  LeaveRecord,
  OvertimeRecord,
  AttendanceRecord,
  OperationLog,
  OperationType,
  AttendanceStatus,
  LeaveStatus,
} from '../types';
import { storageUtils } from '../utils/storage';

interface AppState {
  departments: Department[];
  employees: Employee[];
  leaveRecords: LeaveRecord[];
  overtimeRecords: OvertimeRecord[];
  attendanceRecords: AttendanceRecord[];
  operationLogs: OperationLog[];
  currentOperator: string;
}

type Action =
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: Department }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'UPDATE_EMPLOYEE_STATUS'; payload: { employeeId: string; attendanceStatus: AttendanceStatus } }
  | { type: 'DELETE_EMPLOYEE'; payload: string }
  | { type: 'ADD_LEAVE_RECORD'; payload: LeaveRecord }
  | { type: 'UPDATE_LEAVE_STATUS'; payload: { id: string; status: LeaveStatus } }
  | { type: 'ADD_OVERTIME_RECORD'; payload: OvertimeRecord }
  | { type: 'ADD_ATTENDANCE_RECORD'; payload: AttendanceRecord }
  | { type: 'UPDATE_ATTENDANCE_RECORD'; payload: AttendanceRecord }
  | { type: 'ADD_OPERATION_LOG'; payload: OperationLog };

const initialState: AppState = {
  departments: [],
  employees: [],
  leaveRecords: [],
  overtimeRecords: [],
  attendanceRecords: [],
  operationLogs: [],
  currentOperator: '系统管理员',
};

const isValidStatusTransition = (
  from: AttendanceStatus,
  to: AttendanceStatus,
  isResigned: boolean
): boolean => {
  if (from === '离职') return false;
  if (isResigned && to !== '离职') return false;
  if (to === '离职') return true;

  const transitions: Record<AttendanceStatus, AttendanceStatus[]> = {
    '正常': ['迟到', '早退', '旷工', '请假', '加班', '正常', '离职'],
    '迟到': ['正常', '请假', '加班', '离职'],
    '早退': ['正常', '请假', '加班', '离职'],
    '旷工': ['正常', '请假', '加班', '离职'],
    '请假': ['正常', '离职'],
    '加班': ['正常', '请假', '离职'],
    '离职': [],
  };

  return transitions[from].includes(to);
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'ADD_DEPARTMENT':
      return { ...state, departments: [...state.departments, action.payload] };
    case 'UPDATE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      };
    case 'DELETE_DEPARTMENT':
      return {
        ...state,
        departments: state.departments.filter((d) => d.id !== action.payload),
      };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'UPDATE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'UPDATE_EMPLOYEE_STATUS':
      return {
        ...state,
        employees: state.employees.map((e) => {
          if (e.id !== action.payload.employeeId) return e;
          const isValid = isValidStatusTransition(
            e.attendanceStatus,
            action.payload.attendanceStatus,
            e.isResigned
          );
          if (!isValid) return e;
          return {
            ...e,
            attendanceStatus: action.payload.attendanceStatus,
            updatedAt: new Date().toISOString(),
          };
        }),
      };
    case 'DELETE_EMPLOYEE':
      return {
        ...state,
        employees: state.employees.filter((e) => e.id !== action.payload),
      };
    case 'ADD_LEAVE_RECORD':
      return { ...state, leaveRecords: [...state.leaveRecords, action.payload] };
    case 'UPDATE_LEAVE_STATUS':
      return {
        ...state,
        leaveRecords: state.leaveRecords.map((l) =>
          l.id === action.payload.id ? { ...l, status: action.payload.status } : l
        ),
      };
    case 'ADD_OVERTIME_RECORD':
      return { ...state, overtimeRecords: [...state.overtimeRecords, action.payload] };
    case 'ADD_ATTENDANCE_RECORD':
      return { ...state, attendanceRecords: [...state.attendanceRecords, action.payload] };
    case 'UPDATE_ATTENDANCE_RECORD':
      return {
        ...state,
        attendanceRecords: state.attendanceRecords.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
    case 'ADD_OPERATION_LOG':
      return { ...state, operationLogs: [action.payload, ...state.operationLogs] };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addOperationLog: (
    content: string,
    operationType: OperationType,
    employeeId?: string
  ) => void;
  getDepartmentName: (departmentId: string) => string;
  getEmployeeName: (employeeId: string) => string;
  findEmployee: (employeeId: string) => Employee | undefined;
  updateEmployeeAttendanceStatus: (
    employeeId: string,
    newStatus: AttendanceStatus
  ) => boolean;
  findAttendanceRecord: (
    employeeId: string,
    date: string
  ) => AttendanceRecord | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({
      type: 'SET_STATE',
      payload: {
        departments: storageUtils.getDepartments(),
        employees: storageUtils.getEmployees(),
        leaveRecords: storageUtils.getLeaveRecords(),
        overtimeRecords: storageUtils.getOvertimeRecords(),
        attendanceRecords: storageUtils.getAttendanceRecords(),
        operationLogs: storageUtils.getOperationLogs(),
      },
    });
  }, []);

  useEffect(() => {
    if (state.departments.length > 0) storageUtils.saveDepartments(state.departments);
  }, [state.departments]);

  useEffect(() => {
    if (state.employees.length > 0 || localStorage.getItem('ems_employees')) {
      storageUtils.saveEmployees(state.employees);
    }
  }, [state.employees]);

  useEffect(() => {
    storageUtils.saveLeaveRecords(state.leaveRecords);
  }, [state.leaveRecords]);

  useEffect(() => {
    storageUtils.saveOvertimeRecords(state.overtimeRecords);
  }, [state.overtimeRecords]);

  useEffect(() => {
    storageUtils.saveAttendanceRecords(state.attendanceRecords);
  }, [state.attendanceRecords]);

  useEffect(() => {
    storageUtils.saveOperationLogs(state.operationLogs);
  }, [state.operationLogs]);

  const addOperationLog = useCallback(
    (content: string, operationType: OperationType, employeeId?: string) => {
      const log: OperationLog = {
        id: storageUtils.generateId(),
        operationTime: new Date().toISOString(),
        operator: state.currentOperator,
        content,
        employeeId: employeeId || null,
        operationType,
      };
      dispatch({ type: 'ADD_OPERATION_LOG', payload: log });
    },
    [state.currentOperator]
  );

  const getDepartmentName = useCallback(
    (departmentId: string) => {
      const dept = state.departments.find((d) => d.id === departmentId);
      return dept ? dept.name : '未知部门';
    },
    [state.departments]
  );

  const getEmployeeName = useCallback(
    (employeeId: string) => {
      const emp = state.employees.find((e) => e.id === employeeId);
      return emp ? emp.name : '未知员工';
    },
    [state.employees]
  );

  const findEmployee = useCallback(
    (employeeId: string) => {
      return state.employees.find((e) => e.id === employeeId);
    },
    [state.employees]
  );

  const updateEmployeeAttendanceStatus = useCallback(
    (employeeId: string, newStatus: AttendanceStatus): boolean => {
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) return false;

      const isValid = isValidStatusTransition(
        employee.attendanceStatus,
        newStatus,
        employee.isResigned
      );

      if (!isValid) return false;

      dispatch({
        type: 'UPDATE_EMPLOYEE_STATUS',
        payload: { employeeId, attendanceStatus: newStatus },
      });
      return true;
    },
    [state.employees]
  );

  const findAttendanceRecord = useCallback(
    (employeeId: string, date: string) => {
      return state.attendanceRecords.find(
        (r) => r.employeeId === employeeId && r.date === date
      );
    },
    [state.attendanceRecords]
  );

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addOperationLog,
        getDepartmentName,
        getEmployeeName,
        findEmployee,
        updateEmployeeAttendanceStatus,
        findAttendanceRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
