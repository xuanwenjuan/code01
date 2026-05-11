<template>
  <div class="page-container">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="操作人">
          <el-select
            v-model="filterForm.operator"
            placeholder="全部操作人"
            clearable
            style="width: 140px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="operator in availableOperators"
              :key="operator"
              :label="operator"
              :value="operator"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select
            v-model="filterForm.action"
            placeholder="全部类型"
            clearable
            style="width: 160px"
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in actionTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
            @change="handleFilterChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilterChange">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <div class="table-header">
        <div class="flex-between">
          <div>
            <h3 style="margin: 0; color: #303133">操作履历</h3>
            <el-tag type="info" style="margin-left: 12px">
              共 {{ hotelStore.filteredLogs.length }} 条记录
            </el-tag>
          </div>
          <el-tag v-if="recentOperationTime" type="primary">
            最近操作：{{ recentOperationTime }}
          </el-tag>
        </div>
      </div>

      <el-table :data="pagedLogs" stripe style="width: 100%" @row-click="handleRowClick">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="timestamp" label="操作时间" width="180">
          <template #default="{ row }">
            <span style="font-family: monospace">{{ formatDateTime(row.timestamp) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLogTagType(row.action)" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="140">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 6px">
              <el-avatar :size="24" :style="{ backgroundColor: getAvatarColor(row.operator) }">
                {{ getAvatarInitial(row.operator) }}
              </el-avatar>
              <span>{{ row.operator }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="operatorRole" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.operatorRole === 'admin' ? 'danger' : 'primary'" size="small">
              {{ row.operatorRole === 'admin' ? '管理员' : '前台' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="操作对象类型" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getTargetTypeName(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="操作对象" width="200" />
        <el-table-column prop="details" label="操作详情" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.details" placement="top" effect="dark">
              <span>{{ row.details }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="130">
          <template #default="{ row }">
            <span style="font-family: monospace">{{ row.ip || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click.stop="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="hotelStore.filteredLogs.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="操作日志详情" width="600px">
      <div v-if="selectedLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作时间" :span="2">
            {{ formatDateTime(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getLogTagType(selectedLog.action)" size="small">
              {{ selectedLog.action }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ selectedLog.operator }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            {{ selectedLog.operatorRole === 'admin' ? '管理员' : '前台' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ip || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作对象类型">
            {{ getTargetTypeName(selectedLog.targetType) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作对象">
            {{ selectedLog.targetName }}
          </el-descriptions-item>
          <el-descriptions-item label="操作详情" :span="2">
            {{ selectedLog.details }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedLog.beforeData || selectedLog.afterData" style="margin-top: 20px">
          <el-divider>数据变更</el-divider>
          <el-row :gutter="20">
            <el-col :span="12" v-if="selectedLog.beforeData">
              <el-card class="data-card" shadow="never">
                <template #header>
                  <div class="flex-between">
                    <span style="color: #909399; font-weight: 600">变更前</span>
                    <el-tag size="small" type="info">Before</el-tag>
                  </div>
                </template>
                <pre class="json-preview">{{ formatJson(selectedLog.beforeData) }}</pre>
              </el-card>
            </el-col>
            <el-col :span="12" v-if="selectedLog.afterData">
              <el-card class="data-card" shadow="never">
                <template #header>
                  <div class="flex-between">
                    <span style="color: #67c23a; font-weight: 600">变更后</span>
                    <el-tag size="small" type="success">After</el-tag>
                  </div>
                </template>
                <pre class="json-preview">{{ formatJson(selectedLog.afterData) }}</pre>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { OperationAction, type TargetType, type OperationLog } from '@/types'
import { formatDateTime, getAvatarColor, getAvatarInitial } from '@/utils'
import { useHotelStore } from '@/stores/hotel'

const hotelStore = useHotelStore()

const filterForm = reactive({
  operator: '' as string,
  action: '' as string,
  dateRange: [] as string[]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const detailVisible = ref(false)
const selectedLog = ref<OperationLog | null>(null)

const actionTypes = computed(() => {
  return Object.values(OperationAction).map((action) => ({
    value: action,
    label: action
  }))
})

const availableOperators = computed(() => {
  const operators = new Set(hotelStore.operationLogs.map((log) => log.operator))
  return Array.from(operators)
})

const pagedLogs = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return hotelStore.filteredLogs.slice(start, end)
})

const recentOperationTime = computed(() => {
  if (hotelStore.operationLogs.length === 0) return ''
  return formatDateTime(hotelStore.operationLogs[0].timestamp)
})

const getLogTagType = (
  action: string
): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [OperationAction.CHECK_IN]: 'success',
    [OperationAction.CHECK_OUT]: 'info',
    [OperationAction.FORCE_CHECK_OUT]: 'danger',
    [OperationAction.CREATE_BOOKING]: 'success',
    [OperationAction.CANCEL_BOOKING]: 'warning',
    [OperationAction.ROOM_STATUS_CHANGE]: 'primary',
    [OperationAction.PRICE_ADJUST]: 'warning',
    [OperationAction.ROOM_TYPE_UPDATE]: 'warning',
    [OperationAction.ROOM_TYPE_DELETE]: 'danger',
    [OperationAction.ROOM_TYPE_ADD]: 'success',
    [OperationAction.GUEST_INFO_UPDATE]: 'primary'
  }
  return typeMap[action] || 'info'
}

const getTargetTypeName = (targetType: TargetType): string => {
  const typeMap: Record<TargetType, string> = {
    room: '客房',
    order: '订单',
    roomType: '房型',
    guest: '客人'
  }
  return typeMap[targetType] || '未知'
}

const formatJson = (data: Record<string, unknown> | undefined): string => {
  if (!data) return '{}'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return '{}'
  }
}

const handleFilterChange = () => {
  hotelStore.setLogFilters({
    operator: filterForm.operator,
    action: filterForm.action,
    dateRange: filterForm.dateRange
  })
  pagination.currentPage = 1
}

const handleReset = () => {
  filterForm.operator = ''
  filterForm.action = ''
  filterForm.dateRange = []
  hotelStore.clearFilters()
  pagination.currentPage = 1
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
}

const handleRowClick = (row: OperationLog) => {
  selectedLog.value = row
}

const handleViewDetail = (log: OperationLog) => {
  selectedLog.value = log
  detailVisible.value = true
}

const handleExport = () => {
  if (hotelStore.filteredLogs.length === 0) {
    ElMessage.warning('没有可导出的记录')
    return
  }

  const headers = ['操作时间', '操作类型', '操作人', '角色', '操作对象类型', '操作对象', '操作详情', 'IP地址']
  const rows = hotelStore.filteredLogs.map((log) => [
    formatDateTime(log.timestamp),
    log.action,
    log.operator,
    log.operatorRole === 'admin' ? '管理员' : '前台',
    getTargetTypeName(log.targetType),
    log.targetName,
    log.details,
    log.ip || '-'
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `操作日志_${formatDateTime(new Date()).replace(/[: ]/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(link.href)

  ElMessage.success('导出成功')
}
</script>

<style lang="scss" scoped>
.filter-form {
  margin-bottom: 0;
}

.table-header {
  margin-bottom: 16px;
}

.table-container {
  :deep(.el-table__row) {
    cursor: pointer;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.log-detail {
  :deep(.el-descriptions__label) {
    background: #f5f7fa;
    font-weight: 500;
  }

  .data-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
      background: #fafafa;
    }

    :deep(.el-card__body) {
      padding: 16px;
    }

    .json-preview {
      margin: 0;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow-y: auto;
      color: #606266;
    }
  }
}
</style>
