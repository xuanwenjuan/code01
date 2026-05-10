<template>
  <div>
    <div class="filter-section">
      <div class="filter-row">
        <div class="form-group">
          <label class="form-label">操作类型</label>
          <select v-model="filters.operationType" class="form-select">
            <option value="">全部类型</option>
            <option value="inbound">入库</option>
            <option value="outbound">出库</option>
            <option value="expired_remove">临期下架</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">用品分类</label>
          <select v-model="filters.categoryCode" class="form-select">
            <option value="">全部分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.code">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">经办人</label>
          <select v-model="filters.operator" class="form-select">
            <option value="">全部经办人</option>
            <option v-for="op in operators" :key="op" :value="op">
              {{ op }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">开始日期</label>
          <input 
            v-model="filters.startDate"
            type="date"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">结束日期</label>
          <input 
            v-model="filters.endDate"
            type="date"
            class="form-input"
          />
        </div>
      </div>

      <div class="filter-actions">
        <button class="btn btn-outline" @click="resetFilters">重置</button>
        <button class="btn btn-primary" @click="applyFilters">搜索</button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">操作履历日志</h2>
        <div>
          <span class="text-secondary">共 {{ filteredLogs.length }} 条记录</span>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>操作时间</th>
              <th>经办人</th>
              <th>操作类型</th>
              <th>用品名称</th>
              <th>分类</th>
              <th>变更数量</th>
              <th>变更前库存</th>
              <th>变更后库存</th>
              <th>状态</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id">
              <td>{{ formatDate(log.operationTime) }}</td>
              <td>{{ log.operator }}</td>
              <td>
                <span class="badge" :class="getOperationTypeClass(log.operationType)">
                  {{ operationTypeNames[log.operationType] }}
                </span>
              </td>
              <td>{{ log.productName }}</td>
              <td><span class="badge badge-info">{{ categoryNames[log.categoryCode] }}</span></td>
              <td>
                <span :class="log.quantityChange > 0 ? 'text-success' : 'text-danger'">
                  {{ log.quantityChange > 0 ? '+' : '' }}{{ log.quantityChange }}
                </span>
              </td>
              <td>{{ log.beforeStock }}</td>
              <td>{{ log.afterStock }}</td>
              <td>
                <span class="badge" :class="getStatusClass(log.statusAfter)">
                  {{ productStatusNames[log.statusAfter] }}
                </span>
              </td>
              <td>{{ log.remark || '-' }}</td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="10">
                <div class="empty-state">
                  <div class="empty-state-icon">📝</div>
                  <div class="empty-state-text">暂无操作日志</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="stats-grid" style="margin-top: 20px;">
      <div class="stat-card success">
        <div class="stat-value">{{ stats.inboundCount }}</div>
        <div class="stat-label">入库次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.outboundCount }}</div>
        <div class="stat-label">出库次数</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.removeCount }}</div>
        <div class="stat-label">下架次数</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-value">{{ stats.totalQuantity }}</div>
        <div class="stat-label">库存净变化</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storageService } from '@/services/storage'
import { formatDate } from '@/utils/date'
import { 
  categoryNames, 
  operationTypeNames,
  productStatusNames,
  type Category, 
  type OperationLog,
  type OperationType,
  type ProductStatus,
  type CategoryType
} from '@/types'
import { useToast } from '@/composables/useToast'

const { success, info } = useToast()

const categories = ref<Category[]>([])
const logs = ref<OperationLog[]>([])

const filters = reactive({
  operationType: '' as OperationType | '',
  categoryCode: '' as CategoryType | '',
  operator: '',
  startDate: '',
  endDate: ''
})

const operators = computed(() => {
  const operatorSet = new Set<string>()
  logs.value.forEach(log => operatorSet.add(log.operator))
  return Array.from(operatorSet)
})

const filteredLogs = computed(() => {
  let result = [...logs.value]

  if (filters.operationType) {
    result = result.filter(log => log.operationType === filters.operationType)
  }

  if (filters.categoryCode) {
    result = result.filter(log => log.categoryCode === filters.categoryCode)
  }

  if (filters.operator) {
    result = result.filter(log => log.operator === filters.operator)
  }

  if (filters.startDate) {
    const startDate = new Date(filters.startDate)
    startDate.setHours(0, 0, 0, 0)
    result = result.filter(log => new Date(log.operationTime) >= startDate)
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate)
    endDate.setHours(23, 59, 59, 999)
    result = result.filter(log => new Date(log.operationTime) <= endDate)
  }

  return result
})

const stats = computed(() => {
  const logsList = filteredLogs.value
  const inboundCount = logsList.filter(l => l.operationType === 'inbound').length
  const outboundCount = logsList.filter(l => l.operationType === 'outbound').length
  const removeCount = logsList.filter(l => l.operationType === 'expired_remove').length
  const totalQuantity = logsList.reduce((sum, l) => sum + l.quantityChange, 0)

  return {
    inboundCount,
    outboundCount,
    removeCount,
    totalQuantity
  }
})

const getOperationTypeClass = (type: OperationType): string => {
  switch (type) {
    case 'inbound': return 'badge-success'
    case 'outbound': return 'badge-info'
    case 'expired_remove': return 'badge-warning'
    default: return 'badge-secondary'
  }
}

const getStatusClass = (status: ProductStatus): string => {
  switch (status) {
    case 'normal': return 'badge-success'
    case 'expiring_soon': return 'badge-warning'
    case 'removed': return 'badge-danger'
    default: return 'badge-secondary'
  }
}

const loadLogs = () => {
  categories.value = storageService.getCategories()
  logs.value = storageService.getLogs()
}

const resetFilters = () => {
  filters.operationType = ''
  filters.categoryCode = ''
  filters.operator = ''
  filters.startDate = ''
  filters.endDate = ''
}

const applyFilters = () => {
  info('筛选完成')
}

onMounted(() => {
  loadLogs()
})

defineExpose({
  loadLogs
})
</script>

<style scoped>
.text-success {
  color: var(--success-color);
  font-weight: 600;
}

.text-danger {
  color: var(--danger-color);
  font-weight: 600;
}

.text-secondary {
  color: var(--text-secondary);
}
</style>