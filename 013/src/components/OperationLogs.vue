<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataStore } from '@/composables/useDataStore'
import type { OperationType } from '@/types'
import { OperationTypeNames } from '@/types'

const { operationLogs } = useDataStore()

const selectedType = ref<OperationType | ''>('')

const typeOptions = Object.entries(OperationTypeNames).map(([value, label]) => ({
  value: value as OperationType,
  label
}))

const filteredLogs = computed(() => {
  if (!selectedType.value) {
    return operationLogs.value
  }
  return operationLogs.value.filter(log => log.operationType === selectedType.value)
})

const getTypeClass = (type: OperationType) => {
  switch (type) {
    case 'rent':
      return 'type-rent'
    case 'return':
      return 'type-return'
    case 'scrap':
      return 'type-scrap'
    case 'create':
    case 'category_create':
      return 'type-create'
    case 'update':
    case 'category_update':
      return 'type-update'
    case 'delete':
    case 'category_delete':
      return 'type-delete'
    default:
      return ''
  }
}

const getOperationIcon = (type: OperationType) => {
  switch (type) {
    case 'rent':
      return '📦'
    case 'return':
      return '↩️'
    case 'scrap':
      return '🗑️'
    case 'create':
    case 'category_create':
      return '➕'
    case 'update':
    case 'category_update':
      return '✏️'
    case 'delete':
    case 'category_delete':
      return '❌'
    default:
      return '📝'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const clearFilter = () => {
  selectedType.value = ''
}
</script>

<template>
  <div class="operation-logs">
    <div class="section-header">
      <h2>操作履历日志</h2>
      <div class="filter-control">
        <label>操作类型筛选：</label>
        <select v-model="selectedType" class="form-input" style="width: 180px;">
          <option value="">全部类型</option>
          <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <button 
          v-if="selectedType" 
          class="btn btn-link" 
          @click="clearFilter"
        >
          清除筛选
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">总记录数</span>
        <span class="stat-value">{{ operationLogs.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">筛选结果</span>
        <span class="stat-value">{{ filteredLogs.length }}</span>
      </div>
    </div>

    <div class="card">
      <div class="log-list">
        <div v-if="filteredLogs.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>{{ selectedType ? '没有该类型的操作记录' : '暂无操作记录' }}</p>
        </div>
        
        <div 
          v-for="log in filteredLogs" 
          :key="log.id" 
          class="log-item"
        >
          <div class="log-icon" :class="getTypeClass(log.operationType)">
            {{ getOperationIcon(log.operationType) }}
          </div>
          
          <div class="log-content">
            <div class="log-header">
              <span class="log-type" :class="getTypeClass(log.operationType)">
                {{ OperationTypeNames[log.operationType] }}
              </span>
              <span class="log-time">{{ formatDate(log.operationTime) }}</span>
            </div>
            
            <div class="log-body">
              <p class="log-content-text">{{ log.operationContent }}</p>
              
              <div class="log-meta">
                <span class="log-operator">
                  <span class="meta-label">经办人：</span>
                  {{ log.operator }}
                </span>
                
                <span v-if="log.equipmentName" class="log-equipment">
                  <span class="meta-label">装备：</span>
                  {{ log.equipmentName }}
                </span>
                
                <span v-if="log.categoryName" class="log-category">
                  <span class="meta-label">分类：</span>
                  {{ log.categoryName }}
                </span>
                
                <span v-if="log.stockChange" class="log-stock" :class="{ 'negative': log.stockChange < 0 }">
                  <span class="meta-label">库存变更：</span>
                  {{ log.stockChange > 0 ? '+' : '' }}{{ log.stockChange }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.operation-logs {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.filter-control {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.form-input {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

.log-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #e5e7eb;
  transition: all 0.2s;
}

.log-item:hover {
  background: #f3f4f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.log-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 20px;
  background: #e5e7eb;
  flex-shrink: 0;
}

.log-icon.type-rent {
  background: #dbeafe;
}

.log-icon.type-return {
  background: #d1fae5;
}

.log-icon.type-scrap {
  background: #fee2e2;
}

.log-icon.type-create {
  background: #fef3c7;
}

.log-icon.type-update {
  background: #e0e7ff;
}

.log-icon.type-delete {
  background: #fee2e2;
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.log-type {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: #e5e7eb;
  color: #374151;
}

.log-type.type-rent {
  background: #dbeafe;
  color: #1d4ed8;
}

.log-type.type-return {
  background: #d1fae5;
  color: #065f46;
}

.log-type.type-scrap {
  background: #fee2e2;
  color: #991b1b;
}

.log-type.type-create {
  background: #fef3c7;
  color: #92400e;
}

.log-type.type-update {
  background: #e0e7ff;
  color: #4338ca;
}

.log-type.type-delete {
  background: #fee2e2;
  color: #991b1b;
}

.log-time {
  font-size: 13px;
  color: #9ca3af;
}

.log-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-content-text {
  margin: 0;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.meta-label {
  color: #9ca3af;
}

.log-stock {
  font-weight: 600;
  color: #059669;
}

.log-stock.negative {
  color: #dc2626;
}

@media (max-width: 640px) {
  .stats-row {
    flex-direction: column;
  }
  
  .log-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
