<template>
  <div class="product-management">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用品信息管理</h2>
        <button class="btn btn-primary" @click="openAddModal">
          + 新增用品
        </button>
      </div>
      
      <div class="filter-bar">
        <div class="filter-item">
          <label>分类：</label>
          <select v-model="filterParams.categoryId">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>安全等级：</label>
          <select v-model="filterParams.securityLevel">
            <option value="">全部等级</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>入库年份：</label>
          <input
            v-model.number="filterParams.stockYear"
            type="number"
            placeholder="年份"
            style="width: 100px;"
          />
        </div>
        
        <div class="filter-item">
          <label>库存范围：</label>
          <input
            v-model.number="filterParams.minStock"
            type="number"
            placeholder="最小"
            style="width: 80px;"
          />
          <span>-</span>
          <input
            v-model.number="filterParams.maxStock"
            type="number"
            placeholder="最大"
            style="width: 80px;"
          />
        </div>
        
        <div class="filter-item">
          <label>保质期范围：</label>
          <input
            v-model.number="filterParams.minShelfLifeDays"
            type="number"
            placeholder="最小天数"
            style="width: 100px;"
          />
          <span>-</span>
          <input
            v-model.number="filterParams.maxShelfLifeDays"
            type="number"
            placeholder="最大天数"
            style="width: 100px;"
          />
        </div>
        
        <div class="filter-item">
          <label>关键词：</label>
          <input
            v-model="filterParams.keyword"
            type="text"
            placeholder="名称/品牌"
            style="width: 150px;"
          />
        </div>
        
        <div class="filter-item">
          <button class="btn btn-primary btn-sm" @click="applyFilter">
            搜索
          </button>
          <button class="btn btn-default btn-sm" @click="resetFilter">
            重置
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>用品名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>入库年限</th>
              <th>库存数量</th>
              <th>适用月龄</th>
              <th>安全等级</th>
              <th>保质期(天)</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.brand }}</td>
              <td>
                <span class="badge badge-primary">{{ product.categoryName }}</span>
              </td>
              <td>{{ product.stockYear }}</td>
              <td>{{ product.stockQuantity }}</td>
              <td>{{ product.applicableMonths }}</td>
              <td>
                <span :class="['badge', getSecurityLevelClass(product.securityLevel)]">
                  {{ product.securityLevel }}
                </span>
              </td>
              <td>{{ product.shelfLifeDays }}</td>
              <td>
                <span :class="['badge', getStatusClass(product.status)]">
                  {{ product.status }}
                </span>
              </td>
              <td>
                <button class="btn btn-sm btn-default" @click="openEditModal(product)">
                  编辑
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  style="margin-left: 8px;"
                  @click="confirmDelete(product)"
                >
                  删除
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-color-secondary);">
                暂无用品数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal
      v-model:visible="modalVisible"
      :title="isEdit ? '编辑用品' : '新增用品'"
      size="lg"
      @confirm="handleSubmit"
    >
      <form @submit.prevent="handleSubmit">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px;">
          <div class="input-group">
            <label>用品名称 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="请输入用品名称"
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>
          
          <div class="input-group">
            <label>品牌 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model="formData.brand"
              type="text"
              placeholder="请输入品牌名称"
              :class="{ error: errors.brand }"
            />
            <span v-if="errors.brand" class="error-message">{{ errors.brand }}</span>
          </div>
          
          <div class="input-group">
            <label>分类 <span style="color: var(--danger-color);">*</span></label>
            <select
              v-model="formData.categoryId"
              :class="{ error: errors.categoryId }"
              @change="updateCategoryName"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <span v-if="errors.categoryId" class="error-message">{{ errors.categoryId }}</span>
          </div>
          
          <div class="input-group">
            <label>入库年限 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model.number="formData.stockYear"
              type="number"
              placeholder="请输入入库年份"
              :class="{ error: errors.stockYear }"
            />
            <span v-if="errors.stockYear" class="error-message">{{ errors.stockYear }}</span>
          </div>
          
          <div class="input-group">
            <label>库存数量 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model.number="formData.stockQuantity"
              type="number"
              placeholder="请输入库存数量"
              :class="{ error: errors.stockQuantity }"
            />
            <span v-if="errors.stockQuantity" class="error-message">{{ errors.stockQuantity }}</span>
          </div>
          
          <div class="input-group">
            <label>适用月龄 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model="formData.applicableMonths"
              type="text"
              placeholder="例如：0-6个月"
              :class="{ error: errors.applicableMonths }"
            />
            <span v-if="errors.applicableMonths" class="error-message">{{ errors.applicableMonths }}</span>
          </div>
          
          <div class="input-group">
            <label>安全等级 <span style="color: var(--danger-color);">*</span></label>
            <select
              v-model="formData.securityLevel"
              :class="{ error: errors.securityLevel }"
            >
              <option value="">请选择安全等级</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
            <span v-if="errors.securityLevel" class="error-message">{{ errors.securityLevel }}</span>
          </div>
          
          <div class="input-group">
            <label>保质期天数 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model.number="formData.shelfLifeDays"
              type="number"
              placeholder="请输入保质期天数"
              :class="{ error: errors.shelfLifeDays }"
            />
            <span v-if="errors.shelfLifeDays" class="error-message">{{ errors.shelfLifeDays }}</span>
          </div>
          
          <div class="input-group">
            <label>生产日期 <span style="color: var(--danger-color);">*</span></label>
            <input
              v-model="formData.productionDate"
              type="date"
              :class="{ error: errors.productionDate }"
            />
            <span v-if="errors.productionDate" class="error-message">{{ errors.productionDate }}</span>
          </div>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      v-model:visible="confirmVisible"
      title="删除确认"
      :message="`确定要删除用品「${deleteProduct?.name}」吗？所有相关记录也将保留。`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Modal from './common/Modal.vue'
import ConfirmDialog from './common/ConfirmDialog.vue'
import type { Category, Product, FormError, FilterParams, SecurityLevel, ProductStatus, ProductFormData } from '../types'
import { getCategories, getProducts, addProduct, updateProduct, deleteProduct as deleteProductFromStorage, filterProducts } from '../utils/storage'
import { validateForm, productValidationRules } from '../utils/validation'
import { state, getToast, loadCategories, loadProducts, notifyDataUpdated } from '../store'

const emit = defineEmits<{
  (e: 'update'): void
}>()

const toast = getToast()

const modalVisible = ref<boolean>(false)
const confirmVisible = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const editId = ref<string | null>(null)
const deleteProduct = ref<Product | null>(null)

const categories = computed(() => state.categories)
const products = computed(() => state.products)

const filterParams = ref<FilterParams>({
  categoryId: '',
  securityLevel: undefined,
  stockYear: undefined,
  minStock: undefined,
  maxStock: undefined,
  minShelfLifeDays: undefined,
  maxShelfLifeDays: undefined,
  keyword: ''
})

const filteredProducts = computed(() => {
  const params: FilterParams = {}
  if (filterParams.value.categoryId) params.categoryId = filterParams.value.categoryId
  if (filterParams.value.securityLevel) params.securityLevel = filterParams.value.securityLevel as SecurityLevel
  if (filterParams.value.stockYear) params.stockYear = filterParams.value.stockYear
  if (filterParams.value.minStock !== undefined) params.minStock = filterParams.value.minStock
  if (filterParams.value.maxStock !== undefined) params.maxStock = filterParams.value.maxStock
  if (filterParams.value.minShelfLifeDays !== undefined) params.minShelfLifeDays = filterParams.value.minShelfLifeDays
  if (filterParams.value.maxShelfLifeDays !== undefined) params.maxShelfLifeDays = filterParams.value.maxShelfLifeDays
  if (filterParams.value.keyword) params.keyword = filterParams.value.keyword
  
  return filterProducts(params)
})

const formData = ref<ProductFormData>({
  name: '',
  brand: '',
  categoryId: '',
  categoryName: '',
  stockYear: new Date().getFullYear(),
  stockQuantity: 0,
  applicableMonths: '',
  securityLevel: '' as SecurityLevel | '',
  shelfLifeDays: 0,
  productionDate: ''
})

const errors = ref<FormError>({})

function getSecurityLevelClass(level: SecurityLevel): string {
  switch (level) {
    case '高': return 'badge-danger'
    case '中': return 'badge-warning'
    case '低': return 'badge-info'
    default: return 'badge-info'
  }
}

function getStatusClass(status: ProductStatus): string {
  switch (status) {
    case '正常': return 'badge-success'
    case '临期': return 'badge-warning'
    case '已下架': return 'badge-danger'
    default: return 'badge-info'
  }
}

function loadData(): void {
  loadCategories()
  loadProducts()
}

function resetForm(): void {
  formData.value = {
    name: '',
    brand: '',
    categoryId: '',
    categoryName: '',
    stockYear: new Date().getFullYear(),
    stockQuantity: 0,
    applicableMonths: '',
    securityLevel: '' as SecurityLevel | '',
    shelfLifeDays: 0,
    productionDate: ''
  }
  errors.value = {}
  isEdit.value = false
  editId.value = null
}

function openAddModal(): void {
  resetForm()
  modalVisible.value = true
}

function openEditModal(product: Product): void {
  resetForm()
  isEdit.value = true
  editId.value = product.id
  formData.value = {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    stockYear: product.stockYear,
    stockQuantity: product.stockQuantity,
    applicableMonths: product.applicableMonths,
    securityLevel: product.securityLevel,
    shelfLifeDays: product.shelfLifeDays,
    productionDate: product.productionDate
  }
  modalVisible.value = true
}

function updateCategoryName(): void {
  const category = categories.value.find((c: Category) => c.id === formData.value.categoryId)
  if (category) {
    formData.value.categoryName = category.name
  }
}

function confirmDelete(product: Product): void {
  deleteProduct.value = product
  confirmVisible.value = true
}

function handleSubmit(): void {
  updateCategoryName()
  
  const dataToValidate = {
    ...formData.value,
    categoryId: formData.value.categoryId || '',
    securityLevel: formData.value.securityLevel || ''
  }
  
  const validationErrors = validateForm<Record<string, unknown>>(dataToValidate, productValidationRules)
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    toast.error('请检查表单填写是否正确')
    return
  }

  const productData = {
    ...formData.value,
    securityLevel: formData.value.securityLevel as SecurityLevel
  }

  if (isEdit.value && editId.value) {
    updateProduct(editId.value, productData)
    toast.success('用品更新成功')
  } else {
    addProduct(productData)
    toast.success('用品添加成功')
  }

  modalVisible.value = false
  loadData()
  notifyDataUpdated()
  emit('update')
}

function handleDelete(): void {
  if (!deleteProduct.value) return
  
  deleteProductFromStorage(deleteProduct.value.id)
  toast.success('用品删除成功')
  
  confirmVisible.value = false
  deleteProduct.value = null
  loadData()
  notifyDataUpdated()
  emit('update')
}

function applyFilter(): void {
  toast.info('筛选条件已应用')
}

function resetFilter(): void {
  filterParams.value = {
    categoryId: '',
    securityLevel: undefined,
    stockYear: undefined,
    minStock: undefined,
    maxStock: undefined,
    minShelfLifeDays: undefined,
    maxShelfLifeDays: undefined,
    keyword: ''
  }
}

onMounted(() => {
  loadData()
})

defineExpose({
  loadData
})
</script>

<style scoped>
.product-management {
  padding: 0;
}

.filter-bar {
  align-items: center;
}

.filter-item span {
  margin: 0 4px;
}
</style>
