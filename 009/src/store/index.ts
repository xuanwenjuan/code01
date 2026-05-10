import { reactive, readonly, ref } from 'vue'
import type { Category, Product, OperationLog, ToastMethods, ProductStatus, OperationType } from '../types'
import { getCategories, getProducts, getLogs, updateProductShelfLife } from '../utils/storage'

interface AppState {
  categories: Category[]
  products: Product[]
  logs: OperationLog[]
  operator: string
  nearExpiryProducts: Product[]
}

const state = reactive<AppState>({
  categories: [],
  products: [],
  logs: [],
  operator: '管理员',
  nearExpiryProducts: []
})

const toastRef = ref<ToastMethods | null>(null)

function setToastMethods(methods: ToastMethods): void {
  toastRef.value = methods
}

function getToast(): ToastMethods {
  if (!toastRef.value) {
    return {
      success: console.log,
      error: console.error,
      warning: console.warn,
      info: console.info
    }
  }
  return toastRef.value
}

function loadAllData(): void {
  updateProductShelfLife()
  state.categories = getCategories()
  state.products = getProducts()
  state.logs = getLogs()
  updateNearExpiryProducts()
}

function loadCategories(): void {
  state.categories = getCategories()
}

function loadProducts(): void {
  updateProductShelfLife()
  state.products = getProducts()
  updateNearExpiryProducts()
}

function loadLogs(): void {
  state.logs = getLogs()
}

function updateNearExpiryProducts(): void {
  const today = new Date()
  state.nearExpiryProducts = state.products.filter(product => {
    const productionDate = new Date(product.productionDate)
    const daysPassed = Math.floor((today.getTime() - productionDate.getTime()) / (1000 * 60 * 60 * 24))
    const remainingDays = product.shelfLifeDays - daysPassed
    return remainingDays <= 30 && product.status !== '已下架'
  })
}

function getCategoryById(id: string): Category | undefined {
  return state.categories.find(cat => cat.id === id)
}

function getProductById(id: string): Product | undefined {
  return state.products.find(prod => prod.id === id)
}

function updateProductStatus(productId: string, newStatus: ProductStatus): void {
  const product = state.products.find(p => p.id === productId)
  if (product) {
    product.status = newStatus
    product.updatedAt = new Date().toISOString()
    updateNearExpiryProducts()
  }
}

function updateProductStock(productId: string, newQuantity: number): void {
  const product = state.products.find(p => p.id === productId)
  if (product) {
    product.stockQuantity = newQuantity
    product.updatedAt = new Date().toISOString()
  }
}

function notifyDataUpdated(): void {
  loadAllData()
}

function getShelfLifeInfo(product: Product): {
  totalDays: number
  elapsedDays: number
  remainingDays: number
  isNearExpiry: boolean
  isExpired: boolean
} {
  const today = new Date()
  const productionDate = new Date(product.productionDate)
  const daysPassed = Math.floor((today.getTime() - productionDate.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = product.shelfLifeDays - daysPassed
  
  return {
    totalDays: product.shelfLifeDays,
    elapsedDays: Math.max(0, daysPassed),
    remainingDays: Math.max(0, remainingDays),
    isNearExpiry: remainingDays <= 30 && remainingDays > 0,
    isExpired: remainingDays <= 0
  }
}

function canPerformStockIn(product: Product): boolean {
  return true
}

function canPerformStockOut(product: Product): boolean {
  return product.status !== '已下架' && product.stockQuantity > 0
}

function canPerformOffShelf(product: Product): boolean {
  return product.status !== '已下架'
}

function validateStockOperation(
  type: OperationType,
  product: Product,
  quantity: number
): string | null {
  if (quantity <= 0) {
    return '操作数量必须大于0'
  }
  
  if (type === '出库' && product.stockQuantity < quantity) {
    return '出库数量不能超过当前库存'
  }
  
  if (product.status === '已下架') {
    return '该用品已下架，无法进行此操作'
  }
  
  return null
}

const readonlyState = readonly(state)

export {
  readonlyState as state,
  setToastMethods,
  getToast,
  loadAllData,
  loadCategories,
  loadProducts,
  loadLogs,
  updateNearExpiryProducts,
  getCategoryById,
  getProductById,
  updateProductStatus,
  updateProductStock,
  notifyDataUpdated,
  getShelfLifeInfo,
  canPerformStockIn,
  canPerformStockOut,
  canPerformOffShelf,
  validateStockOperation
}
