<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { OperationLog, OperationLogFilter, OperationType, UserRole, SelectOption } from '@/types'
import { operationTypeLabels, userRoleLabels, OperationType as OT } from '@/types'
import { useOperationLogStore } from '@/stores/operationLog'
import FilterForm, { type FilterField } from '@/components/FilterForm.vue'
import dayjs from 'dayjs'

const operationLogStore = useOperationLogStore()

const detailDialogVisible = ref(false)
const selectedLog = ref<OperationLog | null>(null)

const filterForm = ref<Record<string, unknown>>({
  operatorId: '',
  operationType: undefined,
  operatorRole: undefined,
  startDate: '',
  endDate: '',
  keyword: ''
})

const currentPage = ref(1)
const pageSize = ref(10)

const operationTypeOptions: SelectOption<OperationType>[] = Object.entries(operationTypeLabels).map(
  ([value, label]) => ({
    value: value as OperationType,
    label
  })
)

const userRoleOptions: SelectOption<UserRole>[] = Object.entries(userRoleLabels).map(
  ([value, label]) => ({
    value: value as UserRole,
    label
  })
)

const operatorOptions = computed<SelectOption[]>(() => {
  const operators = new Map<string, string>()
  operationLogStore.logList.forEach((log) => {
    operators.set(log.operatorId, log.operatorName)
  })
  return Array.from(operators.entries()).map(([id, name]) => ({
    label: name,
    value: id
  }))
})

const filterFields: FilterField[] = [
  {
    key: 'operatorId',
    label: '操作人',
    type: 'select',
    placeholder: '全部',
    options: operatorOptions.value,
    width: '150px'
  },
  {
    key: 'operatorRole',
    label: '角色',
    type: 'select',
    placeholder: '全部角色',
    options: userRoleOptions,
    width: '150px'
  },
  {
    key: 'operationType',
    label: '操作类型',
    type: 'select',
    placeholder: '全部类型',
    options: operationTypeOptions,
    width: '180px'
  },
  {
    key: 'startDate',
    label: '开始日期',
    type: 'date',
    placeholder: '开始日期',
    width: '140px'
  },
  {
    key: 'endDate',
    label: '结束日期',
    type: 'date',
    placeholder: '结束日期',
    width: '140px'
  },
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索操作人/目标/详情',
    width: '220px'
  }
]

const filteredLogs = computed(() => {
  const filter = filterForm.value as OperationLogFilter
  let results = operationLogStore.filterLogs({
    operatorId: filter.operatorId || undefined,
    operationType: filter.operationType,
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
    keyword: filter.keyword || undefined
  })

  if (filter.operatorRole) {
    results = results.filter((log) => log.operatorRole === filter.operatorRole)
  }

  return results
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

function handleSearch(): void {
  currentPage.value = 1
}

function handleReset(): void {
  filterForm.value = {
    operatorId: '',
    operationType: undefined,
    operatorRole: undefined,
    startDate: '',
    endDate: '',
    keyword: ''
  }
  currentPage.value = 1
}

function getOperationTypeTagType(type: OperationType): 'success' | 'danger' | 'warning' | 'info' | 'primary' {
  if (
    type === OT.CREATE_ACTIVITY ||
    type === OT.CREATE_CLUB ||
    type === OT.APPROVE_REGISTRATION ||
    type === OT.CHECK_IN ||
    type === OT.SCAN_CHECK_IN ||
    type === OT.BATCH_CHECK_IN
  ) {
    return 'success'
  } else if (
    type === OT.CANCEL_ACTIVITY ||
    type === OT.DELETE_CLUB ||
    type === OT.REJECT_REGISTRATION
  ) {
    return 'danger'
  } else if (type === OT.UPDATE_ACTIVITY || type === OT.UPDATE_CLUB || type === OT.LEAVE) {
    return 'warning'
  } else {
    return 'info'
  }
}

function getUserRoleTagType(role: UserRole): 'danger' | 'primary' | 'info' {
  if (role === 'admin') {
    return 'danger'
  } else if (role === 'club_manager') {
    return 'primary'
  } else {
    return 'info'
  }
}

const statistics = computed(() => {
  const total = operationLogStore.logList.length
  const today = operationLogStore.logList.filter((log) =>
    dayjs(log.createdAt).isSame(dayjs(), 'day')
  ).length
  const thisWeek = operationLogStore.logList.filter((log) =>
    dayjs(log.createdAt).isSame(dayjs(), 'week')
  ).length
  
  const typeCounts: Record<string, number> = {}
  operationLogStore.logList.forEach((log) => {
    typeCounts[log.operationType] = (typeCounts[log.operationType] || 0) + 1
  })

  return { total, today, thisWeek, typeCounts }
})

const recentActivityStats = computed(() => {
  const last7Days: Array<{ date: string; count: number }> = []
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    const count = operationLogStore.logList.filter((log) =>
      dayjs(log.createdAt).isSame(dayjs(date), 'day')
    ).length
    last7Days.push({ date, count })
  }
  return last7Days
})

function viewLogDetail(log: OperationLog): void {
  selectedLog.value = log
  detailDialogVisible.value = true
}

function formatExtraData(data: Record<string, unknown> | undefined): string {
  if (!data || Object.keys(data).length === 0) return '-'
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

function handleClearLogs(): void {
  ElMessage.warning('清理日志功能将在确认后执行（本示例暂不实现）')
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">操作日志</h1>
      <div class="flex gap-4">
        <span class="text-gray-500 text-sm">
          共 {{ statistics.total }} 条记录
        </span>
        <span class="text-green-500 text-sm">
          今日 {{ statistics.today }} 条
        </span>
        <span class="text-blue-500 text-sm">
          本周 {{ statistics.thisWeek }} 条
        </span>
      </div>
    </div>

    <div class="filter-section">
      <FilterForm
        :fields="filterFields"
        v-model="filterForm"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div class="table-container">
      <el-table :data="paginatedLogs" stripe border v-loading="false">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="operatorName" label="操作人" width="140">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar :size="28" icon="UserFilled" />
              <div class="flex flex-col">
                <span class="font-medium">{{ row.operatorName }}</span>
                <el-tag :type="getUserRoleTagType(row.operatorRole)" size="small" effect="light">
                  {{ userRoleLabels[row.operatorRole] }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="140">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTagType(row.operationType)" effect="light">
              {{ operationTypeLabels[row.operationType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="操作对象" min-width="160">
          <template #default="{ row }">
            <div class="font-medium">{{ row.targetName }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="操作详情" min-width="280" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="text-gray-600">{{ row.details }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            <div class="text-sm">{{ row.createdAt }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewLogDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredLogs.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <el-dialog
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions v-if="selectedLog" border :column="1">
        <el-descriptions-item label="日志ID">
          {{ selectedLog.id }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          <el-tag :type="getUserRoleTagType(selectedLog.operatorRole)" size="small">
            {{ selectedLog.operatorName }}
          </el-tag>
          <span class="ml-2 text-gray-500">{{ userRoleLabels[selectedLog.operatorRole] }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getOperationTypeTagType(selectedLog.operationType)" effect="light">
            {{ operationTypeLabels[selectedLog.operationType] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作对象">
          {{ selectedLog.targetName }}
          <span class="text-gray-500 ml-2">(ID: {{ selectedLog.targetId }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作详情">
          {{ selectedLog.details }}
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ selectedLog.createdAt }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.extraData?.activityTitle" label="关联活动">
          {{ selectedLog.extraData.activityTitle }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.extraData?.affectedCount" label="影响数量">
          {{ selectedLog.extraData.affectedCount }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.extraData?.before" label="变更前">
          <pre class="code-block">{{ formatExtraData(selectedLog.extraData.before) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.extraData?.after" label="变更后">
          <pre class="code-block">{{ formatExtraData(selectedLog.extraData.after) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 8px;
}
.gap-4 {
  gap: 16px;
}
.font-medium {
  font-weight: 500;
}
.text-gray-500 {
  color: #909399;
}
.text-gray-600 {
  color: #606266;
}
.text-green-500 {
  color: #67c23a;
}
.text-blue-500 {
  color: #409eff;
}
.text-sm {
  font-size: 14px;
}
.ml-2 {
  margin-left: 8px;
}
.code-block {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
