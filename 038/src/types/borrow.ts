export type BorrowStatus = 'pending' | 'approved' | 'in_use' | 'returned' | 'rejected'

export type FormMode = 'create' | 'edit' | 'view'

export const BORROW_STATUS_MAP: Record<BorrowStatus, string> = {
  pending: '申请中',
  approved: '已审批',
  in_use: '已领用',
  returned: '已归还',
  rejected: '已拒绝'
}

export const BORROW_STATUS_TAG_TYPE: Record<BorrowStatus, 'warning' | 'info' | 'success' | 'primary' | 'danger'> = {
  pending: 'warning',
  approved: 'info',
  in_use: 'success',
  returned: 'primary',
  rejected: 'danger'
}

export interface StatusFlowStep {
  status: string
  time?: string
  active: boolean
  description: string
}

export interface BorrowRecord {
  id: string
  assetId: string
  assetName: string
  assetSerialNumber: string
  assetCategory: string
  assetPrice: number
  applicant: string
  applicantDepartment: string
  approver?: string
  applyDate: string
  approveDate?: string
  borrowDate?: string
  expectedReturnDate: string
  actualReturnDate?: string
  status: BorrowStatus
  purpose: string
  remark?: string
  rejectReason?: string
  isOverdue: boolean
  isHighValue: boolean
  overdueDays?: number
  createdAt: string
  updatedAt: string
}

export interface BorrowFormData {
  assetId: string
  applicant: string
  applicantDepartment: string
  expectedReturnDate: string
  purpose: string
  remark?: string
}

export interface ReturnFormData {
  actualReturnDate: string
  remark?: string
  condition?: 'good' | 'fair' | 'damaged'
}

export interface BorrowFilterParams {
  keyword?: string
  applicant?: string
  applicantDepartment?: string
  status?: BorrowStatus | ''
  assetCategory?: string
  isHighValue?: boolean | ''
  isOverdue?: boolean | ''
  startDate?: string
  endDate?: string
}

export interface BorrowStats {
  total: number
  pending: number
  inUse: number
  overdue: number
  highValue: number
  returned: number
}

export const BORROW_STATUS_FLOW: Record<BorrowStatus, BorrowStatus[]> = {
  pending: ['approved', 'rejected'],
  approved: ['in_use', 'rejected'],
  in_use: ['returned'],
  returned: [],
  rejected: []
}

export const canTransition = (from: BorrowStatus, to: BorrowStatus): boolean => {
  return BORROW_STATUS_FLOW[from]?.includes(to) ?? false
}
