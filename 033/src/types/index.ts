export type MedicineCategory = 'cold' | 'chronic' | 'vitamin' | 'external'

export const MedicineCategoryLabels: Record<MedicineCategory, string> = {
  cold: '感冒药',
  chronic: '慢性病药',
  vitamin: '维生素',
  external: '外用药'
}

export type StockStatus = 'sufficient' | 'expiring' | 'expired'

export const StockStatusLabels: Record<StockStatus, string> = {
  sufficient: '充足',
  expiring: '即将过期',
  expired: '已过期'
}

export interface Medicine {
  id: string
  name: string
  category: MedicineCategory
  manufacturer: string
  spec: string
  quantity: number
  unit: string
  expireDate: string
  createdAt: string
  updatedAt: string
}

export interface MedicineWithStatus extends Medicine {
  stockStatus: StockStatus
  daysUntilExpire: number
}

export type MedicationStatus = 'pending' | 'taken' | 'skipped' | 'missed'

export const MedicationStatusLabels: Record<MedicationStatus, string> = {
  pending: '待服用',
  taken: '已服用',
  skipped: '已跳过',
  missed: '已漏服'
}

export interface FamilyMember {
  id: string
  name: string
  relation: string
}

export interface MedicationReminder {
  id: string
  medicineId: string
  medicineName: string
  memberId: string
  memberName: string
  dosage: string
  scheduledTime: string
  status: MedicationStatus
  actualTime: string | null
  date: string
  createdAt: string
  updatedAt: string
}

export type ActionType = 'add' | 'update' | 'delete' | 'consume' | 'replenish' | 'mark_taken' | 'mark_skipped' | 'update_reminder'

export const ActionTypeLabels: Record<ActionType, string> = {
  add: '新增',
  update: '修改',
  delete: '删除',
  consume: '消耗',
  replenish: '补充',
  mark_taken: '标记服用',
  mark_skipped: '标记跳过',
  update_reminder: '修改提醒'
}

export interface OperationLog {
  id: string
  operatorId: string
  operatorName: string
  actionType: ActionType
  targetType: 'medicine' | 'reminder'
  targetId: string
  targetName: string
  description: string
  createdAt: string
}

export interface MedicineFilter {
  category?: MedicineCategory
  stockStatus?: StockStatus
  keyword?: string
}

export interface ReminderFilter {
  memberId?: string
  status?: MedicationStatus
  date?: string
  keyword?: string
}

export interface LogFilter {
  operatorName?: string
  actionType?: ActionType
  targetType?: 'medicine' | 'reminder'
  dateRange?: [string, string]
}
