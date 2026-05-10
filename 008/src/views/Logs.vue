<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useOperationLogStore } from '@/stores/operationLog'
import { useFoodItemStore } from '@/stores/foodItem'
import type { OperationType, OperationLogFilter } from '@/types'
import { getOperationTypeLabel, formatDateOnly } from '@/utils/storage'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const logStore = useOperationLogStore()
const foodItemStore = useFoodItemStore()

const showClearConfirm = ref(false)
const showExportModal = ref(false)

const filterOptions = reactive<OperationLogFilter & { operationType?: OperationType | 'all' }>({
  operationType: 'all',
  operator: '',
  foodItemId: '',
  startDate: '',
  endDate: ''
})

const stats = computed(() => logStore.getStats())

const foodItemOptions = computed(() => {
  return foodItemStore.foodItems.map(item => ({
    value: item.id,
    label: item.name
  }))
})

const filteredLogs = computed(() => {
  const filter: OperationLogFilter = { ...filterOptions }
  
  if (filterOptions.operationType === 'all') {
    filter.operationType = undefined
  }
  
  return logStore.filterLogs(filter)
})

function resetFilters() {
  filterOptions.operationType = 'all'
  filterOptions.operator = ''
  filterOptions.foodItemId = ''
  filterOptions.startDate = ''
  filterOptions.endDate = ''
}

function handleClear() {
  logStore.clearLogs()
  showClearConfirm.value = false
}

function exportLogs() {
  const data = logStore.exportLogs()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `operation-logs-${formatDateOnly(new Date())}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function getOperationBadgeClass(type: string) {
  const classes: Record<string, string> = {
    'stock-in': 'badge-success',
    'stock-out': 'badge-danger',
    'expired-process': 'badge-warning'
  }
  return classes[type] || 'badge-info'
}

function getStockChangeDisplay(change: number) {
  if (change > 0) return `+${change}`
  return `${change}`
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1 class="page-title">📝 操作履历日志</h1>
      <div style="display: flex; gap: 8px;">
        <button
          v-if="logStore.logs.length > 0"
          class="btn btn-outline btn-sm"
          @click="exportLogs"
        >
          导出日志
        </button>
        <button
          v-if="logStore.logs.length > 0"
          class="btn btn-danger btn-sm"
          @click="showClearConfirm = true"
        >
          清空日志
        </button>
      </div>
    </header>
    <div class="page-body">
      <div class="stat-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-label">总记录</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-card success">
          <div class="stat-label">入库</div>
          <div class="stat-value">{{ stats.stockIn }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">出库</div>
          <div class="stat-value">{{ stats.stockOut }}</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-label">临期处理</div>
          <div class="stat-value">{{ stats.expired }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">今日记录</div>
          <div class="stat-value">{{ stats.today }}</div>
        </div>
      </div>

      <div class="card">
        <div class="filter-section" style="margin-bottom: 0; border-radius: var(--radius-md);">
          <div class="filter-row">
            <div class="filter-item">
              <label class="form-label">操作类型</label>
              <select
                class="form-select"
                v-model="filterOptions.operationType"
              >
                <option value="all">全部</option>
                <option value="stock-in">入库登记</option>
                <option value="stock-out">出库领用</option>
                <option value="expired-process">临期处理</option>
              </select>
            </div>
            
            <div class="filter-item">
              <label class="form-label">经办人</label>
              <input
                type="text"
                class="form-input"
                v-model="filterOptions.operator"
                placeholder="搜索经办人"
              />
            </div>

            <div class="filter-item">
              <label class="form-label">食材</label>
              <select
                class="form-select"
                v-model="filterOptions.foodItemId"
              >
                <option value="">全部食材</option>
                <option
                  v-for="item in foodItemOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label class="form-label">开始日期</label>
              <input
                type="date"
                class="form-input"
                v-model="filterOptions.startDate"
              />
            </div>

            <div class="filter-item">
              <label class="form-label">结束日期</label>
              <input
                type="date"
                class="form-input"
                v-model="filterOptions.endDate"
              />
            </div>
            
            <div class="filter-actions">
              <button class="btn btn-outline" @click="resetFilters">
                重置
              </button>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px;">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>操作时间</th>
                  <th>经办人</th>
                  <th>操作类型</th>
                  <th>食材名称</th>
                  <th>操作内容</th>
                  <th>库存变更</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in filteredLogs" :key="log.id">
                  <td style="white-space: nowrap;">{{ log.operationTime }}</td>
                  <td>{{ log.operator }}</td>
                  <td>
                    <span class="badge" :class="getOperationBadgeClass(log.operationType)">
                      {{ getOperationTypeLabel(log.operationType) }}
                    </span>
                  </td>
                  <td>{{ log.foodItemName }}</td>
                  <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                    {{ log.operationContent }}
                  </td>
                  <td>
                    <span
                      :class="log.stockChange > 0 ? 'badge-success' : 'badge-danger'"
                      class="badge"
                    >
                      {{ getStockChangeDisplay(log.stockChange) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="filteredLogs.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">暂无操作记录</div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:visible="showClearConfirm"
      title="清空确认"
      message="确定要清空所有操作日志吗？此操作不可恢复。"
      type="danger"
      confirmText="清空"
      @confirm="handleClear"
    />
  </div>
</template>
