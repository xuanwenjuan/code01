<template>
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">操作履历日志</h2>
      <button class="btn btn-secondary btn-sm" @click="loadData">
        刷新
      </button>
    </div>

    <div class="grid-4">
      <div class="form-group">
        <label class="form-label">操作类型</label>
        <select
          v-model="localFilters.operationType"
          class="form-select"
          @change="applyFilters"
        >
          <option value="">全部类型</option>
          <option
            v-for="type in logStore.operationTypes"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">开始日期</label>
        <input
          v-model="localFilters.startDate"
          type="date"
          class="form-input"
          @change="applyFilters"
        />
      </div>

      <div class="form-group">
        <label class="form-label">结束日期</label>
        <input
          v-model="localFilters.endDate"
          type="date"
          class="form-input"
          @change="applyFilters"
        />
      </div>

      <div class="form-group">
        <label class="form-label">关键词搜索</label>
        <input
          v-model="localFilters.keyword"
          type="text"
          class="form-input"
          placeholder="描述/经办人/标本名"
          @input="applyFilters"
        />
      </div>
    </div>

    <div class="flex gap-2 mb-3">
      <button class="btn btn-sm btn-secondary" @click="resetFilters">
        重置筛选
      </button>
    </div>

    <div v-if="logStore.loading" class="loading">
      <div class="spinner"></div>
    </div>

    <EmptyState
      v-else-if="logStore.filteredLogs.length === 0"
      message="暂无操作日志"
    />

    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>时间</th>
            <th>操作类型</th>
            <th>操作描述</th>
            <th>经办人</th>
            <th>标本</th>
            <th>详细信息</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logStore.filteredLogs" :key="log.id">
            <td style="white-space: nowrap;">{{ formatDateTime(log.timestamp) }}</td>
            <td>
              <span :class="['badge', getOperationTypeColor(log.operationType)]">
                {{ getOperationTypeLabel(log.operationType) }}
              </span>
            </td>
            <td>{{ log.description }}</td>
            <td>{{ log.operator || '-' }}</td>
            <td>{{ log.specimenName || '-' }}</td>
            <td>
              <div v-if="log.quantity !== undefined">
                数量: {{ log.quantity }}
              </div>
              <div v-if="log.borrower">
                借阅人: {{ log.borrower }}
              </div>
              <div v-if="log.previousStock !== undefined && log.remainingStock !== undefined">
                库存: {{ log.previousStock }} → {{ log.remainingStock }}
              </div>
              <div v-if="log.oldStatus">
                <div>状态: {{ log.oldStatus }} → {{ log.newStatus }}</div>
                <div v-if="log.reason" style="font-size: 11px; color: #666;">
                  原因: {{ log.reason }}
                </div>
              </div>
              <div v-if="log.maintenanceType">
                养护类型: {{ log.maintenanceType }}
              </div>
              <div v-if="log.damageLevel">
                破损程度: {{ log.damageLevel }}
              </div>
              <div v-if="log.damageReason">
                破损原因: {{ log.damageReason }}
              </div>
              <div v-if="log.returnQuantity !== undefined">
                归还数量: {{ log.returnQuantity }}
                <span v-if="log.lostQuantity > 0" style="color: #dc3545;">
                  (丢失: {{ log.lostQuantity }})
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4" style="color: #666; font-size: 13px;">
      共 {{ logStore.filteredLogs.length }} 条记录
      <span v-if="logStore.filteredLogs.length !== logStore.operationLogs.length">
        (全部 {{ logStore.operationLogs.length }} 条)
      </span>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useLogStore } from '../../stores/log'
import { formatDateTime } from '../../utils/helpers'
import EmptyState from '../../components/EmptyState.vue'

const logStore = useLogStore()

const localFilters = reactive({
  operationType: '',
  startDate: '',
  endDate: '',
  keyword: ''
})

const loadData = () => {
  logStore.loadLogs()
}

const applyFilters = () => {
  logStore.setFilters({
    operationType: localFilters.operationType || null,
    startDate: localFilters.startDate || null,
    endDate: localFilters.endDate || null,
    keyword: localFilters.keyword
  })
}

const resetFilters = () => {
  Object.keys(localFilters).forEach(key => {
    localFilters[key] = ''
  })
  logStore.resetFilters()
}

const getOperationTypeLabel = (type) => {
  const typeInfo = logStore.operationTypes.find(t => t.value === type)
  return typeInfo?.label || type
}

const getOperationTypeColor = (type) => {
  if (type?.includes('damage')) {
    return 'badge-danger'
  }
  if (type?.includes('borrow') || type?.includes('return')) {
    return 'badge-info'
  }
  if (type?.includes('delete')) {
    return 'badge-danger'
  }
  if (type?.includes('update')) {
    return 'badge-warning'
  }
  if (type?.includes('maintenance')) {
    return 'badge-primary'
  }
  if (type?.includes('status')) {
    return 'badge-info'
  }
  return 'badge-success'
}

watch(
  () => logStore.filters,
  () => {
    localFilters.operationType = logStore.filters.operationType || ''
    localFilters.startDate = logStore.filters.startDate || ''
    localFilters.endDate = logStore.filters.endDate || ''
    localFilters.keyword = logStore.filters.keyword || ''
  },
  { immediate: true }
)
</script>