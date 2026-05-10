import type { Category, Product, OperationLog, FilterParams } from '../types'

const CATEGORY_KEY = 'baby_products_categories'
const PRODUCT_KEY = 'baby_products'
const LOG_KEY = 'baby_products_logs'
const DEFAULT_OPERATOR = '管理员'

const defaultCategories: Category[] = [
  {
    id: 'cat_1',
    name: '奶粉类',
    description: '婴幼儿配方奶粉、特殊医学用途配方食品等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_2',
    name: '洗护类',
    description: '婴儿沐浴露、洗发水、护臀膏、湿巾等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_3',
    name: '玩具类',
    description: '益智玩具、毛绒玩具、积木、摇铃等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_4',
    name: '服饰类',
    description: '婴儿连体衣、外套、袜子、帽子等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat_5',
    name: '辅食类',
    description: '米粉、果泥、面条、磨牙饼干等',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const sampleProducts: Product[] = [
  {
    id: 'prod_1',
    name: '婴幼儿配方奶粉1段',
    brand: '雀巢',
    categoryId: 'cat_1',
    categoryName: '奶粉类',
    stockYear: 2024,
    stockQuantity: 150,
    applicableMonths: '0-6个月',
    securityLevel: '高',
    shelfLifeDays: 180,
    productionDate: '2025-01-10',
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: '婴儿沐浴露',
    brand: '强生',
    categoryId: 'cat_2',
    categoryName: '洗护类',
    stockYear: 2025,
    stockQuantity: 80,
    applicableMonths: '0-36个月',
    securityLevel: '中',
    shelfLifeDays: 365,
    productionDate: '2025-03-15',
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: '益智积木套装',
    brand: '乐高',
    categoryId: 'cat_3',
    categoryName: '玩具类',
    stockYear: 2024,
    stockQuantity: 45,
    applicableMonths: '12-72个月',
    securityLevel: '低',
    shelfLifeDays: 1095,
    productionDate: '2024-08-20',
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getCurrentOperator(): string {
  return DEFAULT_OPERATOR
}

export function getCategories(): Category[] {
  const data = localStorage.getItem(CATEGORY_KEY)
  if (data) {
    return JSON.parse(data)
  }
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(defaultCategories))
  return defaultCategories
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories))
}

export function addCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category {
  const categories = getCategories()
  const newCategory: Category = {
    ...category,
    id: generateId('cat'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  categories.push(newCategory)
  saveCategories(categories)
  return newCategory
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveCategories(categories)
  return categories[index]
}

export function deleteCategory(id: string): boolean {
  const products = getProducts()
  const hasProducts = products.some(p => p.categoryId === id)
  if (hasProducts) return false
  
  const categories = getCategories()
  const filtered = categories.filter(c => c.id !== id)
  saveCategories(filtered)
  return true
}

export function getProducts(): Product[] {
  const data = localStorage.getItem(PRODUCT_KEY)
  if (data) {
    return JSON.parse(data)
  }
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(sampleProducts))
  return sampleProducts
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(products))
}

export function addProduct(product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts()
  const newProduct: Product = {
    ...product,
    id: generateId('prod'),
    status: '正常',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveProducts(products)
  return products[index]
}

export function deleteProduct(id: string): boolean {
  const products = getProducts()
  const filtered = products.filter(p => p.id !== id)
  saveProducts(filtered)
  return true
}

export function filterProducts(params: FilterParams): Product[] {
  let products = getProducts()
  
  if (params.categoryId) {
    products = products.filter(p => p.categoryId === params.categoryId)
  }
  
  if (params.minStock !== undefined) {
    products = products.filter(p => p.stockQuantity >= params.minStock!)
  }
  
  if (params.maxStock !== undefined) {
    products = products.filter(p => p.stockQuantity <= params.maxStock!)
  }
  
  if (params.stockYear) {
    products = products.filter(p => p.stockYear === params.stockYear!)
  }
  
  if (params.securityLevel) {
    products = products.filter(p => p.securityLevel === params.securityLevel!)
  }
  
  if (params.minShelfLifeDays !== undefined) {
    products = products.filter(p => p.shelfLifeDays >= params.minShelfLifeDays!)
  }
  
  if (params.maxShelfLifeDays !== undefined) {
    products = products.filter(p => p.shelfLifeDays <= params.maxShelfLifeDays!)
  }
  
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.brand.toLowerCase().includes(keyword)
    )
  }
  
  return products
}

export function getLogs(): OperationLog[] {
  const data = localStorage.getItem(LOG_KEY)
  if (data) {
    return JSON.parse(data)
  }
  return []
}

export function saveLogs(logs: OperationLog[]): void {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs))
}

export function addLog(log: Omit<OperationLog, 'id' | 'operationTime' | 'operator'>): OperationLog {
  const logs = getLogs()
  const newLog: OperationLog = {
    ...log,
    id: generateId('log'),
    operationTime: new Date().toISOString(),
    operator: getCurrentOperator()
  }
  logs.unshift(newLog)
  saveLogs(logs)
  return newLog
}

export function updateProductShelfLife(): void {
  const products = getProducts()
  const today = new Date()
  
  products.forEach(product => {
    const productionDate = new Date(product.productionDate)
    const totalShelfLife = product.shelfLifeDays
    const daysPassed = Math.floor((today.getTime() - productionDate.getTime()) / (1000 * 60 * 60 * 24))
    const remainingDays = totalShelfLife - daysPassed
    
    if (product.status !== '已下架') {
      if (remainingDays <= 30) {
        product.status = '临期'
      } else {
        product.status = '正常'
      }
    }
  })
  
  saveProducts(products)
}
