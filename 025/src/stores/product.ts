import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { Product, FilterParams, PaginationParams, PaginatedResponse, ProductStatus } from '@/types'
import { productApi } from '@/api'
import { logApi } from '@/api'
import { emitProductAdded, emitProductUpdated, emitProductDeleted } from '@/utils/eventBus'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const pagination = reactive<PaginationParams>({ page: 1, pageSize: 10 })
  const total = ref<number>(0)
  const loading = ref<boolean>(false)
  const filterParams = reactive<FilterParams>({
    keyword: '',
    categoryId: '',
    status: '',
    stockStatus: '',
    expiryStatus: ''
  })

  const productMap = computed<Map<string, Product>>(() => {
    const map = new Map<string, Product>()
    products.value.forEach((p: Product) => map.set(p.id, p))
    return map
  })

  const stats = computed<{
    total: number
    byStatus: Map<ProductStatus, number>
    byCategory: Map<string, number>
  }>(() => {
    const result = {
      total: products.value.length,
      byStatus: new Map<ProductStatus, number>(),
      byCategory: new Map<string, number>()
    }
    products.value.forEach((p: Product) => {
      const statusCount = result.byStatus.get(p.status) || 0
      result.byStatus.set(p.status, statusCount + 1)
      const categoryCount = result.byCategory.get(p.categoryId) || 0
      result.byCategory.set(p.categoryId, categoryCount + 1)
    })
    return result
  })

  async function fetchProducts(): Promise<PaginatedResponse<Product>> {
    loading.value = true
    try {
      const result: PaginatedResponse<Product> = await productApi.getList(filterParams, pagination)
      products.value = result.list
      total.value = result.total
      return result
    } finally {
      loading.value = false
    }
  }

  async function addProduct(data: Omit<Product, 'id' | 'createTime' | 'updateTime' | 'status'>): Promise<Product> {
    const result: Product = await productApi.add(data)
    await fetchProducts()
    await logApi.add({
      operationType: 'add',
      operationTypeText: '新增',
      module: '商品管理',
      targetId: result.id,
      targetName: result.name,
      operator: '系统管理员',
      detail: `新增商品：${result.name}`,
      ip: '127.0.0.1'
    })
    emitProductAdded({ productId: result.id, productName: result.name })
    return result
  }

  async function editProduct(data: Product): Promise<Product> {
    const result: Product = await productApi.edit(data)
    await fetchProducts()
    await logApi.add({
      operationType: 'edit',
      operationTypeText: '编辑',
      module: '商品管理',
      targetId: result.id,
      targetName: result.name,
      operator: '系统管理员',
      detail: `编辑商品：${result.name}`,
      ip: '127.0.0.1'
    })
    emitProductUpdated({ productId: result.id, productName: result.name })
    return result
  }

  async function deleteProduct(id: string): Promise<boolean> {
    const product = productMap.value.get(id)
    const result: boolean = await productApi.delete(id)
    await fetchProducts()
    if (product) {
      await logApi.add({
        operationType: 'delete',
        operationTypeText: '删除',
        module: '商品管理',
        targetId: product.id,
        targetName: product.name,
        operator: '系统管理员',
        detail: `删除商品：${product.name}`,
        ip: '127.0.0.1'
      })
      emitProductDeleted({ productId: product.id, productName: product.name })
    }
    return result
  }

  function setFilterParams(params: Partial<FilterParams>): void {
    Object.assign(filterParams, params)
    pagination.page = 1
  }

  function setPagination(params: Partial<PaginationParams>): void {
    Object.assign(pagination, params)
  }

  function resetFilters(): void {
    Object.assign(filterParams, {
      keyword: '',
      categoryId: '',
      status: '',
      stockStatus: '',
      expiryStatus: ''
    })
    pagination.page = 1
  }

  return {
    products,
    pagination,
    total,
    loading,
    filterParams,
    productMap,
    stats,
    fetchProducts,
    addProduct,
    editProduct,
    deleteProduct,
    setFilterParams,
    setPagination,
    resetFilters
  }
})
