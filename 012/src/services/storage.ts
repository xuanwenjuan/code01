import type { 
  Category, 
  Product, 
  OperationLog, 
  ProductStatus,
  StorageResult,
  OperationType
} from '@/types'
import { categoryNames, type CategoryType } from '@/types'
import { isExpired, isExpiringSoon } from '@/utils/date'

const STORAGE_VERSION = '1.0.0'

const STORAGE_KEYS = {
  categories: 'pet_inventory_categories',
  products: 'pet_inventory_products',
  logs: 'pet_inventory_logs',
  operator: 'pet_inventory_operator',
  version: 'pet_inventory_version'
}

const EXPIRATION_THRESHOLD_DAYS = 30

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const getCurrentTime = (): string => {
  return new Date().toISOString()
}

const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Failed to read from localStorage key "${key}":`, error)
    return defaultValue
  }
}

const setItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to save to localStorage key "${key}":`, error)
    return false
  }
}

const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error)
  }
}

const checkStorageVersion = (): void => {
  const storedVersion = getItem<string>(STORAGE_KEYS.version, '')
  if (storedVersion !== STORAGE_VERSION) {
    console.log(`Storage version updated from ${storedVersion} to ${STORAGE_VERSION}`)
    setItem(STORAGE_KEYS.version, STORAGE_VERSION)
  }
}

const initializeCategories = (): Category[] => {
  const defaultCategories: Category[] = []
  const categoryTypes: CategoryType[] = ['food', 'snack', 'grooming', 'toy', 'daily']
  const descriptions: Record<CategoryType, string> = {
    food: '宠物主粮、罐头等食品类',
    snack: '宠物零食、磨牙棒等',
    grooming: '宠物洗护用品',
    toy: '宠物玩具',
    daily: '宠物日常用品'
  }

  categoryTypes.forEach((type) => {
    defaultCategories.push({
      id: `cat_${type}`,
      name: categoryNames[type],
      code: type,
      description: descriptions[type],
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    })
  })

  return defaultCategories
}

const determineProductStatus = (product: Product): ProductStatus => {
  if (product.status === 'removed') return 'removed'
  
  if (!product.expirationDate) return 'normal'
  
  if (isExpired(product.expirationDate)) {
    return 'expiring_soon'
  }
  
  if (isExpiringSoon(product.expirationDate, EXPIRATION_THRESHOLD_DAYS)) {
    return 'expiring_soon'
  }
  
  return 'normal'
}

const validateProduct = (product: Product): boolean => {
  if (!product.id || !product.name || !product.brand) return false
  if (!product.categoryId || !product.categoryCode) return false
  if (product.stockYear === undefined || product.stockQuantity === undefined) return false
  if (!product.applicablePetType || !product.qualityLevel) return false
  return true
}

const validateCategory = (category: Category): boolean => {
  if (!category.id || !category.name || !category.code) return false
  return true
}

const validateLog = (log: OperationLog): boolean => {
  if (!log.id || !log.operationTime || !log.operator) return false
  if (!log.operationType || !log.productId || !log.productName) return false
  return true
}

export const storageService = {
  initialize: (): void => {
    checkStorageVersion()
    storageService.getCategories()
  },

  getOperator: (): string => {
    return getItem<string>(STORAGE_KEYS.operator, '管理员')
  },

  setOperator: (name: string): boolean => {
    if (!name || !name.trim()) return false
    return setItem(STORAGE_KEYS.operator, name.trim())
  },

  getCategories: (): Category[] => {
    const categories = getItem<Category[]>(STORAGE_KEYS.categories, [])
    
    const validCategories = categories.filter(validateCategory)
    
    if (validCategories.length === 0) {
      const defaults = initializeCategories()
      setItem(STORAGE_KEYS.categories, defaults)
      return defaults
    }
    
    if (validCategories.length !== categories.length) {
      setItem(STORAGE_KEYS.categories, validCategories)
    }
    
    return validCategories
  },

  saveCategories: (categories: Category[]): boolean => {
    const validCategories = categories.filter(validateCategory)
    return setItem(STORAGE_KEYS.categories, validCategories)
  },

  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): StorageResult<Category> => {
    const categories = storageService.getCategories()
    
    const codeExists = categories.some(c => c.code === category.code)
    if (codeExists) {
      return { success: false, error: '该分类编码已存在' }
    }
    
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime()
    }
    
    if (!validateCategory(newCategory)) {
      return { success: false, error: '分类数据不完整' }
    }
    
    categories.push(newCategory)
    
    if (storageService.saveCategories(categories)) {
      return { success: true, data: newCategory }
    }
    
    return { success: false, error: '保存失败' }
  },

  updateCategory: (id: string, updates: Partial<Category>): StorageResult<Category> => {
    const categories = storageService.getCategories()
    const index = categories.findIndex(c => c.id === id)
    
    if (index === -1) {
      return { success: false, error: '分类不存在' }
    }

    if (updates.code && updates.code !== categories[index].code) {
      const codeExists = categories.some((c, i) => i !== index && c.code === updates.code)
      if (codeExists) {
        return { success: false, error: '该分类编码已存在' }
      }
    }

    const updatedCategory: Category = {
      ...categories[index],
      ...updates,
      updatedAt: getCurrentTime()
    }

    if (!validateCategory(updatedCategory)) {
      return { success: false, error: '更新后数据不完整' }
    }

    categories[index] = updatedCategory
    
    if (storageService.saveCategories(categories)) {
      return { success: true, data: updatedCategory }
    }
    
    return { success: false, error: '保存失败' }
  },

  deleteCategory: (id: string): StorageResult<boolean> => {
    const categories = storageService.getCategories()
    const index = categories.findIndex(c => c.id === id)
    
    if (index === -1) {
      return { success: false, error: '分类不存在' }
    }

    const products = storageService.getProducts()
    const hasProducts = products.some(p => p.categoryId === id)
    if (hasProducts) {
      return { success: false, error: '该分类下存在商品，无法删除' }
    }

    categories.splice(index, 1)
    
    if (storageService.saveCategories(categories)) {
      return { success: true, data: true }
    }
    
    return { success: false, error: '保存失败' }
  },

  getCategoryById: (id: string): Category | null => {
    const categories = storageService.getCategories()
    return categories.find(c => c.id === id) || null
  },

  getProducts: (): Product[] => {
    const products = getItem<Product[]>(STORAGE_KEYS.products, [])
    
    const validProducts = products.filter(validateProduct)
    
    const productsWithStatus = validProducts.map(product => {
      const newStatus = determineProductStatus(product)
      if (newStatus !== product.status) {
        return { ...product, status: newStatus, updatedAt: getCurrentTime() }
      }
      return product
    })
    
    if (productsWithStatus.length !== products.length) {
      storageService.saveProducts(productsWithStatus)
    }
    
    return productsWithStatus
  },

  saveProducts: (products: Product[]): boolean => {
    const validProducts = products.filter(validateProduct)
    return setItem(STORAGE_KEYS.products, validProducts)
  },

  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>): StorageResult<Product> => {
    const products = storageService.getProducts()
    
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: getCurrentTime(),
      updatedAt: getCurrentTime(),
      status: 'normal'
    }
    
    if (!validateProduct(newProduct)) {
      return { success: false, error: '商品数据不完整' }
    }
    
    newProduct.status = determineProductStatus(newProduct)
    
    products.push(newProduct)
    
    if (storageService.saveProducts(products)) {
      return { success: true, data: newProduct }
    }
    
    return { success: false, error: '保存失败' }
  },

  updateProduct: (id: string, updates: Partial<Product>): StorageResult<Product> => {
    const products = storageService.getProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return { success: false, error: '商品不存在' }
    }

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: getCurrentTime()
    }

    updatedProduct.status = determineProductStatus(updatedProduct)

    if (!validateProduct(updatedProduct)) {
      return { success: false, error: '更新后数据不完整' }
    }

    products[index] = updatedProduct
    
    if (storageService.saveProducts(products)) {
      return { success: true, data: updatedProduct }
    }
    
    return { success: false, error: '保存失败' }
  },

  deleteProduct: (id: string): StorageResult<boolean> => {
    const products = storageService.getProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return { success: false, error: '商品不存在' }
    }

    const product = products[index]
    if (product.status !== 'removed') {
      return { success: false, error: '只有已下架的商品才能删除' }
    }

    products.splice(index, 1)
    
    if (storageService.saveProducts(products)) {
      return { success: true, data: true }
    }
    
    return { success: false, error: '保存失败' }
  },

  getProductById: (id: string): Product | null => {
    const products = storageService.getProducts()
    return products.find(p => p.id === id) || null
  },

  updateProductStock: (
    id: string, 
    quantityChange: number,
    operationType: OperationType,
    remark?: string
  ): StorageResult<{ before: number; after: number }> => {
    const products = storageService.getProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      return { success: false, error: '商品不存在' }
    }

    const product = products[index]
    
    if (product.status === 'removed' && operationType !== 'expired_remove') {
      return { success: false, error: '商品已下架，无法进行此操作' }
    }

    const beforeStock = product.stockQuantity
    let afterStock = beforeStock + quantityChange

    if (operationType === 'outbound' && afterStock < 0) {
      return { success: false, error: '库存不足' }
    }

    if (operationType === 'expired_remove') {
      afterStock = 0
    }

    let newStatus: ProductStatus = product.status
    if (operationType === 'expired_remove') {
      newStatus = 'removed'
    }

    const updatedProduct: Product = {
      ...product,
      stockQuantity: afterStock,
      status: newStatus,
      updatedAt: getCurrentTime()
    }

    products[index] = updatedProduct
    
    if (!storageService.saveProducts(products)) {
      return { success: false, error: '保存失败' }
    }

    return { 
      success: true, 
      data: { before: beforeStock, after: afterStock }
    }
  },

  removeExpiringProducts: (): StorageResult<number> => {
    const products = storageService.getProducts()
    let removedCount = 0
    const logs: Array<{
      productId: string
      productName: string
      categoryId: string
      categoryCode: CategoryType
      beforeStock: number
    }> = []

    const updatedProducts = products.map(product => {
      if (product.status !== 'removed' && product.expirationDate) {
        if (isExpired(product.expirationDate) || isExpiringSoon(product.expirationDate, EXPIRATION_THRESHOLD_DAYS)) {
          logs.push({
            productId: product.id,
            productName: product.name,
            categoryId: product.categoryId,
            categoryCode: product.categoryCode,
            beforeStock: product.stockQuantity
          })
          removedCount++
          return {
            ...product,
            stockQuantity: 0,
            status: 'removed' as ProductStatus,
            updatedAt: getCurrentTime()
          }
        }
      }
      return product
    })

    if (!storageService.saveProducts(updatedProducts)) {
      return { success: false, error: '保存失败' }
    }

    const operator = storageService.getOperator()
    logs.forEach(log => {
      storageService.addLog({
        operator,
        operationType: 'expired_remove',
        productId: log.productId,
        productName: log.productName,
        categoryId: log.categoryId,
        categoryCode: log.categoryCode,
        quantityChange: -log.beforeStock,
        beforeStock: log.beforeStock,
        afterStock: 0,
        remark: '临期商品自动下架',
        statusAfter: 'removed'
      })
    })

    return { success: true, data: removedCount }
  },

  getLogs: (): OperationLog[] => {
    const logs = getItem<OperationLog[]>(STORAGE_KEYS.logs, [])
    return logs.filter(validateLog)
  },

  saveLogs: (logs: OperationLog[]): boolean => {
    const validLogs = logs.filter(validateLog)
    return setItem(STORAGE_KEYS.logs, validLogs)
  },

  addLog: (log: Omit<OperationLog, 'id' | 'operationTime'>): StorageResult<OperationLog> => {
    const logs = storageService.getLogs()
    
    const newLog: OperationLog = {
      ...log,
      id: generateId(),
      operationTime: getCurrentTime()
    }
    
    if (!validateLog(newLog)) {
      return { success: false, error: '日志数据不完整' }
    }
    
    logs.unshift(newLog)
    
    const MAX_LOGS = 1000
    const trimmedLogs = logs.slice(0, MAX_LOGS)
    
    if (storageService.saveLogs(trimmedLogs)) {
      return { success: true, data: newLog }
    }
    
    return { success: false, error: '保存失败' }
  },

  clearLogs: (): boolean => {
    removeItem(STORAGE_KEYS.logs)
    return true
  },

  exportAllData: (): StorageResult<string> => {
    try {
      const data = {
        version: STORAGE_VERSION,
        exportTime: getCurrentTime(),
        categories: storageService.getCategories(),
        products: storageService.getProducts(),
        logs: storageService.getLogs(),
        operator: storageService.getOperator()
      }
      return { success: true, data: JSON.stringify(data, null, 2) }
    } catch (error) {
      return { success: false, error: '导出失败' }
    }
  },

  importAllData: (jsonString: string): StorageResult<boolean> => {
    try {
      const data = JSON.parse(jsonString)
      
      if (data.categories && Array.isArray(data.categories)) {
        storageService.saveCategories(data.categories)
      }
      
      if (data.products && Array.isArray(data.products)) {
        storageService.saveProducts(data.products)
      }
      
      if (data.logs && Array.isArray(data.logs)) {
        storageService.saveLogs(data.logs)
      }
      
      if (data.operator) {
        storageService.setOperator(data.operator)
      }
      
      return { success: true, data: true }
    } catch (error) {
      return { success: false, error: '导入失败：数据格式不正确' }
    }
  },

  clearAllData: (): boolean => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => removeItem(key))
      return true
    } catch (error) {
      return false
    }
  },

  getExpirationThreshold: (): number => {
    return EXPIRATION_THRESHOLD_DAYS
  }
}

storageService.initialize()
