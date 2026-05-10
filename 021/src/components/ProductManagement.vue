<template>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2>产品信息管理</h2>
      <button class="btn btn-primary" @click="showAddModal">新增产品</button>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">多条件筛选查询</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">分类类型</label>
          <select v-model="filters.parentCategoryType" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="type in CATEGORY_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">具体分类</label>
          <select v-model="filters.categoryId" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">入库年限</label>
          <input
            v-model.number="filters.purchaseYear"
            type="number"
            class="input"
            placeholder="请输入年份"
            @input="onFilterChange"
          />
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">状态</label>
          <select v-model="filters.status" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="status in PRODUCT_STATUSES" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">库存区间</label>
          <div style="display: flex; gap: 5px;">
            <input v-model.number="filters.minStock" type="number" class="input" placeholder="最小" @input="onFilterChange" style="width: 50%;" />
            <input v-model.number="filters.maxStock" type="number" class="input" placeholder="最大" @input="onFilterChange" style="width: 50%;" />
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">纯度区间</label>
          <div style="display: flex; gap: 5px;">
            <input v-model.number="filters.minPurity" type="number" class="input" placeholder="最小%" @input="onFilterChange" style="width: 50%;" />
            <input v-model.number="filters.maxPurity" type="number" class="input" placeholder="最大%" @input="onFilterChange" style="width: 50%;" />
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">保质期剩余</label>
          <div style="display: flex; gap: 5px;">
            <input v-model.number="filters.minRemainingShelfLife" type="number" class="input" placeholder="最小月" @input="onFilterChange" style="width: 50%;" />
            <input v-model.number="filters.maxRemainingShelfLife" type="number" class="input" placeholder="最大月" @input="onFilterChange" style="width: 50%;" />
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">关键词搜索</label>
          <input v-model="filters.keyword" type="text" class="input" placeholder="产品名称/品牌" @input="onFilterChange" />
        </div>
      </div>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button class="btn btn-secondary" @click="resetFilters">重置筛选</button>
        <span style="color: #909399; align-self: center;">
          共 {{ filteredProducts.length }} 条记录
        </span>
      </div>
    </div>
    
    <div style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>产品名称</th>
            <th>品牌</th>
            <th>分类</th>
            <th>入库年限</th>
            <th>当前库存</th>
            <th>单价(¥)</th>
            <th>纯度(%)</th>
            <th>保质期剩余(月)</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredProducts" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.brand }}</td>
            <td>{{ product.parentCategoryName }} - {{ product.categoryName }}</td>
            <td>{{ product.purchaseYear }}</td>
            <td>
              <span :style="{ color: product.currentStock <= 10 ? '#f56c6c' : '#333' }">
                {{ product.currentStock }}
              </span>
            </td>
            <td>{{ product.unitPrice.toFixed(2) }}</td>
            <td>
              <span :class="['badge', getPurityBadgeClass(product.purity)]">
                {{ product.purity }}
              </span>
            </td>
            <td>
              <span :class="['badge', product.remainingShelfLife <= 3 ? 'badge-danger' : product.remainingShelfLife <= 6 ? 'badge-warning' : 'badge-success']">
                {{ product.remainingShelfLife }}
              </span>
            </td>
            <td>
              <span :class="['badge', getStatusBadgeClass(product.status)]">{{ product.status }}</span>
            </td>
            <td>
              <button class="btn btn-secondary" style="margin-right: 8px;" @click="showEditModal(product)">编辑</button>
              <button class="btn btn-danger" @click="handleDelete(product)">删除</button>
            </td>
          </tr>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="10" style="text-align: center; padding: 40px; color: #909399;">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ModalDialog
      :visible="modalVisible"
      :title="isEdit ? '编辑产品' : '新增产品'"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div v-if="formErrors.length > 0" style="margin-bottom: 15px; padding: 10px; background-color: #fef0f0; border-radius: 4px; color: #f56c6c;">
          <div v-for="(error, index) in formErrors" :key="index">⚠️ {{ error }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">产品名称 <span style="color: red;">*</span></label>
          <input v-model="formData.name" type="text" class="input" placeholder="请输入产品名称" />
        </div>
        
        <div class="form-group">
          <label class="form-label">品牌 <span style="color: red;">*</span></label>
          <input v-model="formData.brand" type="text" class="input" placeholder="请输入品牌" />
        </div>
        
        <div class="form-group">
          <label class="form-label">分类 <span style="color: red;">*</span></label>
          <select v-model="formData.categoryId" class="select">
            <option value="">请选择分类</option>
            <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">
              {{ cat.parentId ? '  └ ' : '' }}{{ cat.name }} ({{ cat.type }})
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">入库年限 <span style="color: red;">*</span></label>
          <input v-model.number="formData.purchaseYear" type="number" class="input" :min="1900" :max="2100" />
        </div>
        
        <div class="form-group">
          <label class="form-label">当前库存 <span style="color: red;">*</span></label>
          <input v-model.number="formData.currentStock" type="number" class="input" :min="0" />
        </div>
        
        <div class="form-group">
          <label class="form-label">单价(¥) <span style="color: red;">*</span></label>
          <input v-model.number="formData.unitPrice" type="number" class="input" :min="0" step="0.01" />
        </div>
        
        <div class="form-group">
          <label class="form-label">纯度(%) <span style="color: red;">*</span></label>
          <input v-model.number="formData.purity" type="number" class="input" :min="0" :max="100" />
          <small style="color: #909399;">
            当前等级: <span :class="['badge', getPurityBadgeClass(formData.purity)]">{{ getPurityLevel(formData.purity) }}</span>
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">保质期剩余(月) <span style="color: red;">*</span></label>
          <input v-model.number="formData.remainingShelfLife" type="number" class="input" :min="0" />
          <small v-if="formData.remainingShelfLife <= 3" style="color: #f56c6c;">
            ⚠️ 保质期≤3个月，状态将自动设为"临期"
          </small>
        </div>
        
        <div class="form-group">
          <label class="form-label">状态</label>
          <select v-model="formData.status" class="select">
            <option v-for="status in PRODUCT_STATUSES" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import ModalDialog from './ModalDialog.vue'
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  addLog,
  getOperator,
  onStorageChange,
  offStorageChange
} from '@/utils/storage'
import {
  validateProductForm,
  getPurityLevel,
  getPurityBadgeClass,
  getStatusBadgeClass,
  calculateProductStatus
} from '@/utils'
import { CATEGORY_TYPES, PRODUCT_STATUSES } from '@/types'
import type {
  Product,
  ProductCategory,
  FilterCriteria,
  CategoryType,
  ProductStatus
} from '@/types'

const products = ref<Product[]>([])
const modalVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const editingId = ref<string | null>(null)
const formErrors = ref<string[]>([])

const filters = reactive<FilterCriteria>({
  categoryId: '',
  parentCategoryType: '' as CategoryType | '',
  minStock: undefined,
  maxStock: undefined,
  purchaseYear: undefined,
  minPurity: undefined,
  maxPurity: undefined,
  minRemainingShelfLife: undefined,
  maxRemainingShelfLife: undefined,
  keyword: '',
  status: '' as ProductStatus | ''
})

const formData = ref({
  name: '',
  brand: '',
  categoryId: '',
  purchaseYear: new Date().getFullYear(),
  currentStock: 0,
  unitPrice: 0,
  purity: 90,
  remainingShelfLife: 24,
  status: '正常' as ProductStatus
})

const allCategories = computed(() => {
  return getCategories()
})

const filteredCategories = computed(() => {
  if (filters.parentCategoryType) {
    return allCategories.value.filter(cat => 
      cat.type === filters.parentCategoryType || 
      (cat.parentId && allCategories.value.find(p => p.id === cat.parentId)?.type === filters.parentCategoryType)
    )
  }
  return allCategories.value
})

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false
    }
    
    if (filters.parentCategoryType && product.parentCategoryType !== filters.parentCategoryType) {
      return false
    }
    
    if (filters.minStock !== undefined && product.currentStock < filters.minStock) {
      return false
    }
    
    if (filters.maxStock !== undefined && product.currentStock > filters.maxStock) {
      return false
    }
    
    if (filters.purchaseYear !== undefined && product.purchaseYear !== filters.purchaseYear) {
      return false
    }
    
    if (filters.minPurity !== undefined && product.purity < filters.minPurity) {
      return false
    }
    
    if (filters.maxPurity !== undefined && product.purity > filters.maxPurity) {
      return false
    }
    
    if (filters.minRemainingShelfLife !== undefined && product.remainingShelfLife < filters.minRemainingShelfLife) {
      return false
    }
    
    if (filters.maxRemainingShelfLife !== undefined && product.remainingShelfLife > filters.maxRemainingShelfLife) {
      return false
    }
    
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      if (!product.name.toLowerCase().includes(keyword) && !product.brand.toLowerCase().includes(keyword)) {
        return false
      }
    }
    
    if (filters.status && product.status !== filters.status) {
      return false
    }
    
    return true
  })
})

const loadProducts = () => {
  products.value = getProducts()
}

const getCategoryInfo = (categoryId: string): { name: string; parentName: string; parentType: CategoryType } => {
  const category = allCategories.value.find(c => c.id === categoryId)
  if (!category) {
    return { name: '', parentName: '', parentType: '护肤类' }
  }
  
  if (category.parentId) {
    const parentCategory = allCategories.value.find(c => c.id === category.parentId)
    return { 
      name: category.name, 
      parentName: parentCategory?.name || category.type,
      parentType: parentCategory?.type || category.type
    }
  }
  
  return { 
    name: category.name, 
    parentName: category.type,
    parentType: category.type
  }
}

const onFilterChange = () => {
  // 筛选变化时自动更新
}

const resetFilters = () => {
  filters.categoryId = ''
  filters.parentCategoryType = '' as CategoryType | ''
  filters.minStock = undefined
  filters.maxStock = undefined
  filters.purchaseYear = undefined
  filters.minPurity = undefined
  filters.maxPurity = undefined
  filters.minRemainingShelfLife = undefined
  filters.maxRemainingShelfLife = undefined
  filters.keyword = ''
  filters.status = '' as ProductStatus | ''
}

const showAddModal = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = {
    name: '',
    brand: '',
    categoryId: '',
    purchaseYear: new Date().getFullYear(),
    currentStock: 0,
    unitPrice: 0,
    purity: 90,
    remainingShelfLife: 24,
    status: '正常'
  }
  formErrors.value = []
  modalVisible.value = true
}

const showEditModal = (product: Product) => {
  isEdit.value = true
  editingId.value = product.id
  formData.value = {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    purchaseYear: product.purchaseYear,
    currentStock: product.currentStock,
    unitPrice: product.unitPrice,
    purity: product.purity,
    remainingShelfLife: product.remainingShelfLife,
    status: product.status
  }
  formErrors.value = []
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  submitting.value = false
  formErrors.value = []
}

const createOperationLog = (
  operationType: '入库' | '编辑' | '删除',
  product: Product,
  details: string,
  stockChange: number,
  previousStock: number,
  newStock: number,
  previousStatus: string,
  newStatus: string
) => {
  addLog({
    operator: getOperator(),
    operationType,
    productId: product.id,
    productName: product.name,
    details,
    stockChange,
    previousStock,
    newStock,
    previousStatus,
    newStatus
  })
}

const handleSubmit = () => {
  const validation = validateProductForm(formData.value)
  if (!validation.valid) {
    formErrors.value = validation.errors
    return
  }

  if (!formData.value.categoryId) {
    formErrors.value = ['请选择分类']
    return
  }

  formErrors.value = []
  submitting.value = true

  const categoryInfo = getCategoryInfo(formData.value.categoryId)
  const calculatedStatus = calculateProductStatus(formData.value.remainingShelfLife, formData.value.status)
  
  if (isEdit.value && editingId.value) {
    const oldProduct = products.value.find(p => p.id === editingId.value)
    if (!oldProduct) {
      submitting.value = false
      return
    }

    const stockChange = formData.value.currentStock - oldProduct.currentStock
    
    const updatedProduct = updateProduct(editingId.value, {
      name: formData.value.name.trim(),
      brand: formData.value.brand.trim(),
      categoryId: formData.value.categoryId,
      categoryName: categoryInfo.name,
      parentCategoryName: categoryInfo.parentName,
      parentCategoryType: categoryInfo.parentType,
      purchaseYear: formData.value.purchaseYear,
      currentStock: formData.value.currentStock,
      unitPrice: formData.value.unitPrice,
      purity: formData.value.purity,
      remainingShelfLife: formData.value.remainingShelfLife,
      status: calculatedStatus
    })

    if (updatedProduct) {
      createOperationLog(
        '编辑',
        updatedProduct,
        `编辑产品信息：${formData.value.name}`,
        stockChange,
        oldProduct.currentStock,
        formData.value.currentStock,
        oldProduct.status,
        calculatedStatus
      )

      loadProducts()
      alert('更新成功！')
    }
  } else {
    const newProduct = addProduct({
      name: formData.value.name.trim(),
      brand: formData.value.brand.trim(),
      categoryId: formData.value.categoryId,
      categoryName: categoryInfo.name,
      parentCategoryName: categoryInfo.parentName,
      parentCategoryType: categoryInfo.parentType,
      purchaseYear: formData.value.purchaseYear,
      currentStock: formData.value.currentStock,
      unitPrice: formData.value.unitPrice,
      purity: formData.value.purity,
      remainingShelfLife: formData.value.remainingShelfLife,
      status: calculatedStatus
    })

    createOperationLog(
      '入库',
      newProduct,
      `新增产品：${formData.value.name}，初始库存：${formData.value.currentStock}`,
      formData.value.currentStock,
      0,
      formData.value.currentStock,
      '',
      calculatedStatus
    )

    loadProducts()
    alert('新增成功！')
  }

  closeModal()
  submitting.value = false
}

const handleDelete = (product: Product) => {
  if (!confirm(`确定要删除产品"${product.name}"吗？此操作不可恢复！`)) {
    return
  }

  if (product.currentStock > 0) {
    if (!confirm(`⚠️ 该产品还有 ${product.currentStock} 件库存！\n确定要删除吗？`)) {
      return
    }
  }

  createOperationLog(
    '删除',
    product,
    `删除产品：${product.name}`,
    -product.currentStock,
    product.currentStock,
    0,
    product.status,
    '已删除'
  )

  deleteProduct(product.id)
  loadProducts()
  alert('删除成功！')
}

const handleStorageChange = () => {
  loadProducts()
}

onMounted(() => {
  loadProducts()
  onStorageChange('products', handleStorageChange)
})

onUnmounted(() => {
  offStorageChange('products', handleStorageChange)
})
</script>
