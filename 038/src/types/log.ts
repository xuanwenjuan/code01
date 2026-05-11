export type OperationType = 'create' | 'update' | 'delete' | 'borrow' | 'return' | 'approve' | 'reject' | 'repair' | 'scrap' | 'adjust'

export const OPERATION_TYPE_MAP: Record<OperationType, string> = {
  create: '新增资产',
  update: '修改资产',
  delete: '删除资产',
  borrow: '领用申请',
  return: '归还资产',
  approve: '审批通过',
  reject: '审批拒绝',
  repair: '维修记录',
  scrap: '报废处理',
  adjust: '库存调整'
}

export const OPERATION_TYPE_TAG_TYPE: Record<OperationType, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  create: 'success',
  update: 'warning',
  delete: 'danger',
  borrow: 'info',
  return: 'info',
  approve: 'success',
  reject: 'danger',
  repair: 'warning',
  scrap: 'danger',
  adjust: 'primary'
}

export interface OperationLog {
  id: string
  operationType: OperationType
  operator: string
  targetId: string
  targetName: string
  targetType: 'asset' | 'borrow'
  operationTime: string
  beforeData?: string
  afterData?: string
  description: string
  remark?: string
}

export interface LogFilterParams {
  keyword?: string
  operationType?: OperationType | ''
  operator?: string
  targetType?: 'asset' | 'borrow' | ''
  startTime?: string
  endTime?: string
}
