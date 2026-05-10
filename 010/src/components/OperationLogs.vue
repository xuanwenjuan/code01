<script setup lang="ts">
import { reactive, computed } from 'vue'
import { store } from '../store'
import {
  OperationType as OT,
  OperationTypeLabel,
  OperationTypeBadge,
} from '../types'
import type { OperationLog, OperationType, LogFilters } from '../types'

const filters = reactive<LogFilters>({
  operationType: '',
  operator: '',
  equipmentName: '',
})

const operationTypeOptions: { value: OperationType | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: OT.RECEIVE, label: OperationTypeLabel[OT.RECEIVE] },
  { value: OT.RETURN, label: OperationTypeLabel[OT.RETURN] },
  { value: OT.SCRAP, label: OperationTypeLabel[OT.SCRAP] },
]

function getOperationTypeInfo(type: OperationType): { label: string; badge: string; icon: string } {
  switch (type) {
    case OT.RECEIVE:
      return { label: OperationTypeLabel[OT.RECEIVE], badge: OperationTypeBadge[OT.RECEIVE], icon: '→' }
    case OT.RETURN:
      return { label: OperationTypeLabel[OT.RETURN], badge: OperationTypeBadge[OT.RETURN], icon: '←' }
    case OT.SCRAP:
      return { label: OperationTypeLabel[OT.SCRAP], badge: OperationTypeBadge[OT.SCRAP], icon: '×' }
    default:
      return { label: type, badge: 'badge-info', icon: '?' }
  }
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function resetFilters() {
  filters.operationType = ''
  filters.operator = ''
  filters.equipmentName = ''
}

const filteredLogs = computed(() => {
  return store.state.logs.filter((log) => {
    if (filters.operationType && log.operationType !== filters.operationType) return false
    if (filters.operator && !log.operator.includes(filters.operator)) return false
    if (filters.equipmentName && !log.equipmentName.includes(filters.equipmentName)) return false
    return true
  })
})

function getOperationContent(log: OperationLog): string {
  const info = getOperationTypeInfo(log.operationType)
  const stockChange = log.newStock - log.previousStock
  const changeText = stockChange >= 0 ? `+${stockChange}` : `${stockChange}`
  return `${info.icon} ${log.operator} ${info.label}了 ${log.quantity} 台"${log.equipmentName}"，库存从 ${log.previousStock} 变为 ${log.newStock} (${changeText})`
}
</script>

<template>
  <div class="card">
    <div class="header">
      <h2 style="font-size: 20px; font-weight: 600">操作履历日志</h2>
      <span style="font-size: 14px; color: var(--text-secondary)">
        共 {{ store.state.logs.length }} 条记录
      </span>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <span class="filter-label">操作类型</span>
        <select class="form-select" v-model="filters.operationType">
          <option v-for="opt in operationTypeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="filter-item">
        <span class="filter-label">经办人</span>
        <input class="form-input" v-model="filters.operator" placeholder="输入经办人姓名" />
      </div>
      <div class="filter-item">
        <span class="filter-label">设备名称</span>
        <input class="form-input" v-model="filters.equipmentName" placeholder="输入设备名称" />
      </div>
      <div class="filter-actions">
        <button class="btn btn-secondary btn-sm" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>操作时间</th>
          <th>经办人</th>
          <th>设备名称</th>
          <th>操作类型</th>
          <th>数量</th>
          <th>库存变更</th>
          <th>状态变更</th>
          <th>备注</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in filteredLogs" :key="log.id">
          <td style="font-size: 13px">{{ formatTime(log.operationTime) }}</td>
          <td>{{ log.operator }}</td>
          <td>{{ log.equipmentName }}</td>
          <td>
            <span class="badge" :class="getOperationTypeInfo(log.operationType).badge">
              {{ getOperationTypeInfo(log.operationType).label }}
            </span>
          </td>
          <td>{{ log.quantity }}</td>
          <td style="font-size: 13px">
            {{ log.previousStock }} → {{ log.newStock }}
            <span
              :style="{
                color: log.newStock - log.previousStock > 0 ? 'var(--success-color)' : log.newStock - log.previousStock < 0 ? 'var(--danger-color)' : 'var(--text-secondary)',
                marginLeft: '4px',
              }"
            >
              ({{ log.newStock - log.previousStock >= 0 ? '+' : '' }}{{ log.newStock - log.previousStock }})
            </span>
          </td>
          <td style="font-size: 13px">
            <template v-if="log.previousCondition || log.newCondition">
              {{ log.previousCondition ? log.previousCondition : '-' }} →
              {{ log.newCondition ? log.newCondition : '-' }}
            </template>
            <template v-else>-</template>
          </td>
          <td style="font-size: 13px; max-width: 200px; overflow: hidden; text-overflow: ellipsis" :title="log.remarks">
            {{ log.remarks || '-' }}
          </td>
        </tr>
        <tr v-if="filteredLogs.length === 0">
          <td colspan="8">
            <div class="empty-state">
              {{ store.state.logs.length === 0 ? '暂无操作记录' : '没有符合条件的日志' }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
