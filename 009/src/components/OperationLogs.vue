<template>
  <div class="operation-logs">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">操作履历日志</h2>
        <div class="header-actions">
          <div class="filter-item">
            <label>操作类型：</label>
            <select v-model="filterType">
              <option value="">全部类型</option>
              <option value="入库">入库</option>
              <option value="出库">出库</option>
              <option value="临期下架">临期下架</option>
            </select>
          </div>
          <button class="btn btn-sm btn-default" @click="loadData">
            刷新
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>操作时间</th>
              <th>经办人</th>
              <th>操作类型</th>
              <th>用品名称</th>
              <th>变更数量</th>
              <th>库存变更</th>
              <th>状态变更</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>{{ formatDate(log.operationTime) }}</td>
              <td>{{ log.operator }}</td>
              <td>
                <span :class="['badge', getOperationTypeClass(log.operationType)]">
                  {{ log.operationType }}
                </span>
              </td>
              <td>{{ log.productName }}</td>
              <td>
                <span :class="getChangeQuantityClass(log.changeQuantity)">
                  {{ formatChangeQuantity(log.changeQuantity) }}
                </span>
              </td>
              <td>
                {{ log.previousQuantity }} → {{ log.currentQuantity }}
              </td>
              <td>
                <span :class="['badge', getStatusClass(log.previousStatus)]">
                  {{ log.previousStatus }}
                </span>
                <span style="margin: 0 6px;">→</span>
                <span :class="['badge', getStatusClass(log.currentStatus)]">
                  {{ log.currentStatus }}
                </span>
              </td>
              <td>{{ log.remark || '-' }}</td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-color-secondary);">
                暂无操作记录
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination">
        <span class="pagination-info">
          共 {{ filteredLogs.length }} 条记录
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { OperationLog, OperationType, ProductStatus } from '../types'
import { state, loadLogs } from '../store'

const filterType = ref<OperationType | ''>('')

const logs = computed(() => state.logs)

const filteredLogs = computed(() => {
  if (!filterType.value) {
    return logs.value
  }
  return logs.value.filter((log: OperationLog) => log.operationType === filterType.value)
})

function getOperationTypeClass(type: OperationType): string {
  switch (type) {
    case '入库': return 'badge-success'
    case '出库': return 'badge-primary'
    case '临期下架': return 'badge-warning'
    default: return 'badge-info'
  }
}

function getStatusClass(status: ProductStatus): string {
  switch (status) {
    case '正常': return 'badge-success'
    case '临期': return 'badge-warning'
    case '已下架': return 'badge-danger'
    default: return 'badge-info'
  }
}

function getChangeQuantityClass(quantity: number): string {
  if (quantity > 0) return 'text-success'
  if (quantity < 0) return 'text-danger'
  return 'text-secondary'
}

function formatChangeQuantity(quantity: number): string {
  if (quantity > 0) return `+${quantity}`
  if (quantity < 0) return `${quantity}`
  return '-'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function loadData(): void {
  loadLogs()
}

onMounted(() => {
  loadData()
})

defineExpose({
  loadData
})
</script>

<style scoped>
.operation-logs {
  padding: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.filter-item select {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.filter-item select:focus {
  border-color: var(--primary-color);
}

.text-success {
  color: var(--success-color);
  font-weight: 500;
}

.text-danger {
  color: var(--danger-color);
  font-weight: 500;
}

.text-secondary {
  color: var(--text-color-secondary);
}

.pagination-info {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.table-container td {
  white-space: nowrap;
}
</style>
