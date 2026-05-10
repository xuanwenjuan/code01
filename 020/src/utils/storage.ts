const STORAGE_KEYS = {
  CATEGORIES: 'gym_equipment_categories',
  EQUIPMENTS: 'gym_equipments',
  LOGS: 'gym_operation_logs'
}

export function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key)
    if (item) {
      return JSON.parse(item) as T
    }
  } catch (error) {
    console.error(`Failed to parse storage key ${key}:`, error)
  }
  return defaultValue
}

export function setStorage<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to set storage key ${key}:`, error)
  }
}

export function removeStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove storage key ${key}:`, error)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getCurrentTime(): string {
  return new Date().toISOString()
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export { STORAGE_KEYS }
