<template>
  <div class="log-manager">
    <div class="section-header">
      <h2>操作履历日志</h2>
      <div class="header-actions">
        <select v-model="filterType">
          <option value="">全部操作类型</option>
          <option v-for="opt in OPERATION_TYPES" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button 
          v-if="logs.length > 0" 
          class="btn-danger" 
          @click="handleClearLogs"
        >
          清空日志
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card stat-inbound">
        <div class="stat-value">{{ inboundCount }}</div>
        <div class="stat-label">入库次数</div>
      </div>
      <div class="stat-card stat-outbound">
        <div class="stat-value">{{ outboundCount }}</div>
        <div class="stat-label">出库次数</div>
      </div>
      <div class="stat-card stat-offline">
        <div class="stat-value">{{ offlineCount }}</div>
        <div class="stat-label">下架次数</div>
      </div>
      <div class="stat-card stat-total">
        <div class="stat-value">{{ logs.length }}</div>
        <div class="stat-label">总操作次数</div>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>操作时间</th>
            <th>产品名称</th>
            <th>经办人</th>
            <th>操作类型</th>
            <th>操作内容</th>
            <th>库存变更</th>
            <th>状态变更</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td class="timestamp">{{ log.timestamp }}</td>
            <td class="product-name">{{ log.productName }}</td>
            <td>{{ log.operator }}</td>
            <td>
              <span :class="['type-tag', `type-${log.operationType}`]">
                {{ OPERATION_TYPE_NAMES[log.operationType] }}
              </span>
            </td>
            <td>{{ log.content }}</td>
            <td>
              <template v-if="log.stockChange !== 0">
                <span :class="log.stockChange > 0 ? 'positive' : 'negative'">
                  {{ log.stockChange > 0 ? '+' : '' }}{{ log.stockChange }}
                </span>
                <span class="stock-detail">
                  ({{ log.previousStock }} → {{ log.newStock }})
                </span>
              </template>
              <template v-else>-</template>
            </td>
            <td>
              <template v-if="log.statusChange">
                <span class="status-badge">{{ log.statusChange.previous }}</span>
                <span class="status-arrow">→</span>
                <span class="status-badge">{{ log.statusChange.new }}</span>
              </template>
              <template v-else>-</template>
            </td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="7" class="empty-cell">暂无操作日志</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { OperationType } from '@/types'
import { useLogStore } from '@/stores/useLogStore'
import { useUIStore } from '@/stores/useUIStore'
import { OPERATION_TYPES, OPERATION_TYPE_NAMES } from '@/constants'

const { logs, clearLogs } = useLogStore()
const { confirm, showToast } = useUIStore()

const filterType = ref<OperationType | ''>('')

const inboundCount = computed(() => {
  return logs.value.filter(l => l.operationType === 'inbound').length
})

const outboundCount = computed(() => {
  return logs.value.filter(l => l.operationType === 'outbound').length
})

const offlineCount = computed(() => {
  return logs.value.filter(l => l.operationType === 'expired_offline').length
})

const filteredLogs = computed(() => {
  if (!filterType.value) return logs.value
  return logs.value.filter(l => l.operationType === filterType.value)
})

async function handleClearLogs(): Promise<void> {
  const confirmed = await confirm(
    '确认清空',
    '确定要清空所有操作日志吗？此操作不可恢复。'
  )

  if (confirmed) {
    clearLogs()
    showToast('success', '日志已清空')
  }
}
</script>

<style scoped>
.log-manager {
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
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-actions select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.stat-inbound {
  background: #d1fae5;
}

.stat-outbound {
  background: #fef3c7;
}

.stat-offline {
  background: #fee2e2;
}

.stat-total {
  background: #e0e7ff;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 13px;
  color: #4b5563;
  margin-top: 4px;
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
  white-space: nowrap;
}

.data-table td {
  font-size: 14px;
  color: #4b5563;
}

.timestamp {
  white-space: nowrap;
  font-family: monospace;
  font-size: 13px;
}

.product-name {
  font-weight: 500;
  color: #1f2937;
}

.type-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-inbound {
  background: #d1fae5;
  color: #065f46;
}

.type-outbound {
  background: #fef3c7;
  color: #92400e;
}

.type-expired_offline {
  background: #fee2e2;
  color: #991b1b;
}

.positive {
  color: #059669;
  font-weight: 500;
}

.negative {
  color: #dc2626;
  font-weight: 500;
}

.stock-detail {
  color: #6b7280;
  margin-left: 4px;
  font-size: 12px;
}

.status-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
}

.status-arrow {
  margin: 0 6px;
  color: #6b7280;
}

.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 40px !important;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>