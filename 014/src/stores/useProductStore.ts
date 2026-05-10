import { ref, watch, computed } from 'vue'
import type { Product, FilterConditions, StockUpdateResult, ProductStatus } from '@/types'
import { productStorage } from '@/utils/storage'
import { generateId, now } from '@/utils'

const products = ref<Product[]>(productStorage.get<Product[]>([]))

function saveProducts(): void {
  productStorage.set(products.value)
}

watch(products, () => {
  saveProducts()
}, { deep: true })

function validateStockChange(change: number): { valid: boolean; message?: string } {
  if (!Number.isInteger(change)) {
    return { valid: false, message: '库存变动必须是整数' }
  }
  return { valid: true }
}

export function useProductStore() {
  const getProductById = (id: string): Product | undefined => {
    return products.value.find(p => p.id === id)
  }

  const addProduct = (product: Omit<Product, 'id' | 'isExpired' | 'status' | 'createdAt' | 'updatedAt'>): Product => {
    const validatedStock = Math.max(0, Math.floor(product.stock))
    const newProduct: Product = {
      ...product,
      stock: validatedStock,
      id: generateId(),
      isExpired: false,
      status: 'active',
      createdAt: now(),
      updatedAt: now()
    }
    products.value.push(newProduct)
    return newProduct
  }

  const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): boolean => {
    const index = products.value.findIndex(p => p.id === id)
    if (index === -1) return false
    
    const validatedUpdates: Partial<Product> = { ...updates }
    if (validatedUpdates.stock !== undefined) {
      validatedUpdates.stock = Math.max(0, Math.floor(validatedUpdates.stock))
    }
    
    products.value[index] = {
      ...products.value[index],
      ...validatedUpdates,
      updatedAt: now()
    }
    return true
  }

  const deleteProduct = (id: string): boolean => {
    const index = products.value.findIndex(p => p.id === id)
    if (index === -1) return false
    products.value.splice(index, 1)
    return true
  }

  const updateStock = (id: string, change: number): StockUpdateResult => {
    const validation = validateStockChange(change)
    if (!validation.valid) {
      return { success: false, previousStock: 0, newStock: 0 }
    }

    const index = products.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, previousStock: 0, newStock: 0 }
    }

    const product = products.value[index]
    const previousStock = product.stock
    const newStock = previousStock + change

    if (newStock < 0) {
      return { 
        success: false, 
        previousStock, 
        newStock: previousStock,
        product
      }
    }

    products.value[index] = {
      ...product,
      stock: newStock,
      updatedAt: now()
    }

    return {
      success: true,
      previousStock,
      newStock,
      product: products.value[index]
    }
  }

  const updateProductStatus = (id: string, newStatus: ProductStatus): { success: boolean; previous: ProductStatus; new: ProductStatus } => {
    const index = products.value.findIndex(p => p.id === id)
    if (index === -1) {
      return { success: false, previous: 'active', new: 'active' }
    }

    const product = products.value[index]
    const previousStatus = product.status

    if (previousStatus === newStatus) {
      return { success: false, previous: previousStatus, new: newStatus }
    }

    const isExpired = newStatus === 'offline'

    products.value[index] = {
      ...product,
      status: newStatus,
      isExpired,
      updatedAt: now()
    }

    return {
      success: true,
      previous: previousStatus,
      new: newStatus
    }
  }

  const offlineProduct = (id: string): { success: boolean; previous: ProductStatus; new: ProductStatus } => {
    return updateProductStatus(id, 'offline')
  }

  const hasProductsInCategory = (categoryId: string): boolean => {
    return products.value.some(p => p.categoryId === categoryId)
  }

  const filteredProducts = computed(() => {
    return (conditions: FilterConditions): Product[] => {
      return products.value.filter(product => {
        if (conditions.categoryId && product.categoryId !== conditions.categoryId) {
          return false
        }
        if (conditions.minStock !== undefined && product.stock < conditions.minStock) {
          return false
        }
        if (conditions.maxStock !== undefined && product.stock > conditions.maxStock) {
          return false
        }
        if (conditions.year && product.year !== conditions.year) {
          return false
        }
        if (conditions.processLevel && product.processLevel !== conditions.processLevel) {
          return false
        }
        if (conditions.minShelfLife !== undefined && product.shelfLifeRemaining !== undefined) {
          if (product.shelfLifeRemaining < conditions.minShelfLife) return false
        }
        if (conditions.maxShelfLife !== undefined && product.shelfLifeRemaining !== undefined) {
          if (product.shelfLifeRemaining > conditions.maxShelfLife) return false
        }
        if (conditions.keyword) {
          const keyword = conditions.keyword.toLowerCase()
          const matchFields = [
            product.name,
            product.designer,
            product.scenes
          ]
          if (!matchFields.some(field => field.toLowerCase().includes(keyword))) {
            return false
          }
        }
        return true
      })
    }
  })

  return {
    products,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updateProductStatus,
    offlineProduct,
    hasProductsInCategory,
    filteredProducts
  }
}
