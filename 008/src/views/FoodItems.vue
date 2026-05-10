<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useFoodItemStore } from '@/stores/foodItem'
import { useCategoryStore } from '@/stores/category'
import { validateForm, commonRules } from '@/utils/validation'
import type { FoodItem, FilterOptions, ExpiryStatus } from '@/types'
import {
  getFreshnessLabel,
  getStorageConditionOptions,
  getFreshnessBadgeClass,
  getExpiryStatus,
  formatDateOnly
} from '@/utils/storage'
import ModalDialog from '@/components/ModalDialog.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const foodItemStore = useFoodItemStore()
const categoryStore = useCategoryStore()

const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const editingItem = ref<FoodItem | null>(null)

const today = formatDateOnly(new Date())

const form = reactive({
  name: '',
  origin: '',
  categoryId: '',
  entryYear: new Date().getFullYear(),
  entryDate: today,
  stockQuantity: 0,
  storageCondition: '',
  freshnessLevel: 'good',
  totalShelfLife: 30
})

const errors = reactive({
  name: '',
  origin: '',
  categoryId: '',
  entryYear: '',
  entryDate: '',
  stockQuantity: '',
  storageCondition: '',
  freshnessLevel: '',
  totalShelfLife: ''
})

const filterOptions = reactive<FilterOptions>({
  searchKeyword: '',
  categoryId: undefined,
  minStock: undefined,
  maxStock: undefined,
  minEntryYear: undefined,
  maxEntryYear: undefined,
  freshnessLevel: undefined,
  expiryStatus: undefined
})

const deleteTarget = ref<FoodItem | null>(null)
const storageConditions = getStorageConditionOptions()

const freshnessOptions = [
  { value: 'excellent', label: '极佳' },
  { value: 'good', label: '良好' },
  { value: 'normal', label: '一般' },
  { value: 'low', label: '较差' }
]

const expiryStatusOptions = [
  { value: undefined, label: '全部' },
  { value: 'normal' as ExpiryStatus, label: '正常' },
  { value: 'nearly-expired' as ExpiryStatus, label: '临期' },
  { value: 'expired' as ExpiryStatus, label: '已过期' }
]

const filteredItems = computed(() => {
  return foodItemStore.filterItems(filterOptions)
})

function resetForm() {
  form.name = ''
  form.origin = ''
  form.categoryId = categoryStore.categories[0]?.id || ''
  form.entryYear = new Date().getFullYear()
  form.entryDate = today
  form.stockQuantity = 0
  form.storageCondition = ''
  form.freshnessLevel = 'good'
  form.totalShelfLife = 30
  
  Object.keys(errors).forEach(key => {
    (errors as Record<string, string>)[key] = ''
  })
}

function addItem() {
  resetForm()
  editingItem.value = null
  showEditModal.value = true
}

function editItem(item: FoodItem) {
  form.name = item.name
  form.origin = item.origin
  form.categoryId = item.categoryId
  form.entryYear = item.entryYear
  form.entryDate = item.entryDate
  form.stockQuantity = item.stockQuantity
  form.storageCondition = item.storageCondition
  form.freshnessLevel = item.freshnessLevel
  form.totalShelfLife = item.totalShelfLife
  editingItem.value = item
  showEditModal.value = true
}

function handleConfirmDelete() {
  if (deleteTarget.value) {
    foodItemStore.deleteFoodItem(deleteTarget.value.id)
    deleteTarget.value = null
    showDeleteConfirm.value = false
  }
}

function deleteItem(item: FoodItem) {
  deleteTarget.value = item
  showDeleteConfirm.value = true
}

function handleSubmit() {
  const validation = validateForm([
    { name: 'name', value: form.name, rules: commonRules.name() },
    { name: 'origin', value: form.origin, rules: commonRules.origin() },
    { name: 'categoryId', value: form.categoryId, rules: [{ required: true, message: '请选择分类' }] },
    { name: 'entryYear', value: form.entryYear, rules: commonRules.year() },
    { name: 'entryDate', value: form.entryDate, rules: [{ required: true, message: '请选择入库日期' }] },
    { name: 'stockQuantity', value: form.stockQuantity, rules: commonRules.quantity(0) },
    { name: 'storageCondition', value: form.storageCondition, rules: [{ required: true, message: '请选择存储条件' }] },
    { name: 'freshnessLevel', value: form.freshnessLevel, rules: [{ required: true, message: '请选择新鲜等级' }] },
    { name: 'totalShelfLife', value: form.totalShelfLife, rules: commonRules.shelfLife() }
  ])
  
  Object.keys(errors).forEach(key => {
    (errors as Record<string, string>)[key] = ''
  })
  
  Object.keys(validation.errors).forEach(key => {
    (errors as Record<string, string>)[key] = validation.errors[key]
  })
  
  if (!validation.isValid) return
  
  if (editingItem.value) {
    foodItemStore.updateFoodItem(editingItem.value.id, { ...form })
  } else {
    foodItemStore.addFoodItem({ ...form })
  }
  
  showEditModal.value = false
}

function resetFilters() {
  filterOptions.searchKeyword = ''
  filterOptions.categoryId = undefined
  filterOptions.minStock = undefined
  filterOptions.maxStock = undefined
  filterOptions.minEntryYear = undefined
  filterOptions.maxEntryYear = undefined
  filterOptions.freshnessLevel = undefined
  filterOptions.expiryStatus = undefined
}

watch(showEditModal, (val) => {
  if (!val) {
    resetForm()
    editingItem.value = null
  }
})
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">🥬 食材信息管理</h1>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline" @click="foodItemStore.initializeSampleData">
          初始化示例数据
        </button>
        <button class="btn btn-primary" @click="addItem">
          + 新增食材
        </button>
      </div>
    </header>
    <div class="page-body">
      <div class="filter-section">
        <div class="filter-row">
          <div class="filter-item" style="min-width: 250px;">
            <label class="form-label">关键词搜索</label>
            <input
              type="text"
              class="form-input"
              v-model="filterOptions.searchKeyword"
              placeholder="搜索食材名称、产地、分类..."
            />
          </div>
          
          <div class="filter-item">
            <label class="form-label">分类</label>
            <select
              class="form-select"
              v-model="filterOptions.categoryId"
            >
              <option :value="undefined">全部分类</option>
              <option
                v-for="cat in categoryStore.categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>
          
          <div class="filter-item">
            <label class="form-label">库存范围</label>
            <div style="display: flex; gap: 4px;">
              <input
                type="number"
                class="form-input"
                v-model.number="filterOptions.minStock"
                placeholder="最小"
                style="flex: 1;"
              />
              <span style="line-height: 38px; color: var(--text-muted);">-</span>
              <input
                type="number"
                class="form-input"
                v-model.number="filterOptions.maxStock"
                placeholder="最大"
                style="flex: 1;"
              />
            </div>
          </div>
          
          <div class="filter-item">
            <label class="form-label">新鲜等级</label>
            <select
              class="form-select"
              v-model="filterOptions.freshnessLevel"
            >
              <option :value="undefined">全部等级</option>
              <option
                v-for="opt in freshnessOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-item">
            <label class="form-label">过期状态</label>
            <select
              class="form-select"
              v-model="filterOptions.expiryStatus"
            >
              <option
                v-for="opt in expiryStatusOptions"
                :key="String(opt.value)"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-outline" @click="resetFilters">
              重置筛选
            </button>
          </div>
        </div>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; color: var(--text-secondary);">
          <span>共 {{ filteredItems.length }} 条记录</span>
          <span v-if="foodItemStore.expiredItems.length > 0" style="color: var(--danger-color);">
            ⚠️ {{ foodItemStore.expiredItems.length }} 种已过期
          </span>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>食材名称</th>
                <th>产地</th>
                <th>分类</th>
                <th>入库日期</th>
                <th>库存数量</th>
                <th>存储条件</th>
                <th>新鲜等级</th>
                <th>保质期</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredItems"
                :key="item.id"
                :style="{ backgroundColor: item.remainingDays <= 0 ? '#fef2f2' : 'inherit' }"
              >
                <td :style="{ fontWeight: 600 }">{{ item.name }}</td>
                <td>{{ item.origin }}</td>
                <td>
                  <span class="badge badge-primary">{{ item.categoryName }}</span>
                </td>
                <td>{{ item.entryDate }}</td>
                <td>
                  <span :style="{ color: item.stockQuantity <= 10 ? 'var(--danger-color)' : 'inherit' }">
                    {{ item.stockQuantity }}
                  </span>
                </td>
                <td>{{ item.storageCondition }}</td>
                <td>
                  <span class="badge" :class="getFreshnessBadgeClass(item.freshnessLevel)">
                    {{ getFreshnessLabel(item.freshnessLevel) }}
                  </span>
                </td>
                <td>
                  {{ item.remainingDays }} / {{ item.totalShelfLife }} 天
                </td>
                <td>
                  <span class="badge" :class="getExpiryStatus(item.remainingDays).badgeClass">
                    {{ getExpiryStatus(item.remainingDays).status }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-sm btn-primary" @click="editItem(item)">
                      编辑
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      @click="deleteItem(item)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">🥬</div>
          <div class="empty-text">暂无食材数据</div>
        </div>
      </div>
    </div>

    <ModalDialog
      v-model:visible="showEditModal"
      :title="editingItem ? '编辑食材' : '新增食材'"
      width="700px"
    >
      <div class="filter-row">
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">食材名称 <span style="color: red;">*</span></label>
            <input
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              v-model="form.name"
              placeholder="如：大白菜、红富士苹果"
            />
            <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
          </div>
        </div>
        
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">产地 <span style="color: red;">*</span></label>
            <input
              type="text"
              class="form-input"
              :class="{ error: errors.origin }"
              v-model="form.origin"
              placeholder="如：山东、陕西"
            />
            <div v-if="errors.origin" class="form-error">{{ errors.origin }}</div>
          </div>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">分类 <span style="color: red;">*</span></label>
            <select
              class="form-select"
              :class="{ error: errors.categoryId }"
              v-model="form.categoryId"
            >
              <option value="">请选择分类</option>
              <option
                v-for="cat in categoryStore.categories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
            <div v-if="errors.categoryId" class="form-error">{{ errors.categoryId }}</div>
          </div>
        </div>
        
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">入库日期 <span style="color: red;">*</span></label>
            <input
              type="date"
              class="form-input"
              :class="{ error: errors.entryDate }"
              v-model="form.entryDate"
            />
            <div v-if="errors.entryDate" class="form-error">{{ errors.entryDate }}</div>
          </div>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">库存数量 <span style="color: red;">*</span></label>
            <input
              type="number"
              class="form-input"
              :class="{ error: errors.stockQuantity }"
              v-model.number="form.stockQuantity"
              min="0"
              placeholder="请输入库存数量"
            />
            <div v-if="errors.stockQuantity" class="form-error">{{ errors.stockQuantity }}</div>
          </div>
        </div>
        
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">保质期(天) <span style="color: red;">*</span></label>
            <input
              type="number"
              class="form-input"
              :class="{ error: errors.totalShelfLife }"
              v-model.number="form.totalShelfLife"
              min="1"
              placeholder="总保质期天数"
            />
            <div v-if="errors.totalShelfLife" class="form-error">{{ errors.totalShelfLife }}</div>
          </div>
        </div>
      </div>
      
      <div class="filter-row">
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">存储条件 <span style="color: red;">*</span></label>
            <select
              class="form-select"
              :class="{ error: errors.storageCondition }"
              v-model="form.storageCondition"
            >
              <option value="">请选择存储条件</option>
              <option
                v-for="cond in storageConditions"
                :key="cond"
                :value="cond"
              >
                {{ cond }}
              </option>
            </select>
            <div v-if="errors.storageCondition" class="form-error">{{ errors.storageCondition }}</div>
          </div>
        </div>
        
        <div class="filter-item">
          <div class="form-group">
            <label class="form-label">新鲜等级 <span style="color: red;">*</span></label>
            <select
              class="form-select"
              :class="{ error: errors.freshnessLevel }"
              v-model="form.freshnessLevel"
            >
              <option value="">请选择新鲜等级</option>
              <option
                v-for="opt in freshnessOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
            <div v-if="errors.freshnessLevel" class="form-error">{{ errors.freshnessLevel }}</div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <button class="btn btn-outline" @click="showEditModal = false">
          取消
        </button>
        <button class="btn btn-primary" @click="handleSubmit">
          {{ editingItem ? '保存修改' : '添加食材' }}
        </button>
      </template>
    </ModalDialog>

    <ConfirmDialog
      v-model:visible="showDeleteConfirm"
      title="删除确认"
      :message="`确定要删除食材「${deleteTarget?.name}」吗？删除后无法恢复。`"
      type="danger"
      confirmText="删除"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>
