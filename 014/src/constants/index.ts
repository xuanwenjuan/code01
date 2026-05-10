import type { CategoryType, ProcessLevel, OperationType } from '@/types'

export const DEFAULT_CATEGORIES: { code: CategoryType; name: string; description: string }[] = [
  { code: 'ornament', name: '摆件类', description: '各类装饰摆件产品' },
  { code: 'stationery', name: '文具类', description: '办公学习文具用品' },
  { code: 'clothing', name: '服饰类', description: '服装配饰类产品' },
  { code: 'decoration', name: '装饰类', description: '家居装饰用品' },
  { code: 'gift', name: '礼盒类', description: '礼品礼盒套装' }
]

export const CATEGORY_NAMES: Record<CategoryType, string> = {
  ornament: '摆件类',
  stationery: '文具类',
  clothing: '服饰类',
  decoration: '装饰类',
  gift: '礼盒类'
}

export const PROCESS_LEVELS: { value: ProcessLevel; label: string }[] = [
  { value: 'A', label: 'A级（顶级工艺）' },
  { value: 'B', label: 'B级（高级工艺）' },
  { value: 'C', label: 'C级（标准工艺）' }
]

export const PROCESS_LEVEL_NAMES: Record<ProcessLevel, string> = {
  A: 'A级（顶级工艺）',
  B: 'B级（高级工艺）',
  C: 'C级（标准工艺）'
}

export const OPERATION_TYPES: { value: OperationType; label: string }[] = [
  { value: 'inbound', label: '入库登记' },
  { value: 'outbound', label: '出库售卖' },
  { value: 'expired_offline', label: '临期下架' }
]

export const OPERATION_TYPE_NAMES: Record<OperationType, string> = {
  inbound: '入库登记',
  outbound: '出库售卖',
  expired_offline: '临期下架'
}

export const NEEDS_SHELF_LIFE: CategoryType[] = ['stationery', 'clothing']

export const HIGH_PROCESS_LEVELS: ProcessLevel[] = ['A', 'B']

export const EXPIRY_WARNING_DAYS = 30

export const STORAGE_KEYS = {
  CATEGORIES: 'cultural_products_categories',
  PRODUCTS: 'cultural_products_products',
  LOGS: 'cultural_products_logs',
  OPERATOR: 'cultural_products_operator'
}

export const DEFAULT_OPERATOR = '管理员'

export const PROCESS_LEVEL_CONTROL_MESSAGE = '高工艺等级产品操作需要确认'
