import type {
  Category,
  Equipment,
  OperationLog,
  StorageData,
  DataBackup,
  AppConfig,
  RentalRecord
} from '@/types'
import {
  EquipmentCategory,
  QualityLevel,
  EquipmentStatus,
  DEFAULT_APP_CONFIG
} from '@/types'

const STORAGE_KEYS = {
  CATEGORIES: 'outdoor_equipment_categories',
  EQUIPMENTS: 'outdoor_equipment_equipments',
  OPERATION_LOGS: 'outdoor_equipment_logs',
  RENTAL_RECORDS: 'outdoor_equipment_rentals',
  APP_CONFIG: 'outdoor_equipment_config',
  BACKUP_HISTORY: 'outdoor_equipment_backups',
  DATA_VERSION: 'outdoor_equipment_version'
} as const

const CURRENT_DATA_VERSION = 2

function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}_${random}`
}

function getNowString(): string {
  return new Date().toISOString()
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    if (data !== null && data !== undefined && data !== '') {
      if (isValidJSON(data)) {
        return JSON.parse(data) as T
      }
    }
    return defaultValue
  } catch (error) {
    console.error(`从 localStorage 读取 ${key} 失败:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, data: T): boolean {
  try {
    const jsonString = JSON.stringify(data)
    localStorage.setItem(key, jsonString)
    return true
  } catch (error) {
    console.error(`保存到 localStorage 失败 [${key}]:`, error)
    return false
  }
}

function getAppConfig(): AppConfig {
  const stored = loadFromStorage<Partial<AppConfig>>(STORAGE_KEYS.APP_CONFIG, {})
  return { ...DEFAULT_APP_CONFIG, ...stored }
}

function saveAppConfig(config: Partial<AppConfig>): void {
  const current = getAppConfig()
  const updated = { ...current, ...config }
  saveToStorage(STORAGE_KEYS.APP_CONFIG, updated)
}

function getDataVersion(): number {
  return loadFromStorage<number>(STORAGE_KEYS.DATA_VERSION, 1)
}

function setDataVersion(version: number): void {
  saveToStorage(STORAGE_KEYS.DATA_VERSION, version)
}

function initializeCategories(): Category[] {
  const now = getNowString()
  const categories: Category[] = [
    {
      id: generateId(),
      name: '露营类',
      code: EquipmentCategory.CAMPING,
      description: '帐篷、睡袋、露营灯、折叠椅等露营装备',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: '登山类',
      code: EquipmentCategory.HIKING,
      description: '登山杖、登山鞋、冰爪、绳索等登山装备',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: '骑行类',
      code: EquipmentCategory.CYCLING,
      description: '自行车、头盔、骑行服、车灯等骑行装备',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: '水上类',
      code: EquipmentCategory.WATER,
      description: '救生衣、皮划艇、浮潜装备、桨板等水上装备',
      createdAt: now,
      updatedAt: now
    },
    {
      id: generateId(),
      name: '防护类',
      code: EquipmentCategory.PROTECTION,
      description: '头盔、护膝、护肘、护目镜等防护装备',
      createdAt: now,
      updatedAt: now
    }
  ]
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
  return categories
}

function initializeEquipments(categories: Category[]): Equipment[] {
  const campingCat = categories.find(c => c.code === EquipmentCategory.CAMPING)
  const hikingCat = categories.find(c => c.code === EquipmentCategory.HIKING)
  const cyclingCat = categories.find(c => c.code === EquipmentCategory.CYCLING)
  const waterCat = categories.find(c => c.code === EquipmentCategory.WATER)
  const protectionCat = categories.find(c => c.code === EquipmentCategory.PROTECTION)

  const currentYear = new Date().getFullYear()
  const now = getNowString()
  const equipments: Equipment[] = []

  if (campingCat) {
    equipments.push(
      {
        id: generateId(),
        name: '专业露营帐篷（3-4人）',
        brand: 'Naturehike',
        categoryId: campingCat.id,
        categoryCode: campingCat.code,
        equipmentType: 'mechanical',
        entryYear: 2023,
        stockQuantity: 15,
        minStockThreshold: 3,
        scenarios: '户外露营、徒步旅行、家庭出游',
        qualityLevel: QualityLevel.EXCELLENT,
        remainingLife: 8,
        purchaseDate: '2023-03-15',
        lastMaintenanceDate: '2025-01-20',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      },
      {
        id: generateId(),
        name: '羽绒睡袋 -20°C',
        brand: '黑冰',
        categoryId: campingCat.id,
        categoryCode: campingCat.code,
        equipmentType: 'general',
        entryYear: 2022,
        stockQuantity: 20,
        minStockThreshold: 5,
        scenarios: '冬季露营、高海拔露营',
        qualityLevel: QualityLevel.GOOD,
        remainingLife: 5,
        purchaseDate: '2022-09-01',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    )
  }

  if (hikingCat) {
    equipments.push(
      {
        id: generateId(),
        name: '碳纤维登山杖',
        brand: 'LEKI',
        categoryId: hikingCat.id,
        categoryCode: hikingCat.code,
        equipmentType: 'mechanical',
        entryYear: 2024,
        stockQuantity: 30,
        minStockThreshold: 10,
        scenarios: '高海拔登山、徒步旅行',
        qualityLevel: QualityLevel.EXCELLENT,
        remainingLife: 10,
        purchaseDate: '2024-01-10',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    )
  }

  if (cyclingCat) {
    equipments.push(
      {
        id: generateId(),
        name: '公路自行车',
        brand: 'GIANT',
        categoryId: cyclingCat.id,
        categoryCode: cyclingCat.code,
        equipmentType: 'mechanical',
        entryYear: 2023,
        stockQuantity: 8,
        minStockThreshold: 2,
        scenarios: '公路骑行、比赛训练',
        qualityLevel: QualityLevel.EXCELLENT,
        remainingLife: 6,
        purchaseDate: '2023-06-20',
        lastMaintenanceDate: '2025-02-15',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    )
  }

  if (waterCat) {
    equipments.push(
      {
        id: generateId(),
        name: '专业救生衣',
        brand: 'NRS',
        categoryId: waterCat.id,
        categoryCode: waterCat.code,
        equipmentType: 'general',
        entryYear: 2024,
        stockQuantity: 25,
        minStockThreshold: 8,
        scenarios: '皮划艇、漂流、浮潜、帆船',
        qualityLevel: QualityLevel.EXCELLENT,
        remainingLife: 7,
        purchaseDate: '2024-02-20',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    )
  }

  if (protectionCat) {
    equipments.push(
      {
        id: generateId(),
        name: '运动头盔',
        brand: 'Giro',
        categoryId: protectionCat.id,
        categoryCode: protectionCat.code,
        equipmentType: 'general',
        entryYear: 2023,
        stockQuantity: 40,
        minStockThreshold: 10,
        scenarios: '骑行、滑板、攀岩、滑雪',
        qualityLevel: QualityLevel.GOOD,
        remainingLife: 4,
        purchaseDate: '2023-08-15',
        status: EquipmentStatus.IN_STOCK,
        createdAt: now,
        updatedAt: now,
        version: 1
      }
    )
  }

  saveToStorage(STORAGE_KEYS.EQUIPMENTS, equipments)
  return equipments
}

function migrateData(version: number): void {
  console.log(`数据迁移：版本 ${version} -> ${CURRENT_DATA_VERSION}`)
  
  if (version < 2) {
    const equipments = loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, [])
    const updatedEquipments = equipments.map(eq => ({
      ...eq,
      equipmentType: eq.remainingLife !== undefined ? 'mechanical' as const : 'general' as const,
      minStockThreshold: 3,
      version: 2
    }))
    saveToStorage(STORAGE_KEYS.EQUIPMENTS, updatedEquipments)
  }
  
  setDataVersion(CURRENT_DATA_VERSION)
}

function checkAndMigrate(): void {
  const currentVersion = getDataVersion()
  if (currentVersion < CURRENT_DATA_VERSION) {
    migrateData(currentVersion)
  }
}

function createBackup(description?: string): DataBackup | null {
  const backup: DataBackup = {
    version: CURRENT_DATA_VERSION,
    createdAt: getNowString(),
    description,
    data: {
      version: CURRENT_DATA_VERSION,
      timestamp: getNowString(),
      categories: loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []),
      equipments: loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, []),
      operationLogs: loadFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []),
      rentalRecords: loadFromStorage<RentalRecord[]>(STORAGE_KEYS.RENTAL_RECORDS, [])
    }
  }
  
  const backups = loadFromStorage<DataBackup[]>(STORAGE_KEYS.BACKUP_HISTORY, [])
  backups.unshift(backup)
  
  const maxBackups = 10
  if (backups.length > maxBackups) {
    backups.splice(maxBackups)
  }
  
  if (saveToStorage(STORAGE_KEYS.BACKUP_HISTORY, backups)) {
    saveAppConfig({ lastBackupTime: getNowString() })
    return backup
  }
  
  return null
}

function restoreBackup(backup: DataBackup): boolean {
  try {
    if (backup.data.categories) {
      saveToStorage(STORAGE_KEYS.CATEGORIES, backup.data.categories)
    }
    if (backup.data.equipments) {
      saveToStorage(STORAGE_KEYS.EQUIPMENTS, backup.data.equipments)
    }
    if (backup.data.operationLogs) {
      saveToStorage(STORAGE_KEYS.OPERATION_LOGS, backup.data.operationLogs)
    }
    if (backup.data.rentalRecords) {
      saveToStorage(STORAGE_KEYS.RENTAL_RECORDS, backup.data.rentalRecords)
    }
    return true
  } catch (error) {
    console.error('恢复备份失败:', error)
    return false
  }
}

function getBackupHistory(): DataBackup[] {
  return loadFromStorage<DataBackup[]>(STORAGE_KEYS.BACKUP_HISTORY, [])
}

function exportData(): StorageData {
  return {
    version: CURRENT_DATA_VERSION,
    timestamp: getNowString(),
    categories: loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []),
    equipments: loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, []),
    operationLogs: loadFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []),
    rentalRecords: loadFromStorage<RentalRecord[]>(STORAGE_KEYS.RENTAL_RECORDS, [])
  }
}

function importData(data: StorageData): boolean {
  try {
    if (data.categories) {
      saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories)
    }
    if (data.equipments) {
      saveToStorage(STORAGE_KEYS.EQUIPMENTS, data.equipments)
    }
    if (data.operationLogs) {
      saveToStorage(STORAGE_KEYS.OPERATION_LOGS, data.operationLogs)
    }
    if (data.rentalRecords) {
      saveToStorage(STORAGE_KEYS.RENTAL_RECORDS, data.rentalRecords)
    }
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}

function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
  localStorage.removeItem(STORAGE_KEYS.EQUIPMENTS)
  localStorage.removeItem(STORAGE_KEYS.OPERATION_LOGS)
  localStorage.removeItem(STORAGE_KEYS.RENTAL_RECORDS)
}

function getStorageInfo(): {
  usedBytes: number
  quotaBytes: number | null
  categoriesCount: number
  equipmentsCount: number
  logsCount: number
  rentalsCount: number
  lastBackupTime?: string
} {
  let totalBytes = 0
  Object.values(STORAGE_KEYS).forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      totalBytes += new Blob([data]).size
    }
  })

  const config = getAppConfig()

  return {
    usedBytes: totalBytes,
    quotaBytes: 'storage' in navigator && 'estimate' in navigator.storage ? null : null,
    categoriesCount: loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []).length,
    equipmentsCount: loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, []).length,
    logsCount: loadFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, []).length,
    rentalsCount: loadFromStorage<RentalRecord[]>(STORAGE_KEYS.RENTAL_RECORDS, []).length,
    lastBackupTime: config.lastBackupTime
  }
}

export const storageService = {
  getCategories(): Category[] {
    checkAndMigrate()
    let categories = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, [])
    if (categories.length === 0) {
      categories = initializeCategories()
    }
    return categories
  },

  saveCategories(categories: Category[]): boolean {
    return saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
  },

  getEquipments(): Equipment[] {
    checkAndMigrate()
    let equipments = loadFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, [])
    if (equipments.length === 0) {
      const categories = this.getCategories()
      equipments = initializeEquipments(categories)
    }
    return equipments
  },

  saveEquipments(equipments: Equipment[]): boolean {
    return saveToStorage(STORAGE_KEYS.EQUIPMENTS, equipments)
  },

  getOperationLogs(): OperationLog[] {
    checkAndMigrate()
    return loadFromStorage<OperationLog[]>(STORAGE_KEYS.OPERATION_LOGS, [])
  },

  saveOperationLogs(logs: OperationLog[]): boolean {
    return saveToStorage(STORAGE_KEYS.OPERATION_LOGS, logs)
  },

  getRentalRecords(): RentalRecord[] {
    checkAndMigrate()
    return loadFromStorage<RentalRecord[]>(STORAGE_KEYS.RENTAL_RECORDS, [])
  },

  saveRentalRecords(records: RentalRecord[]): boolean {
    return saveToStorage(STORAGE_KEYS.RENTAL_RECORDS, records)
  },

  getAppConfig,
  saveAppConfig,
  createBackup,
  restoreBackup,
  getBackupHistory,
  exportData,
  importData,
  clearAllData,
  getStorageInfo,
  generateId,
  getNowString,
  CURRENT_DATA_VERSION
}
