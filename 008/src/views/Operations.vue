<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useFoodItemStore } from '@/stores/foodItem'
import { useCategoryStore } from '@/stores/category'
import { validateForm } from '@/utils/validation'
import type { OperationType, ValidationRule } from '@/types'
import { getFreshnessLabel, getOperationTypeLabel } from '@/utils/storage'
import ModalDialog from '@/components/ModalDialog.vue'

const foodItemStore = useFoodItemStore()
const categoryStore = useCategoryStore()

const activeTab = ref<'stock-in' | 'stock-out' | 'expired-process'>('stock-in')

const showOperationModal = ref(false)
const selectedFoodItem = ref<{ id: string; name: string; stockQuantity: number } | null>(null)

const operationForm = reactive({
  quantity: 1,
  operator: '',
  notes: ''
})

const errors = reactive({
  quantity: '',
  operator: '',
  notes: ''
})

const operationRules: Record<string, ValidationRule[]> = {
  quantity: [
    { required: true, message: '数量不能为空' },
    { min: 1, message: '数量必须大于0' }
  ],
  operator: [
    { required: true, message: '经办人不能为空' },
    { minLength: 2, message: '经办人姓名至少2个字符' }
  ],
  notes: [
    { maxLength: 100, message: '备注不能超过100个字符' }
  ]
}

const availableItems = computed(() => {
  if (activeTab.value === 'expired-process') {
    return foodItemStore.foodItems.filter(item => 
      (item.remainingDays <= 7 && item.remainingDays > 0) || item.freshnessLevel === 'low'
    )
  }
  return foodItemStore.foodItems
})

const lowStockItems = computed(() => {
  return foodItemStore.foodItems.filter(item => item.stockQuantity <= 10)
})

const nearlyExpiredItems = computed(() => {
  return foodItemStore.foodItems.filter(item => item.remainingDays <= 7 && item.remainingDays > 0)
})

const lowFreshnessItems = computed(() => {
  return foodItemStore.foodItems.filter(item => item.freshnessLevel === 'low')
})

const getOperationTitle = () => {
  const labels: Record<string, string> = {
    'stock-in': '入库登记',
    'stock-out': '出库领用',
    'expired-process': '临期处理'
  }
  return labels[activeTab.value] || '操作'
}

const getRemainingDaysBadge = (days: number) => {
  if (days <= 0) return 'badge-danger'
  if (days <= 3) return 'badge-warning'
  if (days <= 7) return 'badge-info'
  return 'badge-success'
}

const getFreshnessBadge = (level: string) => {
  const badges: Record<string, string> = {
    excellent: 'badge-success',
    good: 'badge-primary',
    normal: 'badge-info',
    low: 'badge-warning'
  }
  return badges[level] || 'badge-info'
}

function resetForm() {
  operationForm.quantity = 1
  operationForm.operator = ''
  operationForm.notes = ''
  errors.quantity = ''
  errors.operator = ''
  errors.notes = ''
}

function openOperation(item: { id: string; name: string; stockQuantity: number }) {
  selectedFoodItem.value = item
  operationForm.quantity = 1
  if (activeTab.value === 'stock-out' || activeTab.value === 'expired-process') {
    operationForm.quantity = Math.min(1, item.stockQuantity)
  }
  errors.quantity = ''
  errors.operator = ''
  errors.notes = ''
  showOperationModal.value = true
}

function handleSubmit() {
  if (!selectedFoodItem.value) return
  
  const validationErrors = validateForm([
    { name: 'quantity', value: operationForm.quantity, rules: operationRules.quantity },
    { name: 'operator', value: operationForm.operator, rules: operationRules.operator },
    { name: 'notes', value: operationForm.notes, rules: operationRules.notes }
  ])
  
  errors.quantity = validationErrors.quantity || ''
  errors.operator = validationErrors.operator || ''
  errors.notes = validationErrors.notes || ''
  
  if (Object.keys(validationErrors).length > 0) return
  
  let result: { success: boolean } = { success: false }
  
  switch (activeTab.value) {
    case 'stock-in':
      result = foodItemStore.stockIn(
        selectedFoodItem.value.id,
        operationForm.quantity,
        operationForm.operator,
        operationForm.notes
      )
      break
    case 'stock-out':
      result = foodItemStore.stockOut(
        selectedFoodItem.value.id,
        operationForm.quantity,
        operationForm.operator,
        operationForm.notes
      )
      break
    case 'expired-process':
      result = foodItemStore.processExpired(
        selectedFoodItem.value.id,
        operationForm.quantity,
        operationForm.operator,
        operationForm.notes
      )
      break
  }
  
  if (result.success) {
    showOperationModal.value = false
  }
}

watch(activeTab, () => {
  resetForm()
})

watch(showOperationModal, (val) => {
  if (!val) {
    selectedFoodItem.value = null
    resetForm()
  }
})
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">📦 食材出入库管理</h1>
    </header>
    <div class="page-body">
      <div class="card">
        <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
          <button
            class="btn"
            :class="activeTab === 'stock-in' ? 'btn-success' : 'btn-outline'"
            @click="activeTab = 'stock-in'"
          >
            ➕ 入库登记
          </button>
          <button
            class="btn"
            :class="activeTab === 'stock-out' ? 'btn-primary' : 'btn-outline'"
            @click="activeTab = 'stock-out'"
          >
            ➖ 出库领用
          </button>
          <button
            class="btn"
            :class="activeTab === 'expired-process' ? 'btn-warning' : 'btn-outline'"
            @click="activeTab = 'expired-process'"
          >
            ⚠️ 临期处理
          </button>
        </div>

        <div v-if="activeTab === 'stock-in'">
          <div class="card-header" style="margin-bottom: 16px;">
            <span class="card-title">📥 入库登记</span>
          </div>
        </div>
        
        <div v-if="activeTab === 'stock-out'">
          <div class="card-header" style="margin-bottom: 16px;">
            <span class="card-title">📤 出库领用</span>
          </div>
          <div v-if="lowStockItems.length > 0" class="filter-section" style="background-color: #fff7ed; border-color: #fed7aa;">
            <div style="color: #92400e; font-weight: 500; margin-bottom: 8px;">⚠️ 库存不足提醒</div>
            <div style="color: #78350f; font-size: 14px;">
              以下食材库存不足10件：{{ lowStockItems.map(i => i.name).join('、') }}
            </div>
          </div>
        </div>
        
        <div v-if="activeTab === 'expired-process'">
          <div class="card-header" style="margin-bottom: 16px;">
            <span class="card-title">⚠️ 临期处理</span>
          </div>
          <div v-if="nearlyExpiredItems.length > 0 || lowFreshnessItems.length > 0" class="filter-section" style="background-color: #fef3c7; border-color: #fcd34d;">
            <div style="color: #92400e; font-weight: 500; margin-bottom: 8px;">⚠️ 需要处理的食材</div>
            <div style="color: #78350f; font-size: 14px;">
              <template v-if="nearlyExpiredItems.length > 0">
                临期食材（7天内）：{{ nearlyExpiredItems.length }} 件
              </template>
              <template v-if="lowFreshnessItems.length > 0">
                <br />低新鲜度食材：{{ lowFreshnessItems.length }} 件
              </template>
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>食材名称</th>
                <th>分类</th>
                <th>产地</th>
                <th>当前库存</th>
                <th>新鲜等级</th>
                <th>剩余保质期</th>
                <th>存储条件</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in availableItems" :key="item.id">
                <td>{{ item.name }}</td>
                <td>
                  <span class="badge badge-primary">{{ item.categoryName }}</span>
                </td>
                <td>{{ item.origin }}</td>
                <td :style="{ fontWeight: item.stockQuantity <= 10 ? 600 : 'normal' }">
                  <span :style="{ color: item.stockQuantity <= 10 ? 'var(--danger-color)' : 'inherit' }">
                    {{ item.stockQuantity }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getFreshnessBadge(item.freshnessLevel)">
                    {{ getFreshnessLabel(item.freshnessLevel) }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="getRemainingDaysBadge(item.remainingDays)">
                    {{ item.remainingDays }} 天
                  </span>
                </td>
                <td>{{ item.storageCondition }}</td>
                <td>
                  <button
                    class="btn btn-sm"
                    :class="{
                      'btn-success': activeTab === 'stock-in',
                      'btn-primary': activeTab === 'stock-out',
                      'btn-warning': activeTab === 'expired-process'
                    }"
                    @click="openOperation(item)"
                  >
                    {{ getOperationTitle() }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div v-if="availableItems.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-text">
            {{ activeTab === 'expired-process' ? '暂无需要处理的食材' : '暂无可用食材' }}
          </div>
        </div>
      </div>
    </div>

    <ModalDialog
      v-model:visible="showOperationModal"
      :title="getOperationTitle()"
      width="500px"
    >
      <div v-if="selectedFoodItem" class="filter-section" style="background-color: var(--bg-gray-50); margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; gap: 20px;">
          <div>
            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">食材名称</div>
            <div style="font-weight: 500;">{{ selectedFoodItem.name }}</div>
          </div>
          <div>
            <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px;">当前库存</div>
            <div style="font-weight: 500;">{{ selectedFoodItem.stockQuantity }}</div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          {{ activeTab === 'stock-in' ? '入库数量' : (activeTab === 'stock-out' ? '出库数量' : '处理数量') }}
          <span style="color: red;">*</span>
        </label>
        <input
          type="number"
          class="form-input"
          :class="{ error: errors.quantity }"
          v-model.number="operationForm.quantity"
          :max="activeTab !== 'stock-in' ? (selectedFoodItem?.stockQuantity || 0) : undefined"
          :placeholder="`请输入数量${activeTab !== 'stock-in' ? `（最大：${selectedFoodItem?.stockQuantity || 0}）` : ''}`"
        />
        <div v-if="errors.quantity" class="form-error">{{ errors.quantity }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">经办人 <span style="color: red;">*</span></label>
        <input
          type="text"
          class="form-input"
          :class="{ error: errors.operator }"
          v-model="operationForm.operator"
          placeholder="请输入经办人姓名"
        />
        <div v-if="errors.operator" class="form-error">{{ errors.operator }}</div>
      </div>

      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea
          class="form-textarea"
          :class="{ error: errors.notes }"
          v-model="operationForm.notes"
          placeholder="请输入备注（选填）"
        />
        <div v-if="errors.notes" class="form-error">{{ errors.notes }}</div>
      </div>
      
      <template #footer>
        <button class="btn btn-outline" @click="showOperationModal = false">
          取消
        </button>
        <button
          class="btn"
          :class="{
            'btn-success': activeTab === 'stock-in',
            'btn-primary': activeTab === 'stock-out',
            'btn-warning': activeTab === 'expired-process'
          }"
          @click="handleSubmit"
        >
          确认{{ getOperationTitle() }}
        </button>
      </template>
    </ModalDialog>
  </div>
</template>
