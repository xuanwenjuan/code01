<template>
  <div class="logs-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>操作履历与审计</span>
        </div>
      </template>

      <AdvancedFilter
        :show-status="true"
        :show-date="true"
        :show-operator="true"
        :status-options="logStatusOptions"
        @filter="handleFilter"
      />

      <el-table :data="filteredLogs" style="width: 100%">
        <el-table-column prop="operationTitle" label="操作类型" width="150">
          <template #default="scope">
            <div class="operation-type">
              <el-icon :class="getLogIconClass(scope.row.operationType)">
                <Download v-if="scope.row.operationType === 'inbound'" />
                <Upload v-else-if="scope.row.operationType === 'outbound'" />
                <Transfer v-else-if="scope.row.operationType === 'transfer'" />
                <Edit v-else-if="scope.row.operationType === 'adjustment'" />
                <Search v-else />
              </el-icon>
              <span>{{ scope.row.operationTitle }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="operatorRole" label="角色" width="100" />
        <el-table-column label="操作时间" width="160" prop="operationTime" />
        <el-table-column label="操作详情" min-width="300">
          <template #default="scope">
            <el-popover placement="top-start" :width="400" trigger="hover">
              <template #reference>
                <div class="details-text">
                  {{ scope.row.details }}
                </div>
              </template>
              <div class="popover-content">
                <p><strong>操作详情:</strong> {{ scope.row.details }}</p>
                <p v-if="scope.row.relatedProduct">
                  <strong>关联商品:</strong> {{ scope.row.relatedProduct }}
                </p>
                <p v-if="scope.row.relatedWarehouse">
                  <strong>关联仓库:</strong> {{ scope.row.relatedWarehouse }}
                </p>
                <p><strong>IP地址:</strong> {{ scope.row.ipAddress }}</p>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getLogType(scope.row.operationType)" size="small">
              {{ getLogTypeText(scope.row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Upload, Transfer, Edit, Search } from '@element-plus/icons-vue'
import { useOperationStore } from '@/stores/operation'
import type { OperationType, FilterParams, ElementTagType, StatusOption } from '@/types'
import AdvancedFilter from '@/components/AdvancedFilter.vue'

const operationStore = useOperationStore()

const currentFilter = ref<FilterParams>({})

const filteredLogs = computed(() => {
  return operationStore.filterLogs(currentFilter.value)
})

const logStatusOptions: StatusOption[] = [
  { label: '入库操作', value: 'inbound' },
  { label: '出库操作', value: 'outbound' },
  { label: '移库操作', value: 'transfer' },
  { label: '库存调整', value: 'adjustment' },
  { label: '库存盘点', value: 'inventory-check' }
]

const getLogType = (type: OperationType): ElementTagType => {
  const typeMap: Record<OperationType, ElementTagType> = {
    'inbound': 'success',
    'outbound': 'primary',
    'transfer': 'info',
    'adjustment': 'warning',
    'inventory-check': 'warning'
  }
  return typeMap[type]
}

const getLogTypeText = (type: OperationType): string => {
  const textMap: Record<OperationType, string> = {
    'inbound': '入库',
    'outbound': '出库',
    'transfer': '移库',
    'adjustment': '调整',
    'inventory-check': '盘点'
  }
  return textMap[type]
}

const getLogIconClass = (type: OperationType): string => {
  const classMap: Record<OperationType, string> = {
    'inbound': 'icon-inbound',
    'outbound': 'icon-outbound',
    'transfer': 'icon-transfer',
    'adjustment': 'icon-adjustment',
    'inventory-check': 'icon-check'
  }
  return classMap[type]
}

const handleFilter = (params: FilterParams) => {
  currentFilter.value = params
}
</script>

<style scoped>
.logs-page {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.operation-type {
  display: flex;
  align-items: center;
  gap: 8px;
}

.operation-type .el-icon {
  font-size: 16px;
}

.icon-inbound {
  color: #67c23a;
}

.icon-outbound {
  color: #409eff;
}

.icon-transfer {
  color: #909399;
}

.icon-adjustment {
  color: #e6a23c;
}

.icon-check {
  color: #f56c6c;
}

.details-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
  cursor: pointer;
  color: #666;
}

.popover-content p {
  margin: 8px 0;
  font-size: 13px;
}
</style>
