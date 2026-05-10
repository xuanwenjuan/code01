export interface Department {
  id: string
  name: string
  description: string
  parentId: string | null
  children?: Department[]
}

export type EmployeeStatus = 'active' | 'inactive'

export interface Employee {
  id: string
  name: string
  departmentId: string
  departmentName: string
  position: string
  phone: string
  email: string
  hireDate: string
  status: EmployeeStatus
  salary: number
  avatar: string
}

export type ApprovalType = 'leave' | 'overtime' | 'business'

export const ApprovalTypeMap: Record<ApprovalType, string> = {
  leave: '请假申请',
  overtime: '加班申请',
  business: '外出申请'
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export const ApprovalStatusMap: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
}

export const EmployeeStatusMap: Record<EmployeeStatus, string> = {
  active: '在职',
  inactive: '离职'
}

export interface Approval {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  departmentName: string
  type: ApprovalType
  title: string
  reason: string
  startTime: string
  endTime: string
  duration: number
  status: ApprovalStatus
  createTime: string
  updateTime: string
  approverId: string | null
  approverName: string | null
  comment: string | null
}

export type OperationType = 
  | '新增' 
  | '编辑' 
  | '删除' 
  | '调整部门' 
  | '修改薪资' 
  | '审批通过' 
  | '审批驳回'

export type TargetType = '员工' | '部门' | '审批单'

export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  operationType: OperationType
  targetType: TargetType
  targetId: string
  targetName: string
  description: string
  createTime: string
  ip: string
}

export interface FilterParams {
  departmentId?: string
  position?: string
  status?: string
  keyword?: string
  startTime?: string
  endTime?: string
  approvalType?: ApprovalType
  approvalStatus?: ApprovalStatus
}

export interface ApprovalDialogMode {
  CREATE: 'create'
  VIEW: 'view'
  APPROVE: 'approve'
  REJECT: 'reject'
}

export const ApprovalDialogModes: ApprovalDialogMode = {
  CREATE: 'create',
  VIEW: 'view',
  APPROVE: 'approve',
  REJECT: 'reject'
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  total?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number
  page: number
  pageSize: number
}

export interface EmployeeFormData extends Partial<Employee> {}

export interface ApprovalFormData extends Partial<Approval> {
  dateRange?: [string, string]
}
