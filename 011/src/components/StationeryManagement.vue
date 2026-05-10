<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Stationery, Category, FilterOptions } from '@/types'
import {
  QualityLevel,
  ExpiryStatus,
  QUALITY_LEVELS,
  EXPIRY_STATUS_OPTIONS,
  CategoryType,
  CATEGORY_TYPES
} from '@/types'
import {
  categoryStorage,
  stationeryStorage,
  isHighQualityStationery,
  getExpiryStatus
} from '@/utils/storage'
import { validateStationeryForm } from '@/utils/validation'

const props = defineProps<{
  refreshKey: number
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const categories = ref<Category[]>([])
const stationeries = ref<Stationery[]>([])
const showModal = ref(false)
const editMode = ref(false)
const editingStationery = ref<Stationery | null>(null)
const successMessage = ref<string>('')

const defaultCategory = computed<CategoryType>(() => {
  const firstCat = categories.value[0]
  return firstCat?.name ?? CategoryType.笔类
})

const defaultCategoryId = computed<string>(() => {
  const firstCat = categories.value[0]
  return firstCat?.id ?? ''
})

const formData = ref({
  name: '',
  brand: '',
  categoryId: '',
  categoryName: CategoryType.笔类 as CategoryType,
  purchaseYear: new Date().getFullYear(),
  stockQuantity: 0,
  usedByClasses: [] as string[],
  qualityLevel: QualityLevel.良好 as QualityLevel,
  expiryDate: '',
  expiryDaysLeft: undefined as number | undefined,
  isHighQuality: false
})

const formErrors = ref<Record<string, string>>({})

const filters = ref<FilterOptions>({})
const showFilters = ref(false)

const expiryStatusOptions = EXPIRY_STATUS_OPTIONS

function loadData() {
  categories.value = categoryStorage.getAll()
  stationeries.value = stationeryStorage.getAll()
}

function getCategoryById(categoryId: string): Category | undefined {
  return categories.value.find((c) => c.id === categoryId)
}

function getCategoryName(categoryId: string): CategoryType | undefined {
  const category = getCategoryById(categoryId)
  return category?.name
}

const filteredStationeries = computed(() => {
  return stationeries.value.filter((s) => {
    if (filters.value.categoryId && s.categoryId !== filters.value.categoryId) {
      return false
    }

    if (filters.value.stockQuantityMin !== undefined && s.stockQuantity < filters.value.stockQuantityMin) {
      return false
    }

    if (filters.value.stockQuantityMax !== undefined && s.stockQuantity > filters.value.stockQuantityMax) {
      return false
    }

    if (filters.value.purchaseYear && s.purchaseYear !== filters.value.purchaseYear) {
      return false
    }

    if (filters.value.qualityLevel && s.qualityLevel !== filters.value.qualityLevel) {
      return false
    }

    if (filters.value.expiryStatus) {
      const status = getExpiryStatus(s.expiryDaysLeft)
      if (status !== filters.value.expiryStatus) {
        return false
      }
    }

    if (filters.value.searchKeyword) {
      const keyword = filters.value.searchKeyword.toLowerCase()
      const matches =
        s.name.toLowerCase().includes(keyword) ||
        s.brand.toLowerCase().includes(keyword) ||
        s.categoryName.toLowerCase().includes(keyword)
      if (!matches) {
        return false
      }
    }

    return true
  })
})

function showSuccess(msg: string) {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function openAddModal() {
  editMode.value = false
  editingStationery.value = null

  const firstCat = categories.value[0]
  formData.value = {
    name: '',
    brand: '',
    categoryId: firstCat?.id ?? '',
    categoryName: firstCat?.name ?? CategoryType.笔类,
    purchaseYear: new Date().getFullYear(),
    stockQuantity: 0,
    usedByClasses: [],
    qualityLevel: QualityLevel.良好,
    expiryDate: '',
    expiryDaysLeft: undefined,
    isHighQuality: false
  }
  formErrors.value = {}
  showModal.value = true
}

function openEditModal(stationery: Stationery) {
  editMode.value = true
  editingStationery.value = stationery
  formData.value = {
    name: stationery.name,
    brand: stationery.brand,
    categoryId: stationery.categoryId,
    categoryName: stationery.categoryName,
    purchaseYear: stationery.purchaseYear,
    stockQuantity: stationery.stockQuantity,
    usedByClasses: [...stationery.usedByClasses],
    qualityLevel: stationery.qualityLevel,
    expiryDate: stationery.expiryDate ?? '',
    expiryDaysLeft: stationery.expiryDaysLeft,
    isHighQuality: stationery.isHighQuality
  }
  formErrors.value = {}
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formErrors.value = {}
}

function onCategoryChange() {
  const category = getCategoryById(formData.value.categoryId)
  if (category) {
    formData.value.categoryName = category.name
  }
}

function onQualityChange() {
  formData.value.isHighQuality = isHighQualityStationery(formData.value.qualityLevel)
}

function handleSubmit() {
  const category = getCategoryById(formData.value.categoryId)
  if (!category) {
    formErrors.value.categoryId = '请选择有效的分类'
    return
  }

  const submitData: Partial<Stationery> = {
    name: formData.value.name,
    brand: formData.value.brand,
    categoryId: formData.value.categoryId,
    categoryName: category.name,
    purchaseYear: formData.value.purchaseYear,
    stockQuantity: formData.value.stockQuantity,
    usedByClasses: formData.value.usedByClasses,
    qualityLevel: formData.value.qualityLevel,
    expiryDate: formData.value.expiryDate || undefined,
    expiryDaysLeft: formData.value.expiryDate ? undefined : undefined,
    isHighQuality: isHighQualityStationery(formData.value.qualityLevel)
  }

  const validation = validateStationeryForm(submitData, editMode.value)

  if (!validation.valid) {
    formErrors.value = validation.errors
    return
  }

  if (editMode.value && editingStationery.value) {
    const success = stationeryStorage.update(editingStationery.value.id, submitData)
    if (success) {
      showSuccess('文具信息已更新')
    }
  } else {
    const addData = {
      ...submitData,
      stockQuantity: submitData.stockQuantity ?? 0,
      categoryName: category.name,
      qualityLevel: formData.value.qualityLevel
    } as Omit<Stationery, 'id' | 'createdAt' | 'updatedAt' | 'expiryDaysLeft' | 'isHighQuality'>

    stationeryStorage.add(addData)
    showSuccess('文具已添加')
  }

  loadData()
  closeModal()
  emit('updated')
}

function handleDelete(stationery: Stationery) {
  const message = `确定要删除文具"${stationery.name}"吗？\n\n库存数量: ${stationery.stockQuantity}\n品质等级: ${stationery.qualityLevel}\n\n此操作将删除所有库存和相关记录。`

  if (!confirm(message)) {
    return
  }

  const success = stationeryStorage.delete(stationery.id)
  if (success) {
    showSuccess('文具已删除')
    loadData()
    emit('updated')
  } else {
    alert('删除失败，请稍后重试')
  }
}

function clearFilters() {
  filters.value = {}
}

function getQualityBadgeClass(level: QualityLevel): string {
  switch (level) {
    case QualityLevel.优秀:
    case QualityLevel.良好:
      return 'badge-success'
    case QualityLevel.一般:
      return 'badge-warning'
    case QualityLevel.待处理:
      return 'badge-danger'
    default:
      return 'badge-info'
  }
}

function getExpiryStatusInfo(daysLeft: number | undefined): { text: string; class: string } {
  const status = getExpiryStatus(daysLeft)

  switch (status) {
    case ExpiryStatus.已过期:
      return { text: '已过期', class: 'badge-danger' }
    case ExpiryStatus.临期:
      return { text: `临期 (${daysLeft}天)`, class: 'badge-warning' }
    case ExpiryStatus.正常:
      if (daysLeft !== undefined) {
        return { text: `正常 (${daysLeft}天)`, class: 'badge-success' }
      }
      return { text: '无', class: 'badge-info' }
    default:
      return { text: '无', class: 'badge-info' }
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadData()
})

watch(
  () => props.refreshKey,
  () => {
    loadData()
  }
)
</script>

<template>
  <div class="card">
    <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
      <span>📝 文具信息管理</span>
      <div>
        <button
          class="btn btn-secondary"
          style="margin-right: 8px;"
          @click="showFilters = !showFilters"
        >
          {{ showFilters ? '隐藏筛选' : '显示筛选' }}
        </button>
        <button class="btn btn-primary" @click="openAddModal">
          + 新增文具
        </button>
      </div>
    </div>

    <div v-if="successMessage" class="alert alert-success">
      ✅ {{ successMessage }}
    </div>

    <div v-if="showFilters" class="card" style="margin-top: 10px; background: #f9fafb;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h4 style="font-weight: 600;">🔍 筛选条件</h4>
        <button class="btn btn-secondary" @click="clearFilters">清除筛选</button>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <label class="form-label">搜索关键词</label>
          <input
            type="text"
            class="form-input"
            v-model="filters.searchKeyword"
            placeholder="输入名称/品牌/分类搜索"
          />
        </div>
        <div class="filter-item">
          <label class="form-label">文具分类</label>
          <select class="form-select" v-model="filters.categoryId">
            <option value="">全部</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="form-label">品质等级</label>
          <select class="form-select" v-model="filters.qualityLevel">
            <option :value="undefined">全部</option>
            <option v-for="level in QUALITY_LEVELS" :key="level" :value="level">
              {{ level }}
            </option>
          </select>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <label class="form-label">库存最小值</label>
          <input
            type="number"
            class="form-input"
            v-model.number="filters.stockQuantityMin"
            placeholder="0"
          />
        </div>
        <div class="filter-item">
          <label class="form-label">库存最大值</label>
          <input
            type="number"
            class="form-input"
            v-model.number="filters.stockQuantityMax"
            placeholder="无限制"
          />
        </div>
        <div class="filter-item">
          <label class="form-label">入库年份</label>
          <select class="form-select" v-model.number="filters.purchaseYear">
            <option :value="undefined">全部</option>
            <option
              v-for="year in Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)"
              :key="year"
              :value="year"
            >
              {{ year }}年
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="form-label">保质期状态</label>
          <select class="form-select" v-model="filters.expiryStatus">
            <option :value="undefined">全部</option>
            <option v-for="status in expiryStatusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="filteredStationeries.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>{{ stationeries.length === 0 ? '暂无文具数据，请添加文具' : '没有匹配的文具，请调整筛选条件' }}</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>文具名称</th>
            <th>品牌</th>
            <th>分类</th>
            <th>入库年份</th>
            <th>库存数量</th>
            <th>品质等级</th>
            <th>保质期状态</th>
            <th>高品质</th>
            <th>最后更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredStationeries" :key="s.id">
            <td>
              <strong>{{ s.name }}</strong>
            </td>
            <td>{{ s.brand }}</td>
            <td>{{ s.categoryName }}</td>
            <td>{{ s.purchaseYear }}年</td>
            <td>
              <span :style="{ color: s.stockQuantity === 0 ? '#f56565' : '#333' }">
                {{ s.stockQuantity }}
              </span>
            </td>
            <td>
              <span class="badge" :class="getQualityBadgeClass(s.qualityLevel)">
                {{ s.qualityLevel }}
              </span>
            </td>
            <td>
              <span
                class="badge"
                :class="getExpiryStatusInfo(s.expiryDaysLeft).class"
              >
                {{ getExpiryStatusInfo(s.expiryDaysLeft).text }}
              </span>
            </td>
            <td>
              <span v-if="s.isHighQuality" class="high-quality">⭐ 是</span>
              <span v-else>-</span>
            </td>
            <td>{{ formatDate(s.updatedAt) }}</td>
            <td>
              <button class="btn btn-secondary" @click="openEditModal(s)">
                编辑
              </button>
              <button class="btn btn-danger" @click="handleDelete(s)">
                删除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 16px; text-align: right; color: #666; font-size: 14px;">
        共 {{ filteredStationeries.length }} / {{ stationeries.length }} 条记录
      </div>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <div class="modal-title">
          {{ editMode ? '编辑文具' : '新增文具' }}
        </div>
        <button class="modal-close" @click="closeModal">&times;</button>
      </div>

      <div class="form-group">
        <label class="form-label">文具名称 *</label>
        <input
          type="text"
          class="form-input"
          v-model="formData.name"
          placeholder="请输入文具名称（2-50个字符）"
        />
        <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">品牌 *</label>
        <input
          type="text"
          class="form-input"
          v-model="formData.brand"
          placeholder="请输入品牌"
        />
        <div v-if="formErrors.brand" class="form-error">{{ formErrors.brand }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">分类 *</label>
        <select
          class="form-select"
          v-model="formData.categoryId"
          @change="onCategoryChange"
        >
          <option value="">请选择分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <div v-if="formErrors.categoryId" class="form-error">{{ formErrors.categoryId }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">入库年份 *</label>
        <select class="form-select" v-model.number="formData.purchaseYear">
          <option
            v-for="year in Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)"
            :key="year"
            :value="year"
          >
            {{ year }}年
          </option>
        </select>
        <div v-if="formErrors.purchaseYear" class="form-error">{{ formErrors.purchaseYear }}</div>
      </div>

      <div v-if="!editMode" class="form-group">
        <label class="form-label">库存数量 *</label>
        <input
          type="number"
          class="form-input"
          v-model.number="formData.stockQuantity"
          min="0"
          max="99999"
          placeholder="0"
        />
        <div v-if="formErrors.stockQuantity" class="form-error">{{ formErrors.stockQuantity }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">品质等级 *</label>
        <select
          class="form-select"
          v-model="formData.qualityLevel"
          @change="onQualityChange"
        >
          <option v-for="level in QUALITY_LEVELS" :key="level" :value="level">
            {{ level }}
          </option>
        </select>
        <div v-if="formErrors.qualityLevel" class="form-error">{{ formErrors.qualityLevel }}</div>
      </div>

      <div v-if="formData.categoryName === CategoryType.办公耗材类" class="form-group">
        <label class="form-label">保质期 * (办公耗材类必填)</label>
        <input
          type="date"
          class="form-input"
          v-model="formData.expiryDate"
        />
        <div v-if="formErrors.expiryDate" class="form-error">{{ formErrors.expiryDate }}</div>
      </div>

      <div v-if="formData.isHighQuality" class="alert alert-warning">
        ⭐ 提示：当前品质等级为高品质文具，领用需要额外确认
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ editMode ? '保存修改' : '确认添加' }}
        </button>
      </div>
    </div>
  </div>
</template>
