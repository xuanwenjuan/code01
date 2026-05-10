<template>
  <div class="manager-card">
    <div class="card-header">
      <h2>操作履历日志</h2>
      <div class="log-stats">
        共 {{ logs.length }} 条记录
      </div>
    </div>

    <div class="log-list-wrapper">
      <div class="log-list">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          class="log-item"
        >
          <div class="log-header">
            <span class="log-type" :class="getTypeClass(log.operationType)">
              {{ log.operationType }}
            </span>
            <span class="log-time">{{ formatTime(log.operationTime) }}</span>
          </div>
          
          <div class="log-content">
            <div class="log-main">{{ log.content }}</div>
            <div class="log-meta">
              <span>经办人：{{ log.operator }}</span>
              <span v-if="log.stockChange !== null">
                库存变更：{{ log.stockChange > 0 ? '+' : '' }}{{ log.stockChange }}
              </span>
              <span v-if="log.statusChange">
                状态变更：{{ log.statusChange }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="logs.length === 0" class="empty-state">
          暂无操作日志
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OperationType } from '@/types'
import { OperationType as OpType } from '@/types'
import { useEquipmentStore } from '@/composables/useEquipmentStore'
import { formatTime } from '@/utils/storage'

const { logs } = useEquipmentStore()

function getTypeClass(type: OperationType): string {
  const classes: Record<OperationType, string> = {
    [OpType.STOCK_IN]: 'stock-in',
    [OpType.STOCK_OUT]: 'stock-out',
    [OpType.RETURN]: 'return',
    [OpType.SCRAP]: 'scrap',
    [OpType.CREATE]: 'create',
    [OpType.UPDATE]: 'update',
    [OpType.DELETE]: 'delete'
  }
  return classes[type]
}
</script>

<style scoped>
.manager-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.log-stats {
  font-size: 14px;
  color: #666;
}

.log-list-wrapper {
  max-height: 500px;
  overflow-y: auto;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #409eff;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-type {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.log-type.stock-in {
  background-color: #f0f9eb;
  color: #67c23a;
}

.log-type.stock-out {
  background-color: #e6f7ff;
  color: #1890ff;
}

.log-type.return {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.log-type.scrap {
  background-color: #fef0f0;
  color: #f56c6c;
}

.log-type.create {
  background-color: #e6f7ff;
  color: #1890ff;
}

.log-type.update {
  background-color: #fff7e6;
  color: #fa8c16;
}

.log-type.delete {
  background-color: #fef0f0;
  color: #f56c6c;
}

.log-time {
  font-size: 12px;
  color: #999;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.log-main {
  font-size: 14px;
  color: #333;
}

.log-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
