import type { Category, Product, OperationLog } from '@/types'
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '@/constants'
import { generateId, now } from '@/utils'

const STORAGE_VERSION = 1

interface StorageContainer<T> {
  version: number
  data: T
  updatedAt: string
}

function createContainer<T>(data: T): StorageContainer<T> {
  return {
    version: STORAGE_VERSION,
    data,
    updatedAt: now()
  }
}

function parseContainer<T>(raw: string): StorageContainer<T> | null {
  try {
    const parsed = JSON.parse(raw) as StorageContainer<T>
    if (parsed && typeof parsed === 'object' && 'version' in parsed && 'data' in parsed) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function migrateOldFormat<T>(raw: string, defaultValue: T): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return defaultValue

    const container = parseContainer<T>(raw)
    if (container) {
      return container.data
    }

    return migrateOldFormat<T>(raw, defaultValue)
  } catch (error) {
    console.error(`Failed to get ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    const container = createContainer(data)
    localStorage.setItem(key, JSON.stringify(container))
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error)
  }
}

function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error)
  }
}

function initializeDefaultCategories(): Category[] {
  return DEFAULT_CATEGORIES.map(item => ({
    id: generateId(),
    code: item.code,
    name: item.name,
    description: item.description,
    createdAt: now(),
    updatedAt: now()
  }))
}

export const categoryStorage = {
  get: (): Category[] => getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, []),
  set: (data: Category[]) => saveToStorage(STORAGE_KEYS.CATEGORIES, data),
  remove: () => removeFromStorage(STORAGE_KEYS.CATEGORIES),
  getDefault: initializeDefaultCategories
}

export const productStorage = {
  get: (): Product[] => getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []),
  set: (data: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, data),
  remove: () => removeFromStorage(STORAGE_KEYS.PRODUCTS)
}

export const logStorage = {
  get: (): OperationLog[] => getFromStorage<OperationLog[]>(STORAGE_KEYS.LOGS, []),
  set: (data: OperationLog[]) => saveToStorage(STORAGE_KEYS.LOGS, data),
  remove: () => removeFromStorage(STORAGE_KEYS.LOGS)
}

export const operatorStorage = {
  get: (defaultValue: string): string => getFromStorage<string>(STORAGE_KEYS.OPERATOR, defaultValue),
  set: (data: string) => saveToStorage(STORAGE_KEYS.OPERATOR, data),
  remove: () => removeFromStorage(STORAGE_KEYS.OPERATOR)
}

export function clearAllStorage(): void {
  categoryStorage.remove()
  productStorage.remove()
  logStorage.remove()
  operatorStorage.remove()
}

export function getStorageInfo(): { key: string; size: string }[] {
  const info: { key: string; size: string }[] = []
  for (const key of Object.values(STORAGE_KEYS)) {
    const raw = localStorage.getItem(key)
    const size = raw ? new Blob([raw]).size : 0
    info.push({
      key,
      size: size < 1024 ? `${size} B` : `${(size / 1024).toFixed(2)} KB`
    })
  }
  return info
}
