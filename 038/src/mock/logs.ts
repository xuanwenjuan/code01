import type { OperationLog, OperationType } from '@/types/log'
import { mockAssets } from './assets'
import { mockBorrows } from './borrows'
import { employees } from './baseData'

const operationTypes: OperationType[] = ['create', 'update', 'delete', 'borrow', 'return', 'approve', 'reject', 'repair', 'scrap', 'adjust']

const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const randomDate = (startYear: number = 2023): string => {
  const start = new Date(startYear, 0, 1)
  const end = new Date()
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString()
}

const descriptions: Record<OperationType, string[]> = {
  create: ['新增资产入库', '新增设备登记', '新设备录入系统'],
  update: ['修改资产信息', '更新设备状态', '调整资产归属'],
  delete: ['删除报废资产', '移除冗余记录'],
  borrow: ['提交领用申请', '申请设备领用', '发起借用流程'],
  return: ['归还领用设备', '办理设备归还', '资产归库'],
  approve: ['审批通过领用申请', '同意借用申请', '领用审批通过'],
  reject: ['拒绝领用申请', '驳回借用申请', '审批不通过'],
  repair: ['记录设备维修', '维修状态更新', '设备送修登记'],
  scrap: ['报废设备处理', '资产报废登记', '设备淘汰处理'],
  adjust: ['调整库存数量', '盘点库存差异', '库存修正']
}

const generateLog = (index: number): OperationLog => {
  const type = randomPick(operationTypes)
  const operator = randomPick(employees).name
  const isAssetType = type === 'create' || type === 'update' || type === 'delete' || type === 'repair' || type === 'scrap' || type === 'adjust'
  const targetType = isAssetType ? 'asset' : 'borrow'
  
  let targetId: string
  let targetName: string

  if (targetType === 'asset') {
    const asset = randomPick(mockAssets)
    targetId = asset.id
    targetName = asset.name
  } else {
    const borrow = randomPick(mockBorrows)
    targetId = borrow.id
    targetName = `${borrow.applicant}-${borrow.assetName}`
  }

  return {
    id: `log-${index + 1}`,
    operationType: type,
    operator,
    targetId,
    targetName,
    targetType,
    operationTime: randomDate(2023),
    description: randomPick(descriptions[type]),
    remark: Math.random() > 0.7 ? '操作正常' : undefined
  }
}

export const mockLogs: OperationLog[] = Array.from({ length: 100 }, (_, i) => generateLog(i)).sort(
  (a, b) => new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
)
