import type {
  Category,
  Equipment,
  OperationLog,
  CategoryFormData,
  EquipmentFormData,
  LogFormData,
  EquipmentCategoryCode,
} from '../types'
import { EquipmentCategoryCode as EC } from '../types'

const STORAGE_KEYS = {
  CATEGORIES: 'equipment_categories',
  EQUIPMENTS: 'equipments',
  LOGS: 'operation_logs',
  BACKUP_PREFIX: 'backup_',
}

const STORAGE_VERSION = '1.0.0'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    return data ? (JSON.parse(data) as T) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

function removeFromStorage(key: string): void {
  localStorage.removeItem(key)
}

const defaultCategories: Category[] = [
  {
    id: 'cat_computer',
    name: '电脑类',
    code: EC.COMPUTER,
    description: '台式电脑、笔记本电脑等设备',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_printer',
    name: '打印机类',
    code: EC.PRINTER,
    description: '激光打印机、喷墨打印机、复印机等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_projector',
    name: '投影仪类',
    code: EC.PROJECTOR,
    description: '办公投影仪、会议设备等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_furniture',
    name: '办公家具类',
    code: EC.FURNITURE,
    description: '办公桌、办公椅、文件柜等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat_supplies',
    name: '耗材类',
    code: EC.SUPPLIES,
    description: '打印纸、墨盒、笔等办公用品',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export interface StorageBackup {
  version: string
  timestamp: string
  categories: Category[]
  equipments: Equipment[]
  logs: OperationLog[]
}

function initializeStorage(): void {
  const initialized = localStorage.getItem('storage_initialized')
  if (!initialized) {
    setToStorage(STORAGE_KEYS.CATEGORIES, defaultCategories)
    setToStorage(STORAGE_KEYS.EQUIPMENTS, [])
    setToStorage(STORAGE_KEYS.LOGS, [])
    localStorage.setItem('storage_initialized', 'true')
    localStorage.setItem('storage_version', STORAGE_VERSION)
  }
}

function createBackup(): StorageBackup {
  return {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    categories: getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories),
    equipments: getFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, []),
    logs: getFromStorage<OperationLog[]>(STORAGE_KEYS.LOGS, []),
  }
}

function restoreBackup(backup: StorageBackup): boolean {
  try {
    setToStorage(STORAGE_KEYS.CATEGORIES, backup.categories)
    setToStorage(STORAGE_KEYS.EQUIPMENTS, backup.equipments)
    setToStorage(STORAGE_KEYS.LOGS, backup.logs)
    return true
  } catch {
    return false
  }
}

function exportBackupToJSON(): string {
  const backup = createBackup()
  return JSON.stringify(backup, null, 2)
}

function importBackupFromJSON(jsonString: string): boolean {
  try {
    const backup = JSON.parse(jsonString) as StorageBackup
    if (!backup.version || !backup.categories || !backup.equipments || !backup.logs) {
      return false
    }
    return restoreBackup(backup)
  } catch {
    return false
  }
}

function clearAllData(): void {
  removeFromStorage(STORAGE_KEYS.CATEGORIES)
  removeFromStorage(STORAGE_KEYS.EQUIPMENTS)
  removeFromStorage(STORAGE_KEYS.LOGS)
  removeFromStorage('storage_initialized')
  removeFromStorage('storage_version')
}

initializeStorage()

export const storage = {
  initializeStorage,
  createBackup,
  restoreBackup,
  exportBackupToJSON,
  importBackupFromJSON,
  clearAllData,

  getCategories(): Category[] {
    return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories)
  },

  setCategories(categories: Category[]): void {
    setToStorage(STORAGE_KEYS.CATEGORIES, categories)
  },

  addCategory(category: CategoryFormData): Category {
    const categories = this.getCategories()
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    categories.push(newCategory)
    this.setCategories(categories)
    return newCategory
  },

  updateCategory(id: string, data: Partial<Category>): Category | null {
    const categories = this.getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return null
    categories[index] = {
      ...categories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    this.setCategories(categories)
    return categories[index]
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories()
    const equipments = this.getEquipments()
    if (equipments.some((e) => e.categoryId === id)) {
      return false
    }
    const filtered = categories.filter((c) => c.id !== id)
    this.setCategories(filtered)
    return true
  },

  getCategoryByCode(code: EquipmentCategoryCode): Category | undefined {
    return this.getCategories().find((c) => c.code === code)
  },

  getEquipments(): Equipment[] {
    return getFromStorage<Equipment[]>(STORAGE_KEYS.EQUIPMENTS, [])
  },

  setEquipments(equipments: Equipment[]): void {
    setToStorage(STORAGE_KEYS.EQUIPMENTS, equipments)
  },

  addEquipment(equipment: EquipmentFormData): Equipment {
    const equipments = this.getEquipments()
    const newEquipment: Equipment = {
      ...equipment,
      id: generateId(),
      availableQuantity: equipment.stockQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    equipments.push(newEquipment)
    this.setEquipments(equipments)
    return newEquipment
  },

  updateEquipment(id: string, data: Partial<Equipment>): Equipment | null {
    const equipments = this.getEquipments()
    const index = equipments.findIndex((e) => e.id === id)
    if (index === -1) return null
    const original = equipments[index]
    const newStock = data.stockQuantity !== undefined ? data.stockQuantity : original.stockQuantity
    const availableDiff = newStock - original.stockQuantity
    equipments[index] = {
      ...original,
      ...data,
      stockQuantity: newStock,
      availableQuantity: Math.max(
        0,
        data.availableQuantity !== undefined
          ? data.availableQuantity
          : original.availableQuantity + availableDiff
      ),
      updatedAt: new Date().toISOString(),
    }
    this.setEquipments(equipments)
    return equipments[index]
  },

  deleteEquipment(id: string): boolean {
    const equipments = this.getEquipments()
    const filtered = equipments.filter((e) => e.id !== id)
    this.setEquipments(filtered)
    return true
  },

  getEquipmentById(id: string): Equipment | undefined {
    return this.getEquipments().find((e) => e.id === id)
  },

  getEquipmentsByCategory(categoryId: string): Equipment[] {
    return this.getEquipments().filter((e) => e.categoryId === categoryId)
  },

  getLogs(): OperationLog[] {
    return getFromStorage<OperationLog[]>(STORAGE_KEYS.LOGS, [])
  },

  setLogs(logs: OperationLog[]): void {
    setToStorage(STORAGE_KEYS.LOGS, logs)
  },

  addLog(log: LogFormData): OperationLog {
    const logs = this.getLogs()
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operationTime: new Date().toISOString(),
    }
    logs.unshift(newLog)
    this.setLogs(logs)
    return newLog
  },

  getLogsByEquipment(equipmentId: string): OperationLog[] {
    return this.getLogs().filter((l) => l.equipmentId === equipmentId)
  },

  clearLogs(): void {
    this.setLogs([])
  },
}
