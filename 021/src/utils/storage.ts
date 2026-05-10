import type { ProductCategory, Product, OperationLog, StockOperationRecord, CategoryType, ProductStatus, OperationType, StockOperationType } from '@/types'
import { CATEGORY_TYPES, PRODUCT_STATUSES } from '@/types'
import { generateId, getCurrentDateTime } from '@/utils'

const STORAGE_VERSION = '1.0.0'

export type StorageEvent = 'products' | 'logs' | 'categories'

type StorageEventListener = (event: StorageEvent) => void

const eventListeners = new Map<StorageEvent, Set<StorageEventListener>>()

export const onStorageChange = (event: StorageEvent, callback: StorageEventListener) => {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set())
  }
  eventListeners.get(event)!.add(callback)
}

export const offStorageChange = (event: StorageEvent, callback: StorageEventListener) => {
  eventListeners.get(event)?.delete(callback)
}

const notifyListeners = (event: StorageEvent) => {
  eventListeners.get(event)?.forEach(cb => {
    try { cb(event) } catch (e) { console.error('Storage listener error:', e) }
  })
}

const STORAGE_PREFIX = 'beauty_shop'
const VERSION_KEY = `${STORAGE_PREFIX}_version`

const KEYS = {
  CATEGORIES: `${STORAGE_PREFIX}_categories`,
  PRODUCTS: `${STORAGE_PREFIX}_products`,
  LOGS: `${STORAGE_PREFIX}_logs`,
  STOCK_RECORDS: `${STORAGE_PREFIX}_stock_records`,
  OPERATOR: `${STORAGE_PREFIX}_operator`,
  SETTINGS: `${STORAGE_PREFIX}_settings`
} as const

const getDefaultCategories = (): ProductCategory[] => {
  const now = getCurrentDateTime()
  return CATEGORY_TYPES.map((type, index) => ({
    id: `cat-${index + 1}`,
    name: type,
    parentId: null,
    type: type as CategoryType,
    createdAt: now,
    updatedAt: now
  }))
}

const getDefaultProducts = (): Product[] => {
  const now = getCurrentDateTime()
  return [
    {
      id: 'prod-1',
      name: '保湿面霜',
      brand: '雅诗兰黛',
      categoryId: 'cat-1',
      categoryName: '护肤类',
      parentCategoryName: '护肤类',
      parentCategoryType: '护肤类',
      purchaseYear: 2024,
      currentStock: 50,
      unitPrice: 450,
      purity: 98,
      remainingShelfLife: 24,
      status: '正常',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'prod-2',
      name: '口红',
      brand: 'MAC',
      categoryId: 'cat-2',
      categoryName: '彩妆类',
      parentCategoryName: '彩妆类',
      parentCategoryType: '彩妆类',
      purchaseYear: 2024,
      currentStock: 100,
      unitPrice: 180,
      purity: 95,
      remainingShelfLife: 18,
      status: '正常',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'prod-3',
      name: '香水',
      brand: '香奈儿',
      categoryId: 'cat-3',
      categoryName: '香氛类',
      parentCategoryName: '香氛类',
      parentCategoryType: '香氛类',
      purchaseYear: 2023,
      currentStock: 30,
      unitPrice: 850,
      purity: 99,
      remainingShelfLife: 6,
      status: '临期',
      createdAt: now,
      updatedAt: now
    }
  ]
}

const validateCategory = (category: unknown): category is ProductCategory => {
  if (typeof category !== 'object' || category === null) return false
  const c = category as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    (c.parentId === null || typeof c.parentId === 'string') &&
    CATEGORY_TYPES.includes(c.type as CategoryType) &&
    typeof c.createdAt === 'string' &&
    typeof c.updatedAt === 'string'
  )
}

const validateProduct = (product: unknown): product is Product => {
  if (typeof product !== 'object' || product === null) return false
  const p = product as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.brand === 'string' &&
    typeof p.categoryId === 'string' &&
    typeof p.categoryName === 'string' &&
    typeof p.parentCategoryName === 'string' &&
    CATEGORY_TYPES.includes(p.parentCategoryType as CategoryType) &&
    typeof p.purchaseYear === 'number' &&
    typeof p.currentStock === 'number' &&
    typeof p.unitPrice === 'number' &&
    typeof p.purity === 'number' &&
    typeof p.remainingShelfLife === 'number' &&
    PRODUCT_STATUSES.includes(p.status as ProductStatus) &&
    typeof p.createdAt === 'string' &&
    typeof p.updatedAt === 'string'
  )
}

const validateLog = (log: unknown): log is OperationLog => {
  if (typeof log !== 'object' || log === null) return false
  const l = log as Record<string, unknown>
  return (
    typeof l.id === 'string' &&
    typeof l.operator === 'string' &&
    typeof l.operationType === 'string' &&
    typeof l.productId === 'string' &&
    typeof l.productName === 'string' &&
    typeof l.details === 'string' &&
    typeof l.stockChange === 'number' &&
    typeof l.previousStock === 'number' &&
    typeof l.newStock === 'number' &&
    typeof l.previousStatus === 'string' &&
    typeof l.newStatus === 'string' &&
    typeof l.operatedAt === 'string'
  )
}

const safeGetItem = <T>(key: string, validator: (value: unknown) => value is T, defaultValue: T): T => {
  try {
    const stored = sessionStorage.getItem(key)
    if (!stored) {
      return defaultValue
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      const validItems = parsed.filter(item => validator(item))
      if (validItems.length !== parsed.length) {
        console.warn(`Storage key "${key}": ${parsed.length - validItems.length} items failed validation and were filtered out`)
      }
      return validItems as T
    }
    if (validator(parsed)) {
      return parsed
    }
    console.warn(`Storage key "${key}": data failed validation, using default value`)
    return defaultValue
  } catch (error) {
    console.error(`Storage key "${key}": error reading data`, error)
    return defaultValue
  }
}

const safeSetItem = <T>(key: string, value: T): boolean => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Storage key "${key}": error saving data`, error)
    return false
  }
}

const initializeStorage = () => {
  const existingVersion = sessionStorage.getItem(VERSION_KEY)
  if (!existingVersion) {
    sessionStorage.setItem(VERSION_KEY, STORAGE_VERSION)
  } else if (existingVersion !== STORAGE_VERSION) {
    console.log(`Storage version mismatch: ${existingVersion} -> ${STORAGE_VERSION}`)
  }
}

initializeStorage()

export const getCategories = (): ProductCategory[] => {
  const defaultValue = getDefaultCategories()
  const categories = safeGetItem<ProductCategory[]>(
    KEYS.CATEGORIES,
    (value): value is ProductCategory[] => Array.isArray(value) && value.every(validateCategory),
    defaultValue
  )
  if (categories.length === 0) {
    saveCategories(defaultValue)
    return defaultValue
  }
  return categories
}

export const saveCategories = (categories: ProductCategory[]): boolean => {
  const validCategories = categories.filter(validateCategory)
  if (validCategories.length !== categories.length) {
    console.warn(`${categories.length - validCategories.length} categories failed validation and were removed`)
  }
  const result = safeSetItem(KEYS.CATEGORIES, validCategories)
  if (result) notifyListeners('categories')
  return result
}

export const addCategory = (category: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>): ProductCategory => {
  const categories = getCategories()
  const newCategory: ProductCategory = {
    ...category,
    id: generateId('cat'),
    createdAt: getCurrentDateTime(),
    updatedAt: getCurrentDateTime()
  }
  categories.push(newCategory)
  saveCategories(categories)
  return newCategory
}

export const updateCategory = (id: string, updates: Partial<Omit<ProductCategory, 'id' | 'createdAt'>>): ProductCategory | null => {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = {
    ...categories[index],
    ...updates,
    updatedAt: getCurrentDateTime()
  }
  saveCategories(categories)
  return categories[index]
}

export const deleteCategory = (id: string): boolean => {
  const categories = getCategories()
  const hasChildren = categories.some(c => c.parentId === id)
  if (hasChildren) return false
  const filtered = categories.filter(c => c.id !== id)
  saveCategories(filtered)
  return true
}

export const getProducts = (): Product[] => {
  const defaultValue = getDefaultProducts()
  const products = safeGetItem<Product[]>(
    KEYS.PRODUCTS,
    (value): value is Product[] => Array.isArray(value) && value.every(validateProduct),
    defaultValue
  )
  if (products.length === 0) {
    saveProducts(defaultValue)
    return defaultValue
  }
  return products
}

export const saveProducts = (products: Product[]): boolean => {
  const validProducts = products.filter(validateProduct)
  if (validProducts.length !== products.length) {
    console.warn(`${products.length - validProducts.length} products failed validation and were removed`)
  }
  const result = safeSetItem(KEYS.PRODUCTS, validProducts)
  if (result) notifyListeners('products')
  return result
}

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: generateId('prod'),
    createdAt: getCurrentDateTime(),
    updatedAt: getCurrentDateTime()
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null => {
  const products = getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: getCurrentDateTime()
  }
  saveProducts(products)
  return products[index]
}

export const deleteProduct = (id: string): boolean => {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== id)
  saveProducts(filtered)
  return true
}

export const getProductById = (id: string): Product | undefined => {
  return getProducts().find(p => p.id === id)
}

export const getLogs = (): OperationLog[] => {
  return safeGetItem<OperationLog[]>(
    KEYS.LOGS,
    (value): value is OperationLog[] => Array.isArray(value) && value.every(validateLog),
    []
  )
}

export const saveLogs = (logs: OperationLog[]): boolean => {
  const validLogs = logs.filter(validateLog)
  const result = safeSetItem(KEYS.LOGS, validLogs)
  if (result) notifyListeners('logs')
  return result
}

export const addLog = (log: Omit<OperationLog, 'id' | 'operatedAt'>): OperationLog => {
  const logs = getLogs()
  const newLog: OperationLog = {
    ...log,
    id: generateId('log'),
    operatedAt: getCurrentDateTime()
  }
  logs.unshift(newLog)
  const MAX_LOGS = 1000
  if (logs.length > MAX_LOGS) {
    logs.length = MAX_LOGS
  }
  saveLogs(logs)
  return newLog
}

export const clearLogs = (): boolean => {
  return safeSetItem(KEYS.LOGS, [])
}

export const getStockRecords = (): StockOperationRecord[] => {
  return safeGetItem<StockOperationRecord[]>(
    KEYS.STOCK_RECORDS,
    (value): value is StockOperationRecord[] => Array.isArray(value),
    []
  )
}

export const saveStockRecords = (records: StockOperationRecord[]): boolean => {
  return safeSetItem(KEYS.STOCK_RECORDS, records)
}

export const addStockRecord = (record: Omit<StockOperationRecord, 'id' | 'operatedAt'>): StockOperationRecord => {
  const records = getStockRecords()
  const newRecord: StockOperationRecord = {
    ...record,
    id: generateId('stock'),
    operatedAt: getCurrentDateTime()
  }
  records.unshift(newRecord)
  saveStockRecords(records)
  return newRecord
}

export const getOperator = (): string => {
  try {
    return sessionStorage.getItem(KEYS.OPERATOR) || '管理员'
  } catch {
    return '管理员'
  }
}

export const setOperator = (operator: string): boolean => {
  return safeSetItem(KEYS.OPERATOR, operator)
}

export const clearAllData = (): boolean => {
  try {
    Object.values(KEYS).forEach(key => {
      sessionStorage.removeItem(key)
    })
    sessionStorage.removeItem(VERSION_KEY)
    initializeStorage()
    return true
  } catch {
    return false
  }
}

export const exportData = (): string => {
  const data = {
    version: STORAGE_VERSION,
    exportedAt: getCurrentDateTime(),
    categories: getCategories(),
    products: getProducts(),
    logs: getLogs(),
    stockRecords: getStockRecords(),
    operator: getOperator()
  }
  return JSON.stringify(data, null, 2)
}

export const importData = (jsonStr: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonStr)
    if (!data || typeof data !== 'object') {
      return { success: false, message: '数据格式错误' }
    }

    if (data.categories && Array.isArray(data.categories)) {
      saveCategories(data.categories)
    }
    if (data.products && Array.isArray(data.products)) {
      saveProducts(data.products)
    }
    if (data.logs && Array.isArray(data.logs)) {
      saveLogs(data.logs)
    }
    if (data.operator && typeof data.operator === 'string') {
      setOperator(data.operator)
    }

    return { success: true, message: '数据导入成功' }
  } catch (error) {
    return { success: false, message: `导入失败: ${(error as Error).message}` }
  }
}

export const getStorageStats = (): {
  categories: number
  products: number
  logs: number
  stockRecords: number
  totalSize: string
} => {
  const categories = getCategories().length
  const products = getProducts().length
  const logs = getLogs().length
  const stockRecords = getStockRecords().length

  let totalSize = 0
  Object.values(KEYS).forEach(key => {
    const value = sessionStorage.getItem(key)
    if (value) {
      totalSize += new Blob([value]).size
    }
  })

  return {
    categories,
    products,
    logs,
    stockRecords,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`
  }
}

export interface TransactionResult {
  success: boolean
  product?: Product
  message: string
}

export interface StockTransactionParams {
  productId: string
  operationType: StockOperationType
  quantity: number
  reason: string
  remark?: string
  totalAmount?: number
  operator?: string
}

export const executeStockTransaction = (params: StockTransactionParams): TransactionResult => {
  const { productId, operationType, quantity, reason, remark = '', totalAmount, operator = getOperator() } = params
  
  const products = getProducts()
  const productIndex = products.findIndex(p => p.id === productId)
  
  if (productIndex === -1) {
    return { success: false, message: '产品不存在' }
  }
  
  const originalProduct = { ...products[productIndex] }
  const previousStock = originalProduct.currentStock
  const previousStatus = originalProduct.status
  
  let newStock = previousStock
  let newStatus = previousStatus
  
  switch (operationType) {
    case '入库':
      newStock = previousStock + quantity
      if (newStatus !== '已下架') {
        newStatus = originalProduct.remainingShelfLife <= 3 ? '临期' : '正常'
      }
      break
      
    case '出库':
      if (quantity > previousStock) {
        return { success: false, message: '出库数量不能超过当前库存' }
      }
      if (quantity <= 0) {
        return { success: false, message: '出库数量必须大于0' }
      }
      newStock = previousStock - quantity
      if (newStatus !== '已下架') {
        newStatus = originalProduct.remainingShelfLife <= 3 ? '临期' : '正常'
      }
      break
      
    case '临期下架':
      if (newStatus === '已下架') {
        return { success: false, message: '产品已下架' }
      }
      newStatus = '已下架'
      break
      
    default:
      return { success: false, message: '未知操作类型' }
  }
  
  const updatedProduct: Product = {
    ...originalProduct,
    currentStock: newStock,
    status: newStatus,
    updatedAt: getCurrentDateTime()
  }
  
  products[productIndex] = updatedProduct
  
  const logData: Omit<OperationLog, 'id' | 'operatedAt'> = {
    operator,
    operationType: operationType === '临期下架' ? '临期下架' : operationType,
    productId,
    productName: originalProduct.name,
    details: `${operationType} ${quantity} 件，原因：${reason}${remark ? `，备注：${remark}` : ''}`,
    stockChange: operationType === '入库' ? quantity : operationType === '出库' ? -quantity : 0,
    previousStock,
    newStock,
    previousStatus,
    newStatus
  }
  
  const stockRecordData: Omit<StockOperationRecord, 'id' | 'operatedAt'> = {
    productId,
    productName: originalProduct.name,
    operationType,
    quantity,
    operator,
    reason,
    totalAmount
  }
  
  if (!saveProducts(products)) {
    return { success: false, message: '保存产品数据失败' }
  }
  
  addLog(logData)
  addStockRecord(stockRecordData)
  
  return {
    success: true,
    product: updatedProduct,
    message: '操作成功'
  }
}
