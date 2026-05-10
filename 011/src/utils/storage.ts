import type { Category, Stationery, OperationLog, StorageData } from '@/types'
import {
  CategoryType,
  QualityLevel,
  OperationType,
  ExpiryStatus,
  STORAGE_VERSION
} from '@/types'

const STORAGE_KEYS = {
  MAIN_DATA: 'stationery_inventory_data',
  MIGRATION_HISTORY: 'stationery_migration_history'
} as const

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

function getDefaultCategories(): Category[] {
  const now = new Date().toISOString()
  return [
    {
      id: generateId(),
      name: CategoryType.笔类,
      description: '各类笔具，包括钢笔、圆珠笔、铅笔、记号笔等',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: CategoryType.本子类,
      description: '各类笔记本、作业本、活页本、便签纸等',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: CategoryType.文件收纳类,
      description: '文件夹、文件袋、档案盒、资料册等收纳用品',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: CategoryType.绘图工具类,
      description: '尺子、圆规、绘图板、橡皮、削笔器等绘图工具',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: CategoryType.办公耗材类,
      description: '打印纸、墨盒、胶带、胶水、电池等耗材（有保质期）',
      createdAt: now,
      updatedAt: now
    }
  ]
}

function getInitialStorageData(): StorageData {
  return {
    version: STORAGE_VERSION,
    categories: getDefaultCategories(),
    stationeries: [],
    logs: [],
    lastSyncAt: new Date().toISOString()
  }
}

function readStorageData(): StorageData {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MAIN_DATA)
    if (!data) {
      const initialData = getInitialStorageData()
      saveStorageData(initialData)
      return initialData
    }

    const parsed = JSON.parse(data) as Partial<StorageData>

    if (!parsed.version || parsed.version !== STORAGE_VERSION) {
      return migrateData(parsed)
    }

    return parsed as StorageData
  } catch (e) {
    console.error('读取 localStorage 失败，使用默认数据:', e)
    return getInitialStorageData()
  }
}

function saveStorageData(data: StorageData): void {
  try {
    data.lastSyncAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.MAIN_DATA, JSON.stringify(data))
  } catch (e) {
    console.error('保存到 localStorage 失败:', e)
  }
}

function migrateData(oldData: Partial<StorageData>): StorageData {
  const migrationHistory = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.MIGRATION_HISTORY) || '[]'
  )

  migrationHistory.push({
    from: oldData.version || 'unknown',
    to: STORAGE_VERSION,
    migratedAt: new Date().toISOString()
  })

  localStorage.setItem(
    STORAGE_KEYS.MIGRATION_HISTORY,
    JSON.stringify(migrationHistory)
  )

  const newData: StorageData = {
    version: STORAGE_VERSION,
    categories: oldData.categories?.length
      ? oldData.categories
      : getDefaultCategories(),
    stationeries: oldData.stationeries || [],
    logs: oldData.logs || [],
    lastSyncAt: new Date().toISOString()
  }

  saveStorageData(newData)
  return newData
}

export function getExpiryDaysLeft(expiryDate: string | undefined): number | undefined {
  if (!expiryDate) return undefined

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const diff = expiry.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(daysLeft: number | undefined): ExpiryStatus {
  if (daysLeft === undefined) return ExpiryStatus.正常
  if (daysLeft <= 0) return ExpiryStatus.已过期
  if (daysLeft <= 30) return ExpiryStatus.临期
  return ExpiryStatus.正常
}

export function isHighQualityStationery(qualityLevel: QualityLevel): boolean {
  return qualityLevel === QualityLevel.优秀 || qualityLevel === QualityLevel.良好
}

export function requiresExpiryDate(categoryName: CategoryType): boolean {
  return categoryName === CategoryType.办公耗材类
}

export const categoryStorage = {
  getAll(): Category[] {
    return readStorageData().categories
  },

  getById(id: string): Category | undefined {
    return this.getAll().find((c) => c.id === id)
  },

  add(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
    const data = readStorageData()
    const now = new Date().toISOString()
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }
    data.categories.push(newCategory)
    saveStorageData(data)
    return newCategory
  },

  update(id: string, updates: Partial<Category>): boolean {
    const data = readStorageData()
    const index = data.categories.findIndex((c) => c.id === id)
    if (index === -1) return false

    data.categories[index] = {
      ...data.categories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveStorageData(data)
    return true
  },

  delete(id: string): boolean {
    const data = readStorageData()
    const filtered = data.categories.filter((c) => c.id !== id)
    if (filtered.length === data.categories.length) return false

    data.categories = filtered
    saveStorageData(data)
    return true
  }
}

export const stationeryStorage = {
  getAll(): Stationery[] {
    return readStorageData().stationeries.map((s) => this.enrichStationery(s))
  },

  enrichStationery(s: Stationery): Stationery {
    return {
      ...s,
      expiryDaysLeft: getExpiryDaysLeft(s.expiryDate),
      isHighQuality: isHighQualityStationery(s.qualityLevel)
    }
  },

  getById(id: string): Stationery | undefined {
    const data = readStorageData()
    const stationery = data.stationeries.find((s) => s.id === id)
    return stationery ? this.enrichStationery(stationery) : undefined
  },

  add(
    stationery: Omit<Stationery, 'id' | 'createdAt' | 'updatedAt' | 'expiryDaysLeft' | 'isHighQuality'>
  ): Stationery {
    const data = readStorageData()
    const now = new Date().toISOString()

    const newStationery: Stationery = {
      ...stationery,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      expiryDaysLeft: getExpiryDaysLeft(stationery.expiryDate),
      isHighQuality: isHighQualityStationery(stationery.qualityLevel)
    }

    data.stationeries.push(newStationery)
    saveStorageData(data)

    logStorage.add({
      operator: '系统管理员',
      operationContent: `新增文具：${stationery.name}（${stationery.brand}）`,
      stationeryId: newStationery.id,
      stationeryName: newStationery.name,
      stockChange: stationery.stockQuantity,
      previousStock: 0,
      newStock: stationery.stockQuantity,
      operationType: OperationType.新增,
      categoryId: stationery.categoryId,
      categoryName: stationery.categoryName
    })

    return newStationery
  },

  update(id: string, updates: Partial<Stationery>): boolean {
    const data = readStorageData()
    const index = data.stationeries.findIndex((s) => s.id === id)
    if (index === -1) return false

    const oldStationery = data.stationeries[index]
    const updatedStationery: Stationery = {
      ...oldStationery,
      ...updates,
      updatedAt: new Date().toISOString(),
      expiryDaysLeft: getExpiryDaysLeft(updates.expiryDate || oldStationery.expiryDate),
      isHighQuality: isHighQualityStationery(updates.qualityLevel || oldStationery.qualityLevel)
    }

    data.stationeries[index] = updatedStationery
    saveStorageData(data)

    logStorage.add({
      operator: '系统管理员',
      operationContent: `修改文具信息：${oldStationery.name}`,
      stationeryId: id,
      stationeryName: oldStationery.name,
      stockChange: 0,
      previousStock: oldStationery.stockQuantity,
      newStock: updatedStationery.stockQuantity,
      operationType: OperationType.修改,
      categoryId: oldStationery.categoryId,
      categoryName: oldStationery.categoryName
    })

    return true
  },

  delete(id: string): boolean {
    const data = readStorageData()
    const index = data.stationeries.findIndex((s) => s.id === id)
    if (index === -1) return false

    const stationery = data.stationeries[index]
    data.stationeries.splice(index, 1)
    saveStorageData(data)

    logStorage.add({
      operator: '系统管理员',
      operationContent: `删除文具：${stationery.name}`,
      stationeryId: id,
      stationeryName: stationery.name,
      stockChange: -stationery.stockQuantity,
      previousStock: stationery.stockQuantity,
      newStock: 0,
      operationType: OperationType.删除,
      categoryId: stationery.categoryId,
      categoryName: stationery.categoryName
    })

    return true
  },

  updateStock(id: string, change: number): { success: boolean; newStock: number } {
    const data = readStorageData()
    const index = data.stationeries.findIndex((s) => s.id === id)
    if (index === -1) return { success: false, newStock: 0 }

    const stationery = data.stationeries[index]
    const newStock = stationery.stockQuantity + change

    if (newStock < 0) {
      return { success: false, newStock: stationery.stockQuantity }
    }

    data.stationeries[index] = {
      ...stationery,
      stockQuantity: newStock,
      updatedAt: new Date().toISOString()
    }
    saveStorageData(data)

    return { success: true, newStock }
  },

  getExpiringStationeries(thresholdDays: number = 30): Stationery[] {
    return this.getAll().filter((s) => {
      if (!s.expiryDaysLeft) return false
      return s.expiryDaysLeft <= thresholdDays
    })
  }
}

export const logStorage = {
  getAll(): OperationLog[] {
    return readStorageData().logs
  },

  add(log: Omit<OperationLog, 'id' | 'operationTime' | 'createdAt' | 'updatedAt'>): OperationLog {
    const data = readStorageData()
    const now = new Date().toISOString()

    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operationTime: now,
      createdAt: now,
      updatedAt: now
    }

    data.logs.unshift(newLog)
    saveStorageData(data)
    return newLog
  },

  getByType(type: OperationType): OperationLog[] {
    return this.getAll().filter((log) => log.operationType === type)
  },

  getByStationeryId(stationeryId: string): OperationLog[] {
    return this.getAll().filter((log) => log.stationeryId === stationeryId)
  },

  clearAll(): void {
    const data = readStorageData()
    data.logs = []
    saveStorageData(data)
  }
}

export function getStats(): {
  totalCategories: number
  totalStationeries: number
  totalStock: number
  highQualityCount: number
  expiringSoon: number
  expired: number
  totalOperations: number
} {
  const data = readStorageData()

  let totalStock = 0
  let highQualityCount = 0
  let expiringSoon = 0
  let expired = 0

  data.stationeries.forEach((s) => {
    totalStock += s.stockQuantity

    if (isHighQualityStationery(s.qualityLevel)) {
      highQualityCount++
    }

    const daysLeft = getExpiryDaysLeft(s.expiryDate)
    if (daysLeft !== undefined) {
      if (daysLeft <= 0) {
        expired++
      } else if (daysLeft <= 30) {
        expiringSoon++
      }
    }
  })

  return {
    totalCategories: data.categories.length,
    totalStationeries: data.stationeries.length,
    totalStock,
    highQualityCount,
    expiringSoon,
    expired,
    totalOperations: data.logs.length
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.MAIN_DATA)
  localStorage.removeItem(STORAGE_KEYS.MIGRATION_HISTORY)
}

export function exportData(): string {
  return JSON.stringify(readStorageData(), null, 2)
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as StorageData
    if (data.categories && Array.isArray(data.categories)) {
      saveStorageData(data)
      return true
    }
    return false
  } catch {
    return false
  }
}
