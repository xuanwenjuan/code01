<template>
  <div class="product-manager">
    <div class="section-header">
      <h2>产品信息管理</h2>
      <button class="btn-primary" @click="openCreateModal">
        + 新增产品
      </button>
    </div>

    <div class="filter-panel">
      <div class="filter-row">
        <div class="filter-item">
          <label>产品分类</label>
          <select v-model="filterConditions.categoryId">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>入库年份</label>
          <select v-model="filterConditions.year">
            <option value="">全部年份</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>工艺等级</label>
          <select v-model="filterConditions.processLevel">
            <option value="">全部等级</option>
            <option v-for="level in PROCESS_LEVELS" :key="level.value" :value="level.value">
              {{ level.label }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label>关键词搜索</label>
          <input v-model="filterConditions.keyword" type="text" placeholder="名称/设计师/场景" />
        </div>
      </div>

      <div class="filter-row">
        <div class="filter-item">
          <label>库存数量</label>
          <div class="range-inputs">
            <input v-model.number="filterConditions.minStock" type="number" min="0" placeholder="最小" />
            <span>-</span>
            <input v-model.number="filterConditions.maxStock" type="number" min="0" placeholder="最大" />
          </div>
        </div>

        <div class="filter-item">
          <label>保质期剩余</label>
          <div class="range-inputs">
            <input v-model.number="filterConditions.minShelfLife" type="number" min="0" placeholder="最小" />
            <span>-</span>
            <input v-model.number="filterConditions.maxShelfLife" type="number" min="0" placeholder="最大" />
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn-default" @click="resetFilters">重置筛选</button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>产品名称</th>
            <th>设计师</th>
            <th>分类</th>
            <th>入库年限</th>
            <th>库存数量</th>
            <th>工艺等级</th>
            <th>保质期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in filteredList" :key="product.id">
            <td class="product-name">{{ product.name }}</td>
            <td>{{ product.designer }}</td>
            <td><span class="category-tag">{{ getCategoryName(product.categoryId) }}</span></td>
            <td>{{ product.year }}年</td>
            <td :class="{ 'low-stock': product.stock < 10 }">{{ product.stock }}</td>
            <td>
              <span :class="['level-tag', `level-${product.processLevel}`]">
                {{ PROCESS_LEVEL_NAMES[product.processLevel] }}
              </span>
            </td>
            <td>
              <template v-if="product.shelfLifeRemaining !== undefined">
                <span :class="{ 'warning-shelf': product.shelfLifeRemaining <= EXPIRY_WARNING_DAYS }">
                  {{ product.shelfLifeRemaining }}天
                </span>
              </template>
              <template v-else>-</template>
            </td>
            <td>
              <span :class="['status-tag', product.status === 'active' ? 'status-active' : 'status-offline']">
                {{ product.status === 'active' ? '上架中' : '已下架' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-text btn-edit" @click="openEditModal(product)">编辑</button>
              <button class="btn-text btn-delete" @click="handleDelete(product)">删除</button>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="9" class="empty-cell">暂无产品数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Transition name="slide">
      <div v-if="showModal" class="form-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingProduct ? '编辑产品' : '新增产品' }}</h3>
            <button class="close-btn" @click="closeModal">×</button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="form-grid">
              <FormField label="产品名称" required :error="formErrors.name">
                <input v-model="formData.name" type="text" placeholder="请输入产品名称" />
              </FormField>

              <FormField label="设计师" required :error="formErrors.designer">
                <input v-model="formData.designer" type="text" placeholder="请输入设计师名称" />
              </FormField>

              <FormField label="产品分类" required :error="formErrors.categoryId">
                <select v-model="formData.categoryId" @change="handleCategoryChange">
                  <option value="">请选择分类</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </FormField>

              <FormField label="入库年限" required :error="formErrors.year">
                <select v-model.number="formData.year">
                  <option :value="0">请选择年份</option>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}年
                  </option>
                </select>
              </FormField>

              <FormField label="库存数量" required :error="formErrors.stock">
                <input v-model.number="formData.stock" type="number" min="0" placeholder="请输入库存数量" />
              </FormField>

              <FormField label="工艺等级" required :error="formErrors.processLevel">
                <select v-model="formData.processLevel">
                  <option value="">请选择等级</option>
                  <option v-for="level in PROCESS_LEVELS" :key="level.value" :value="level.value">
                    {{ level.label }}
                  </option>
                </select>
              </FormField>

              <FormField label="适用场景" required :error="formErrors.scenes">
                <input v-model="formData.scenes" type="text" placeholder="如：家居、办公、收藏" />
              </FormField>

              <FormField 
                v-if="needsShelfLife" 
                label="保质期剩余（天）" 
                required 
                :error="formErrors.shelfLifeRemaining"
              >
                <input 
                  v-model.number="formData.shelfLifeRemaining" 
                  type="number" 
                  min="0" 
                  placeholder="请输入保质期天数" 
                />
              </FormField>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-default" @click="closeModal">取消</button>
              <button type="submit" class="btn-primary">
                {{ editingProduct ? '保存修改' : '确认添加' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { Product, CategoryType, ProcessLevel, ValidationRule } from '@/types'
import { useProductStore } from '@/stores/useProductStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useUIStore } from '@/stores/useUIStore'
import { PROCESS_LEVELS, PROCESS_LEVEL_NAMES, NEEDS_SHELF_LIFE, EXPIRY_WARNING_DAYS } from '@/constants'
import { validateForm } from '@/utils'
import FormField from './FormField.vue'

const { products, addProduct, updateProduct, deleteProduct, filteredProducts } = useProductStore()
const { categories, getCategoryById } = useCategoryStore()
const { showToast, confirm } = useUIStore()

const showModal = ref(false)
const editingProduct = ref<Product | null>(null)
const formErrors = reactive<Record<string, string>>({})

const currentYear = new Date().getFullYear()
const availableYears = computed(() => {
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push(y)
  }
  return years
})

const filterConditions = reactive({
  categoryId: '',
  year: undefined as number | undefined,
  processLevel: '' as ProcessLevel | '',
  minStock: undefined as number | undefined,
  maxStock: undefined as number | undefined,
  minShelfLife: undefined as number | undefined,
  maxShelfLife: undefined as number | undefined,
  keyword: ''
})

const filteredList = computed(() => {
  const conditions = {
    categoryId: filterConditions.categoryId || undefined,
    year: filterConditions.year,
    processLevel: filterConditions.processLevel || undefined,
    minStock: filterConditions.minStock,
    maxStock: filterConditions.maxStock,
    minShelfLife: filterConditions.minShelfLife,
    maxShelfLife: filterConditions.maxShelfLife,
    keyword: filterConditions.keyword || undefined
  }
  return filteredProducts.value(conditions)
})

function getCategoryName(categoryId: string): string {
  const cat = getCategoryById(categoryId)
  return cat?.name || '未知分类'
}

function resetFilters(): void {
  filterConditions.categoryId = ''
  filterConditions.year = undefined
  filterConditions.processLevel = ''
  filterConditions.minStock = undefined
  filterConditions.maxStock = undefined
  filterConditions.minShelfLife = undefined
  filterConditions.maxShelfLife = undefined
  filterConditions.keyword = ''
}

const selectedCategoryCode = computed<CategoryType | undefined>(() => {
  if (!formData.categoryId) return undefined
  const cat = getCategoryById(formData.categoryId)
  return cat?.code
})

const needsShelfLife = computed(() => {
  return selectedCategoryCode.value ? NEEDS_SHELF_LIFE.includes(selectedCategoryCode.value) : false
})

const formData = reactive({
  name: '',
  designer: '',
  categoryId: '',
  year: 0,
  stock: 0,
  processLevel: '' as ProcessLevel | '',
  scenes: '',
  shelfLifeRemaining: undefined as number | undefined
})

function handleCategoryChange(): void {
  if (!needsShelfLife.value) {
    formData.shelfLifeRemaining = undefined
  }
}

function resetForm(): void {
  formData.name = ''
  formData.designer = ''
  formData.categoryId = ''
  formData.year = 0
  formData.stock = 0
  formData.processLevel = ''
  formData.scenes = ''
  formData.shelfLifeRemaining = undefined
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
}

function openCreateModal(): void {
  editingProduct.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(product: Product): void {
  editingProduct.value = product
  formData.name = product.name
  formData.designer = product.designer
  formData.categoryId = product.categoryId
  formData.year = product.year
  formData.stock = product.stock
  formData.processLevel = product.processLevel
  formData.scenes = product.scenes
  formData.shelfLifeRemaining = product.shelfLifeRemaining
  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
  resetForm()
  editingProduct.value = null
}

const rules = computed<ValidationRule[]>(() => {
  const baseRules: ValidationRule[] = [
    { field: 'name', required: true, minLength: 2, maxLength: 50, message: '请输入2-50个字符的产品名称' },
    { field: 'designer', required: true, minLength: 2, maxLength: 30, message: '请输入2-30个字符的设计师名称' },
    { field: 'categoryId', required: true, message: '请选择产品分类' },
    { field: 'year', required: true, min: 1900, max: currentYear, message: '请选择有效的入库年份' },
    { field: 'stock', required: true, min: 0, max: 100000, message: '库存数量必须为0-100000之间的数字' },
    { field: 'processLevel', required: true, message: '请选择工艺等级' },
    { field: 'scenes', required: true, minLength: 2, maxLength: 100, message: '请输入2-100个字符的适用场景' }
  ]
  if (needsShelfLife.value) {
    baseRules.push({
      field: 'shelfLifeRemaining',
      required: true,
      min: 0,
      max: 3650,
      message: '保质期天数必须为0-3650之间的数字'
    })
  }
  return baseRules
})

function getValidationData(): Record<string, unknown> {
  return {
    name: formData.name,
    designer: formData.designer,
    categoryId: formData.categoryId,
    year: formData.year,
    stock: formData.stock,
    processLevel: formData.processLevel,
    scenes: formData.scenes,
    shelfLifeRemaining: formData.shelfLifeRemaining
  }
}

async function handleSubmit(): Promise<void> {
  const result = validateForm(getValidationData(), rules.value)

  Object.keys(formErrors).forEach(key => {
    delete formErrors[key]
  })

  if (!result.isValid) {
    Object.assign(formErrors, result.errors)
    return
  }

  const cat = getCategoryById(formData.categoryId)
  if (!cat) return

  const productData = {
    name: formData.name,
    designer: formData.designer,
    categoryId: formData.categoryId,
    categoryCode: cat.code,
    year: formData.year,
    stock: formData.stock,
    processLevel: formData.processLevel as ProcessLevel,
    scenes: formData.scenes,
    shelfLifeRemaining: formData.shelfLifeRemaining
  }

  if (editingProduct.value) {
    const success = updateProduct(editingProduct.value.id, productData)
    if (success) {
      showToast('success', '产品更新成功')
      closeModal()
    }
  } else {
    addProduct(productData)
    showToast('success', '产品添加成功')
    closeModal()
  }
}

async function handleDelete(product: Product): Promise<void> {
  const confirmed = await confirm(
    '确认删除',
    `确定要删除产品「${product.name}」吗？此操作不可恢复。`
  )

  if (confirmed) {
    const success = deleteProduct(product.id)
    if (success) {
      showToast('success', '产品删除成功')
    }
  }
}

watch(showModal, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.product-manager {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.filter-panel {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.filter-item label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.filter-item input,
.filter-item select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  width: 80px;
}

.range-inputs span {
  color: #6b7280;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.data-table th {
  background: #f9fafb;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
}

.data-table td {
  font-size: 14px;
  color: #4b5563;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.category-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 12px;
}

.low-stock {
  color: #ef4444;
  font-weight: 500;
}

.level-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-A {
  background: #fdf2f8;
  color: #9d174d;
}

.level-B {
  background: #fef3c7;
  color: #92400e;
}

.level-C {
  background: #f3f4f6;
  color: #4b5563;
}

.warning-shelf {
  color: #f59e0b;
  font-weight: 500;
}

.status-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-offline {
  background: #fee2e2;
  color: #991b1b;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-text {
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-edit {
  color: #3b82f6;
}

.btn-edit:hover {
  background: #eff6ff;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: #fef2f2;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  margin: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

form {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-default {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-default:hover {
  background: #e5e7eb;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .modal-content,
.slide-leave-to .modal-content {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }
  
  .filter-item {
    min-width: 100%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>