<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { OperationLog } from '@/types'
import { OperationType, OPERATION_TYPES } from '@/types'
import { logStorage } from '@/utils/storage'

const props = defineProps<{
  refreshKey: number
}>()

const logs = ref<OperationLog[]>([])
const filterType = ref<OperationType | ''>('')
const searchKeyword = ref('')

const operationTypeOptions = OPERATION_TYPES

function loadData() {
  logs.value = logStorage.getAll()
}

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    if (filterType.value && log.operationType !== filterType.value) {
      return false
    }

    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      const matches =
        log.stationeryName.toLowerCase().includes(keyword) ||
        log.operator.toLowerCase().includes(keyword) ||
        log.operationContent.toLowerCase().includes(keyword) ||
        (log.classUsed && log.classUsed.toLowerCase().includes(keyword))
      if (!matches) {
        return false
      }
    }

    return true
  })
})

function getOperationTypeClass(type: OperationType): string {
  switch (type) {
    case OperationType.领用:
      return 'badge-success'
    case OperationType.归还:
      return 'badge-info'
    case OperationType.过期处理:
      return 'badge-danger'
    case OperationType.新增:
      return 'badge-success'
    case OperationType.修改:
      return 'badge-warning'
    case OperationType.删除:
      return 'badge-danger'
    default:
      return 'badge-info'
  }
}

function getOperationTypeIcon(type: OperationType): string {
  switch (type) {
    case OperationType.领用:
      return '📤'
    case OperationType.归还:
      return '📥'
    case OperationType.过期处理:
      return '🗑️'
    case OperationType.新增:
      return '➕'
    case OperationType.修改:
      return '✏️'
    case OperationType.删除:
      return '❌'
    default:
      return '📝'
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatStockChange(change: number): string {
  if (change > 0) {
    return `+${change}`
  }
  return change.toString()
}

function getStockChangeClass(change: number): string {
  if (change > 0) {
    return 'color: #48bb78; font-weight: 600;'
  } else if (change < 0) {
    return 'color: #f56565; font-weight: 600;'
  }
  return 'color: #666;'
}

function getSummaryStats(): {
  total: number
  lend: number
  return: number
  expire: number
  add: number
  modify: number
  delete: number
} {
  const allLogs = logs.value
  return {
    total: allLogs.length,
    lend: allLogs.filter((l) => l.operationType === OperationType.领用).length,
    return: allLogs.filter((l) => l.operationType === OperationType.归还).length,
    expire: allLogs.filter((l) => l.operationType === OperationType.过期处理).length,
    add: allLogs.filter((l) => l.operationType === OperationType.新增).length,
    modify: allLogs.filter((l) => l.operationType === OperationType.修改).length,
    delete: allLogs.filter((l) => l.operationType === OperationType.删除).length
  }
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
      <span>📋 操作履历日志</span>
    </div>

    <div class="stats-grid" style="margin-bottom: 20px;">
      <div class="stat-card" style="padding: 12px;">
        <div class="stat-value" style="font-size: 24px;">{{ getSummaryStats().total }}</div>
        <div class="stat-label" style="font-size: 12px;">总操作次数</div>
      </div>
      <div class="stat-card" style="padding: 12px; background: #e6fffa;">
        <div class="stat-value" style="font-size: 24px; color: #38a169;">
          {{ getSummaryStats().lend }}
        </div>
        <div class="stat-label" style="font-size: 12px;">领用</div>
      </div>
      <div class="stat-card" style="padding: 12px; background: #ebf8ff;">
        <div class="stat-value" style="font-size: 24px; color: #3182ce;">
          {{ getSummaryStats().return }}
        </div>
        <div class="stat-label" style="font-size: 12px;">归还</div>
      </div>
      <div class="stat-card" style="padding: 12px; background: #fff5f5;">
        <div class="stat-value" style="font-size: 24px; color: #e53e3e;">
          {{ getSummaryStats().expire }}
        </div>
        <div class="stat-label" style="font-size: 12px;">过期处理</div>
      </div>
      <div class="stat-card" style="padding: 12px; background: #f0fff4;">
        <div class="stat-value" style="font-size: 24px; color: #38a169;">
          {{ getSummaryStats().add }}
        </div>
        <div class="stat-label" style="font-size: 12px;">新增</div>
      </div>
      <div class="stat-card" style="padding: 12px; background: #fffaf0;">
        <div class="stat-value" style="font-size: 24px; color: #dd6b20;">
          {{ getSummaryStats().modify + getSummaryStats().delete }}
        </div>
        <div class="stat-label" style="font-size: 12px;">修改/删除</div>
      </div>
    </div>

    <div class="filter-row" style="margin-bottom: 16px;">
      <div class="filter-item">
        <label class="form-label">搜索关键词</label>
        <input
          type="text"
          class="form-input"
          v-model="searchKeyword"
          placeholder="输入文具名称/经办人/内容搜索"
        />
      </div>
      <div class="filter-item">
        <label class="form-label">操作类型</label>
        <select class="form-select" v-model="filterType">
          <option value="">全部</option>
          <option
            v-for="type in operationTypeOptions"
            :key="type"
            :value="type"
          >
            {{ type }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="logs.length === 0" class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>暂无操作记录</p>
    </div>

    <div v-else-if="filteredLogs.length === 0" class="empty-state">
      <div class="empty-state-icon">🔍</div>
      <p>没有匹配的操作记录，请调整筛选条件</p>
    </div>

    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>操作时间</th>
            <th>操作类型</th>
            <th>经办人</th>
            <th>文具名称</th>
            <th>分类</th>
            <th>操作内容</th>
            <th>库存变化</th>
            <th>变更后库存</th>
            <th>领用班级</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td>{{ formatDate(log.operationTime) }}</td>
            <td>
              <span class="badge" :class="getOperationTypeClass(log.operationType)">
                {{ getOperationTypeIcon(log.operationType) }} {{ log.operationType }}
              </span>
            </td>
            <td><strong>{{ log.operator }}</strong></td>
            <td>{{ log.stationeryName }}</td>
            <td>{{ log.categoryName || '-' }}</td>
            <td style="max-width: 300px;">{{ log.operationContent }}</td>
            <td>
              <span :style="getStockChangeClass(log.stockChange)">
                {{ formatStockChange(log.stockChange) }}
              </span>
            </td>
            <td>{{ log.newStock }}</td>
            <td>
              <span v-if="log.classUsed">{{ log.classUsed }}</span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 16px; text-align: right; color: #666; font-size: 14px;">
        显示 {{ filteredLogs.length }} / {{ logs.length }} 条记录
      </div>
    </div>
  </div>
</template>
