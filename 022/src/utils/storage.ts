import type { Category, Product, OperationRecord } from '@/types'
import { MAIN_CATEGORIES } from '@/types'

const CATEGORIES_KEY = 'stationery_categories'
const PRODUCTS_KEY = 'stationery_products'
const RECORDS_KEY = 'stationery_records'
const OPERATOR_KEY = 'stationery_operator'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function getDefaultOperator(): string {
  const stored = sessionStorage.getItem(OPERATOR_KEY)
  if (stored) return stored
  const operator = `操作员${Math.floor(Math.random() * 1000)}`
  sessionStorage.setItem(OPERATOR_KEY, operator)
  return operator
}

export function getOperator(): string {
  return getDefaultOperator()
}

export function setOperator(name: string): void {
  sessionStorage.setItem(OPERATOR_KEY, name)
}

function initCategories(): Category[] {
  const categories: Category[] = MAIN_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    parentId: null,
    createdAt: new Date().toISOString()
  }))
  const subCategories: Category[] = [
    { id: 'writing-pen', name: '钢笔', parentId: 'writing', createdAt: new Date().toISOString() },
    { id: 'writing-pencil', name: '铅笔', parentId: 'writing', createdAt: new Date().toISOString() },
    { id: 'office-paper', name: '打印纸', parentId: 'office', createdAt: new Date().toISOString() },
    { id: 'office-stapler', name: '订书机', parentId: 'office', createdAt: new Date().toISOString() },
    { id: 'art-paint', name: '颜料', parentId: 'art', createdAt: new Date().toISOString() },
    { id: 'art-brush', name: '画笔', parentId: 'art', createdAt: new Date().toISOString() }
  ]
  return [...categories, ...subCategories]
}

function initProducts(): Product[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'p1',
      name: '英雄钢笔100',
      brand: '英雄',
      categoryId: 'writing-pen',
      purchaseYear: 2024,
      stock: 50,
      unitPrice: 89.5,
      condition: 'excellent',
      shelfLifeRemaining: 365,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'p2',
      name: '晨光中性笔',
      brand: '晨光',
      categoryId: 'writing',
      purchaseYear: 2025,
      stock: 200,
      unitPrice: 2.5,
      condition: 'good',
      shelfLifeRemaining: 730,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'p3',
      name: 'A4打印纸',
      brand: '得力',
      categoryId: 'office-paper',
      purchaseYear: 2025,
      stock: 100,
      unitPrice: 25,
      condition: 'good',
      shelfLifeRemaining: 1095,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'p4',
      name: '马利水彩颜料',
      brand: '马利',
      categoryId: 'art-paint',
      purchaseYear: 2023,
      stock: 30,
      unitPrice: 45,
      condition: 'fair',
      shelfLifeRemaining: 180,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'p5',
      name: '得力订书机',
      brand: '得力',
      categoryId: 'office-stapler',
      purchaseYear: 2024,
      stock: 25,
      unitPrice: 15,
      condition: 'excellent',
      shelfLifeRemaining: 730,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'p6',
      name: '狼毫画笔套装',
      brand: '马利',
      categoryId: 'art-brush',
      purchaseYear: 2024,
      stock: 40,
      unitPrice: 68,
      condition: 'good',
      shelfLifeRemaining: 365,
      createdAt: now,
      updatedAt: now
    }
  ]
}

function initRecords(): OperationRecord[] {
  const now = new Date()
  const records: OperationRecord[] = [
    {
      id: 'r1',
      operationType: 'inbound',
      operator: '系统管理员',
      productId: 'p1',
      productName: '英雄钢笔100',
      categoryId: 'writing-pen',
      quantity: 50,
      previousStock: 0,
      newStock: 50,
      previousCondition: 'good',
      newCondition: 'excellent',
      remark: '初始入库',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r2',
      operationType: 'inbound',
      operator: '系统管理员',
      productId: 'p2',
      productName: '晨光中性笔',
      categoryId: 'writing',
      quantity: 200,
      previousStock: 0,
      newStock: 200,
      previousCondition: 'good',
      newCondition: 'good',
      remark: '批量采购入库',
      createdAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r3',
      operationType: 'outbound',
      operator: '张经理',
      productId: 'p2',
      productName: '晨光中性笔',
      categoryId: 'writing',
      quantity: 20,
      previousStock: 200,
      newStock: 180,
      previousCondition: 'good',
      newCondition: 'good',
      remark: '前台售卖',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r4',
      operationType: 'inbound',
      operator: '系统管理员',
      productId: 'p3',
      productName: 'A4打印纸',
      categoryId: 'office-paper',
      quantity: 100,
      previousStock: 0,
      newStock: 100,
      previousCondition: 'good',
      newCondition: 'good',
      remark: '办公室采购',
      createdAt: new Date(now.getTime() - 0.8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r5',
      operationType: 'outbound',
      operator: '李收银员',
      productId: 'p1',
      productName: '英雄钢笔100',
      categoryId: 'writing-pen',
      quantity: 5,
      previousStock: 50,
      newStock: 45,
      previousCondition: 'excellent',
      newCondition: 'excellent',
      remark: '个人购买',
      createdAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'r6',
      operationType: 'damaged',
      operator: '质检人员',
      productId: 'p4',
      productName: '马利水彩颜料',
      categoryId: 'art-paint',
      quantity: 2,
      previousStock: 30,
      newStock: 28,
      previousCondition: 'fair',
      newCondition: 'poor',
      remark: '发现2盒颜料已经过期，做残次下架处理',
      createdAt: new Date(now.getTime() - 0.2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
  return records
}

export function getCategories(): Category[] {
  const stored = sessionStorage.getItem(CATEGORIES_KEY)
  if (stored) return JSON.parse(stored)
  const categories = initCategories()
  sessionStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
  return categories
}

export function saveCategories(categories: Category[]): void {
  sessionStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories))
}

export function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
  const categories = getCategories()
  const newCategory: Category = {
    ...category,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  categories.push(newCategory)
  saveCategories(categories)
  return newCategory
}

export function updateCategory(id: string, data: Partial<Category>): Category | null {
  const categories = getCategories()
  const index = categories.findIndex(c => c.id === id)
  if (index === -1) return null
  categories[index] = { ...categories[index], ...data }
  saveCategories(categories)
  return categories[index]
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories()
  const products = getProducts()
  const hasProducts = products.some(p => p.categoryId === id)
  const hasSubCategories = categories.some(c => c.parentId === id)
  if (hasProducts || hasSubCategories) return false
  const filtered = categories.filter(c => c.id !== id)
  saveCategories(filtered)
  return true
}

export function getProducts(): Product[] {
  const stored = sessionStorage.getItem(PRODUCTS_KEY)
  if (stored) return JSON.parse(stored)
  const products = initProducts()
  sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  return products
}

export function saveProducts(products: Product[]): void {
  sessionStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts()
  const now = new Date().toISOString()
  const newProduct: Product = {
    ...product,
    id: generateId(),
    createdAt: now,
    updatedAt: now
  }
  products.push(newProduct)
  saveProducts(products)
  return newProduct
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = getProducts()
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() }
  saveProducts(products)
  return products[index]
}

export function deleteProduct(id: string): { success: boolean; recordCount: number } {
  const products = getProducts()
  const records = getOperationRecords()
  const recordsToDelete = records.filter(r => r.productId === id)
  
  const filteredProducts = products.filter(p => p.id !== id)
  saveProducts(filteredProducts)
  
  return {
    success: true,
    recordCount: recordsToDelete.length
  }
}

export function getRecordsByProduct(productId: string): OperationRecord[] {
  const records = getOperationRecords()
  return records.filter(r => r.productId === productId)
}

export function getOperationRecords(): OperationRecord[] {
  const stored = sessionStorage.getItem(RECORDS_KEY)
  if (stored) return JSON.parse(stored)
  const records = initRecords()
  sessionStorage.setItem(RECORDS_KEY, JSON.stringify(records))
  return records
}

export function saveOperationRecords(records: OperationRecord[]): void {
  sessionStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function addOperationRecord(record: Omit<OperationRecord, 'id' | 'createdAt'>): OperationRecord {
  const records = getOperationRecords()
  const newRecord: OperationRecord = {
    ...record,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  records.unshift(newRecord)
  saveOperationRecords(records)
  return newRecord
}

export function getCategoryName(categoryId: string): string {
  const categories = getCategories()
  const category = categories.find(c => c.id === categoryId)
  return category ? category.name : '未知分类'
}

export function getFullCategoryPath(categoryId: string): string {
  const categories = getCategories()
  const path: string[] = []
  let currentId: string | null = categoryId
  
  while (currentId) {
    const category = categories.find(c => c.id === currentId)
    if (category) {
      path.unshift(category.name)
      currentId = category.parentId
    } else {
      break
    }
  }
  
  return path.join(' > ')
}
