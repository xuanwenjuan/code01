<template>
  <div>
    <div v-if="expiringProducts.length > 0" class="alert alert-warning" style="margin-bottom: 20px;">
      ⚠ 有 {{ expiringProducts.length }} 件商品即将过期，请及时处理！
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="form-group">
          <label class="form-label">搜索用品</label>
          <input 
            v-model="filters.searchKeyword"
            type="text"
            class="form-input"
            placeholder="输入名称/品牌"
          />
        </div>

        <div class="form-group">
          <label class="form-label">用品分类</label>
          <select v-model="filters.categoryId" class="form-select">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">库存数量</label>
          <select v-model="filters.stockRange" class="form-select">
            <option value="">全部数量</option>
            <option value="low">库存不足 (≤ 10)</option>
            <option value="normal">正常库存 (11-100)</option>
            <option value="high">充足库存 (≥ 100)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">入库年限</label>
          <select v-model="filters.stockYear" class="form-select">
            <option value="">全部年份</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}年
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">品质等级</label>
          <select v-model="filters.qualityLevel" class="form-select">
            <option value="">全部等级</option>
            <option value="A">高品质 (A)</option>
            <option value="B">标准品质 (B)</option>
            <option value="C">一般品质 (C)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">保质期剩余</label>
          <select v-model="filters.expirationStatus" class="form-select">
            <option value="">全部状态</option>
            <option value="expiring">即将过期 (≤30天)</option>
            <option value="expired">已过期</option>
            <option value="safe">保质期充足</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">商品状态</label>
          <select v-model="filters.status" class="form-select">
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="expiring_soon">临期</option>
            <option value="removed">已下架</option>
          </select>
        </div>
      </div>

      <div class="filter-actions">
        <button class="btn btn-outline" @click="resetFilters">重置</button>
        <button class="btn btn-primary" @click="applyFilters">搜索</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用品信息管理</h2>
        <button class="btn btn-primary" @click="openAddModal">
          + 新增用品
        </button>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>用品名称</th>
              <th>品牌</th>
              <th>分类</th>
              <th>入库年限</th>
              <th>库存数量</th>
              <th>适用宠物</th>
              <th>品质等级</th>
              <th>保质期</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td>{{ product.brand }}</td>
              <td><span class="badge badge-info">{{ getCategoryName(product.categoryId) }}</span></td>
              <td>{{ product.stockYear }}</td>
              <td>
                <span :class="{ 'text-danger': product.stockQuantity <= 10 }">
                  {{ product.stockQuantity }}
                </span>
              </td>
              <td>{{ petTypeNames[product.applicablePetType] }}</td>
              <td>
                <span class="badge" :class="getQualityLevelClass(product.qualityLevel)">
                  {{ qualityLevelNames[product.qualityLevel] }}
                </span>
              </td>
              <td>
                <span v-if="product.expirationDate">
                  <span :class="getExpirationClass(product.expirationDate)">
                    {{ formatDateShort(product.expirationDate) }}
                    ({{ getExpirationDaysText(product.expirationDate) }})
                  </span>
                </span>
                <span v-else>-</span>
              </td>
              <td>
                <span class="badge" :class="getStatusClass(product.status)">
                  {{ productStatusNames[product.status] }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-outline" @click="openEditModal(product)">
                    编辑
                  </button>
                  <button 
                    class="btn btn-sm btn-danger" 
                    @click="openDeleteConfirm(product)"
                    :disabled="product.status !== 'removed'"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="10">
                <div class="empty-state">
                  <div class="empty-state-icon">📦</div>
                  <div class="empty-state-text">暂无用品数据</div>
                </div>
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
        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">用品名称</label>
            <input 
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ error: formErrors.name }"
              placeholder="请输入用品名称"
            />
            <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
          </div>

          <div class="form-group">
            <label class="form-label required">品牌</label>
            <input 
              v-model="formData.brand"
              type="text"
              class="form-input"
              :class="{ error: formErrors.brand }"
              placeholder="请输入品牌"
            />
            <div v-if="formErrors.brand" class="form-error">{{ formErrors.brand }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">分类归属</label>
            <select 
              v-model="formData.categoryId"
              class="form-select"
              :class="{ error: formErrors.categoryId }"
              @change="handleCategoryChange"
            >
              <option value="">请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div v-if="formErrors.categoryId" class="form-error">{{ formErrors.categoryId }}</div>
          </div>

          <div class="form-group">
            <label class="form-label required">入库年限</label>
            <select 
              v-model="formData.stockYear"
              class="form-select"
              :class="{ error: formErrors.stockYear }"
            >
              <option value="">请选择年份</option>
              <option v-for="year in currentYears" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
            <div v-if="formErrors.stockYear" class="form-error">{{ formErrors.stockYear }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">库存数量</label>
            <input 
              v-model.number="formData.stockQuantity"
              type="number"
              min="0"
              class="form-input"
              :class="{ error: formErrors.stockQuantity }"
              placeholder="请输入库存数量"
            />
            <div v-if="formErrors.stockQuantity" class="form-error">{{ formErrors.stockQuantity }}</div>
          </div>

          <div class="form-group">
            <label class="form-label required">适用宠物类型</label>
            <select 
              v-model="formData.applicablePetType"
              class="form-select"
              :class="{ error: formErrors.applicablePetType }"
            >
              <option value="">请选择适用宠物</option>
              <option v-for="type in petTypeOptions" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <div v-if="formErrors.applicablePetType" class="form-error">{{ formErrors.applicablePetType }}</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">品质等级</label>
            <select 
              v-model="formData.qualityLevel"
              class="form-select"
              :class="{ error: formErrors.qualityLevel }"
            >
              <option value="">请选择品质等级</option>
              <option value="A">A - 高品质</option>
              <option value="B">B - 标准品质</option>
              <option value="C">C - 一般品质</option>
            </select>
            <div v-if="formErrors.qualityLevel" class="form-error">{{ formErrors.qualityLevel }}</div>
          </div>

          <div class="form-group" v-if="needsExpirationDate">
            <label class="form-label required">保质期截止日期</label>
            <input 
              v-model="formData.expirationDate"
              type="date"
              class="form-input"
              :class="{ error: formErrors.expirationDate }"
            />
            <div v-if="formErrors.expirationDate" class="form-error">{{ formErrors.expirationDate }}</div>
          </div>
        </div>
      </form>
    </Modal>

    <ConfirmDialog
      v-model:visible="confirmDialogVisible"
      title="确认删除"
      :message="`确定要删除用品「${deleteProduct?.name}」吗？此操作不可恢复。`"
      type="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Modal from './Modal.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import { storageService } from '@/services/storage'
import { validateForm, type ValidationErrors, type ValidationRule } from '@/utils/validation'
import { formatDateShort, getDaysUntilExpiration, isExpiringSoon, isExpired } from '@/utils/date'
import { 
  petTypeNames, 
  qualityLevelNames,
  productStatusNames,
  type Category, 
  type Product, 
  type PetType, 
  type QualityLevel,
  type ProductStatus,
  type StockRangeType,
  type ExpirationStatusType
} from '@/types'
import { useToast } from '@/composables/useToast'

const { success, error: toastError, warning, info } = useToast()

const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const modalVisible = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

const confirmDialogVisible = ref(false)
const deleteProduct = ref<Product | null>(null)

const filters = reactive({
  searchKeyword: '',
  categoryId: '',
  stockRange: '' as '' | StockRangeType,
  stockYear: '',
  qualityLevel: '' as QualityLevel | '',
  expirationStatus: '' as '' | ExpirationStatusType,
  status: '' as ProductStatus | ''
})

const formData = reactive({
  name: '',
  brand: '',
  categoryId: '',
  stockYear: '' as string | number,
  stockQuantity: 0,
  applicablePetType: '' as PetType | '',
  qualityLevel: '' as QualityLevel | '',
  expirationDate: ''
})

const formErrors = reactive<ValidationErrors>({})

const currentYear = new Date().getFullYear()
const currentYears = computed(() => {
  const years = []
  for (let i = 0; i < 5; i++) {
    years.push(currentYear - i)
  }
  return years
})

const petTypeOptions = computed(() => {
  return Object.entries(petTypeNames).map(([value, label]) => ({ value, label }))
})

const availableYears = computed(() => {
  const years = new Set<number>()
  products.value.forEach(p => years.add(p.stockYear))
  return Array.from(years).sort((a, b) => b - a)
})

const needsExpirationDate = computed(() => {
  if (!formData.categoryId) return false
  const category = categories.value.find(c => c.id === formData.categoryId)
  return category && (category.code === 'food' || category.code === 'snack')
})

const expiringProducts = computed(() => {
  return products.value.filter(p => {
    if (!p.expirationDate || p.status === 'removed') return false
    return isExpiringSoon(p.expirationDate, 30) || isExpired(p.expirationDate)
  })
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (filters.searchKeyword) {
    const keyword = filters.searchKeyword.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.brand.toLowerCase().includes(keyword)
    )
  }

  if (filters.categoryId) {
    result = result.filter(p => p.categoryId === filters.categoryId)
  }

  if (filters.stockYear) {
    const year = Number(filters.stockYear)
    result = result.filter(p => p.stockYear === year)
  }

  if (filters.qualityLevel) {
    result = result.filter(p => p.qualityLevel === filters.qualityLevel)
  }

  if (filters.status) {
    result = result.filter(p => p.status === filters.status)
  }

  if (filters.stockRange) {
    result = result.filter(p => {
      const qty = p.stockQuantity
      switch (filters.stockRange) {
        case 'low': return qty <= 10
        case 'normal': return qty > 10 && qty < 100
        case 'high': return qty >= 100
        default: return true
      }
    })
  }

  if (filters.expirationStatus) {
    result = result.filter(p => {
      if (!p.expirationDate) return filters.expirationStatus === 'safe'
      const days = getDaysUntilExpiration(p.expirationDate)
      if (days === null) return false
      switch (filters.expirationStatus) {
        case 'expiring': return days >= 0 && days <= 30
        case 'expired': return days < 0
        case 'safe': return days > 30
        default: return true
      }
    })
  }

  return result
})

const getCategoryName = (categoryId: string): string => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '-'
}

const getQualityLevelClass = (level: QualityLevel): string => {
  switch (level) {
    case 'A': return 'badge-success'
    case 'B': return 'badge-info'
    case 'C': return 'badge-secondary'
    default: return 'badge-secondary'
  }
}

const getExpirationClass = (date: string): string => {
  if (isExpired(date)) return 'text-danger'
  if (isExpiringSoon(date, 30)) return 'text-warning'
  return ''
}

const getExpirationDaysText = (date: string): string => {
  const days = getDaysUntilExpiration(date)
  if (days === null) return '-'
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期'
  return `剩余 ${days} 天`
}

const getStatusClass = (status: ProductStatus): string => {
  switch (status) {
    case 'normal': return 'badge-success'
    case 'expiring_soon': return 'badge-warning'
    case 'removed': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

const handleCategoryChange = () => {
  if (!needsExpirationDate.value) {
    formData.expirationDate = ''
  }
}

const loadProducts = () => {
  categories.value = storageService.getCategories()
  products.value = storageService.getProducts()
  checkExpiringProducts()
}

const checkExpiringProducts = () => {
  products.value.forEach(product => {
    if (!product.expirationDate || product.status === 'removed') return
    
    const needsUpdate = isExpired(product.expirationDate) || isExpiringSoon(product.expirationDate, 30)
    const newStatus = isExpired(product.expirationDate) ? 'expiring_soon' : 
                      isExpiringSoon(product.expirationDate, 30) ? 'expiring_soon' : 'normal'
    
    if (needsUpdate && product.status !== newStatus) {
      storageService.updateProduct(product.id, { status: newStatus })
    }
  })
  
  if (expiringProducts.value.length > 0) {
    warning(`有 ${expiringProducts.value.length} 件商品即将过期`)
  }
}

const resetForm = () => {
  formData.name = ''
  formData.brand = ''
  formData.categoryId = ''
  formData.stockYear = ''
  formData.stockQuantity = 0
  formData.applicablePetType = ''
  formData.qualityLevel = ''
  formData.expirationDate = ''
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  isEdit.value = false
  editingId.value = null
}

const openAddModal = () => {
  resetForm()
  modalVisible.value = true
}

const openEditModal = (product: Product) => {
  resetForm()
  isEdit.value = true
  editingId.value = product.id
  formData.name = product.name
  formData.brand = product.brand
  formData.categoryId = product.categoryId
  formData.stockYear = product.stockYear
  formData.stockQuantity = product.stockQuantity
  formData.applicablePetType = product.applicablePetType
  formData.qualityLevel = product.qualityLevel
  formData.expirationDate = product.expirationDate || ''
  modalVisible.value = true
}

const openDeleteConfirm = (product: Product) => {
  if (product.status !== 'removed') {
    toastError('只有已下架的商品才能删除')
    return
  }
  deleteProduct.value = product
  confirmDialogVisible.value = true
}

const resetFilters = () => {
  filters.searchKeyword = ''
  filters.categoryId = ''
  filters.stockRange = ''
  filters.stockYear = ''
  filters.qualityLevel = ''
  filters.expirationStatus = ''
  filters.status = ''
}

const applyFilters = () => {
  info('筛选完成')
}

const validateFormData = (): boolean => {
  const rules: Record<string, ValidationRule[]> = {
    name: [{ required: true, message: '请输入用品名称' }],
    brand: [{ required: true, message: '请输入品牌' }],
    categoryId: [{ required: true, message: '请选择分类' }],
    stockYear: [{ required: true, message: '请选择入库年限' }],
    stockQuantity: [
      { required: true, message: '请输入库存数量' },
      { min: 0, message: '库存数量不能为负数' }
    ],
    applicablePetType: [{ required: true, message: '请选择适用宠物类型' }],
    qualityLevel: [{ required: true, message: '请选择品质等级' }]
  }

  if (needsExpirationDate.value) {
    rules.expirationDate = [{ required: true, message: '请输入保质期截止日期' }]
  }

  const dataToValidate = { ...formData, stockYear: Number(formData.stockYear) }
  const errors = validateForm(dataToValidate, rules)
  Object.keys(formErrors).forEach(key => delete formErrors[key])
  Object.assign(formErrors, errors)

  return Object.keys(errors).length === 0
}

const handleSubmit = () => {
  if (!validateFormData()) return

  try {
    const category = categories.value.find(c => c.id === formData.categoryId)
    if (!category) {
      toastError('分类不存在')
      return
    }

    const productData = {
      name: formData.name,
      brand: formData.brand,
      categoryId: formData.categoryId,
      categoryCode: category.code,
      stockYear: Number(formData.stockYear),
      stockQuantity: formData.stockQuantity,
      applicablePetType: formData.applicablePetType as PetType,
      qualityLevel: formData.qualityLevel as QualityLevel,
      expirationDate: formData.expirationDate || undefined
    }

    if (isEdit.value && editingId.value) {
      storageService.updateProduct(editingId.value, productData)
      success('用品更新成功')
    } else {
      storageService.addProduct(productData)
      success('用品添加成功')
    }

    loadProducts()
    modalVisible.value = false
    resetForm()
  } catch {
    toastError('操作失败，请重试')
  }
}

const handleDelete = () => {
  if (!deleteProduct.value) return

  try {
    storageService.deleteProduct(deleteProduct.value.id)
    success('用品删除成功')
    loadProducts()
    confirmDialogVisible.value = false
    deleteProduct.value = null
  } catch {
    toastError('删除失败，请重试')
  }
}

onMounted(() => {
  loadProducts()
})

defineExpose({
  loadProducts
})
</script>

<style scoped>
.text-danger {
  color: var(--danger-color);
  font-weight: 600;
}

.text-warning {
  color: var(--warning-color);
  font-weight: 600;
}
</style>