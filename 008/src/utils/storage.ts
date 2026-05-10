import type { Category, FoodItem, StorageData, StorageKeys, AppConfig, FreshnessLevelValue, OperationTypeValue, StorageConditionValue } from '@/types'
import { FreshnessLevel as FreshnessLevelEnum, OperationType as OperationTypeEnum } from '@/types'

export const STORAGE_KEYS = {
  CATEGORIES: 'fresh_food_categories' as StorageKeys,
  FOOD_ITEMS: 'fresh_food_items' as StorageKeys,
  OPERATION_LOGS: 'fresh_food_logs' as StorageKeys,
  CONFIG: 'fresh_food_config' as StorageKeys
} as const

export const APP_VERSION = '1.0.0'

export const DEFAULT_CONFIG: AppConfig = {
  version: APP_VERSION,
  lastUpdated: '',
  nearlyExpiredDays: 7,
  expiredDays: 0
}

const VALID_FRESHNESS_LEVELS: Set<string> = new Set(['excellent', 'good', 'normal', 'low'])
const VALID_STORAGE_CONDITIONS: Set<string> = new Set([
  '常温保存',
  '冷藏保存(0-4℃)',
  '冷冻保存(-18℃以下)',
  '阴凉干燥处',
  '通风干燥处'
])
const VALID_OPERATION_TYPES: Set<string> = new Set(['stock-in', 'stock-out', 'expired-process'])

function isValidFreshnessLevel(value: unknown): value is FreshnessLevelValue {
  return typeof value === 'string' && VALID_FRESHNESS_LEVELS.has(value)
}

function isValidStorageCondition(value: unknown): value is StorageConditionValue {
  return typeof value === 'string' && VALID_STORAGE_CONDITIONS.has(value)
}

function isValidOperationType(value: unknown): value is OperationTypeValue {
  return typeof value === 'string' && VALID_OPERATION_TYPES.has(value)
}

function isStorageData(value: unknown): value is StorageData<unknown> {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return 'data' in obj && 'timestamp' in obj && typeof obj.timestamp === 'number'
}

function validateFoodItem(item: unknown): item is FoodItem {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.origin === 'string' &&
    typeof obj.categoryId === 'string' &&
    typeof obj.categoryName === 'string' &&
    typeof obj.entryYear === 'number' &&
    typeof obj.entryDate === 'string' &&
    typeof obj.stockQuantity === 'number' &&
    isValidStorageCondition(obj.storageCondition) &&
    isValidFreshnessLevel(obj.freshnessLevel) &&
    typeof obj.totalShelfLife === 'number' &&
    typeof obj.remainingDays === 'number' &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  )
}

function validateCategory(item: unknown): item is Category {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.createdAt === 'string'
  )
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const storageData: StorageData<T> = {
      data,
      timestamp: Date.now(),
      version: APP_VERSION
    }
    localStorage.setItem(key, JSON.stringify(storageData))
  } catch (error) {
    console.error(`[Storage] 保存失败: ${key}`, error)
  }
}

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return defaultValue
    }
    
    try {
      const parsed = JSON.parse(raw)
      if (isStorageData(parsed)) {
        return parsed.data as T
      }
      return parsed as T
    } catch {
      return defaultValue
    }
  } catch (error) {
    console.error(`[Storage] 读取失败: ${key}`, error)
    return defaultValue
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`[Storage] 删除失败: ${key}`, error)
  }
}

export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('[Storage] 清空失败', error)
  }
}

export function generateId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 8)}`
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getFreshnessLabel(level: string | FreshnessLevel): string {
  const labels: Record<string, string> = {
    [FreshnessLevelEnum.EXCELLENT]: '极佳',
    [FreshnessLevelEnum.GOOD]: '良好',
    [FreshnessLevelEnum.NORMAL]: '一般',
    [FreshnessLevelEnum.LOW]: '较差',
    'excellent': '极佳',
    'good': '良好',
    'normal': '一般',
    'low': '较差'
  }
  return labels[level] || '未知'
}

export function getOperationTypeLabel(type: string | OperationType): string {
  const labels: Record<string, string> = {
    [OperationTypeEnum.STOCK_IN]: '入库登记',
    [OperationTypeEnum.STOCK_OUT]: '出库领用',
    [OperationTypeEnum.EXPIRED_PROCESS]: '临期处理',
    'stock-in': '入库登记',
    'stock-out': '出库领用',
    'expired-process': '临期处理'
  }
  return labels[type] || '未知'
}

export function getStorageConditionOptions(): string[] {
  return [
    '常温保存',
    '冷藏保存(0-4℃)',
    '冷冻保存(-18℃以下)',
    '阴凉干燥处',
    '通风干燥处'
  ]
}

export function getFreshnessLevelOptions(): { value: string; label: string }[] {
  return [
    { value: FreshnessLevelEnum.EXCELLENT, label: '极佳' },
    { value: FreshnessLevelEnum.GOOD, label: '良好' },
    { value: FreshnessLevelEnum.NORMAL, label: '一般' },
    { value: FreshnessLevelEnum.LOW, label: '较差' }
  ]
}

export function getDefaultCategories(): Category[] {
  const now = formatDate(new Date())
  return [
    {
      id: 'cat_001',
      name: '蔬菜类',
      description: '新鲜蔬菜，包括叶菜、根茎类、茄果类等',
      createdAt: now
    },
    {
      id: 'cat_002',
      name: '水果类',
      description: '新鲜水果，包括热带水果、本地水果、进口水果等',
      createdAt: now
    },
    {
      id: 'cat_003',
      name: '肉类',
      description: '新鲜肉类，包括猪肉、牛肉、羊肉、鸡肉、鸭肉等',
      createdAt: now
    },
    {
      id: 'cat_004',
      name: '水产类',
      description: '新鲜水产品，包括鱼类、虾蟹、贝类、海鲜等',
      createdAt: now
    },
    {
      id: 'cat_005',
      name: '粮油类',
      description: '粮油米面，包括大米、面粉、食用油、调味品等',
      createdAt: now
    }
  ]
}

export function getDefaultFoodItems(): FoodItem[] {
  const now = formatDate(new Date())
  const today = new Date()
  const entryDate = formatDateOnly(today)
  const entryYear = today.getFullYear()
  
  return [
    {
      id: 'food_001',
      name: '大白菜',
      origin: '山东',
      categoryId: 'cat_001',
      categoryName: '蔬菜类',
      entryYear,
      entryDate,
      stockQuantity: 50,
      storageCondition: '冷藏保存(0-4℃)',
      freshnessLevel: FreshnessLevelEnum.GOOD,
      totalShelfLife: 14,
      remainingDays: 14,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'food_002',
      name: '红富士苹果',
      origin: '陕西',
      categoryId: 'cat_002',
      categoryName: '水果类',
      entryYear,
      entryDate,
      stockQuantity: 80,
      storageCondition: '常温保存',
      freshnessLevel: FreshnessLevelEnum.EXCELLENT,
      totalShelfLife: 30,
      remainingDays: 30,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'food_003',
      name: '猪里脊肉',
      origin: '河南',
      categoryId: 'cat_003',
      categoryName: '肉类',
      entryYear,
      entryDate,
      stockQuantity: 25,
      storageCondition: '冷冻保存(-18℃以下)',
      freshnessLevel: FreshnessLevelEnum.GOOD,
      totalShelfLife: 180,
      remainingDays: 180,
      createdAt: now,
      updatedAt: now
    }
  ]
}

export function calculateRemainingDays(
  entryDate: string,
  totalShelfLife: number,
  currentDate: Date = new Date()
): number {
  try {
    const entry = new Date(entryDate)
    const daysDiff = Math.floor((currentDate.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, totalShelfLife - daysDiff)
  } catch {
    return totalShelfLife
  }
}

export function getExpiryStatus(remainingDays: number): { status: string; badgeClass: string } {
  if (remainingDays <= 0) {
    return { status: '已过期', badgeClass: 'badge-danger' }
  } else if (remainingDays <= 3) {
    return { status: '紧急临期', badgeClass: 'badge-danger' }
  } else if (remainingDays <= 7) {
    return { status: '临期', badgeClass: 'badge-warning' }
  } else if (remainingDays <= 14) {
    return { status: '注意', badgeClass: 'badge-info' }
  }
  return { status: '正常', badgeClass: 'badge-success' }
}

export function getFreshnessBadgeClass(level: string): string {
  const classes: Record<string, string> = {
    [FreshnessLevelEnum.EXCELLENT]: 'badge-success',
    [FreshnessLevelEnum.GOOD]: 'badge-primary',
    [FreshnessLevelEnum.NORMAL]: 'badge-info',
    [FreshnessLevelEnum.LOW]: 'badge-warning',
    'excellent': 'badge-success',
    'good': 'badge-primary',
    'normal': 'badge-info',
    'low': 'badge-warning'
  }
  return classes[level] || 'badge-info'
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  return Math.floor(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function upgradeStorageData(): void {
  const rawItems = localStorage.getItem(STORAGE_KEYS.FOOD_ITEMS)
  if (!rawItems) return

  try {
    const items = getFromStorage<FoodItem[]>(STORAGE_KEYS.FOOD_ITEMS, [])
    let needsUpgrade = false

    const upgraded = items.map(item => {
      if (!item.entryDate) {
        needsUpgrade = true
        return {
          ...item,
          entryDate: item.createdAt ? item.createdAt.split(' ')[0] : formatDateOnly(new Date()),
          totalShelfLife: item.remainingDays || 30
        }
      }
      return item
    })

    if (needsUpgrade) {
      saveToStorage(STORAGE_KEYS.FOOD_ITEMS, upgraded)
      console.log('[Storage] 数据升级完成')
    }
  } catch (error) {
    console.error('[Storage] 数据升级失败', error)
  }
}
