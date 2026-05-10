<template>
  <div class="audit-page">
    <div class="page-header">
      <div class="page-title">操作审计</div>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="filter-header">
          <span>筛选条件</span>
          <el-button type="text" @click="toggleExpand">
            <el-icon><component :is="isExpanded ? 'CaretTop' : 'CaretBottom'" /></el-icon>
            {{ isExpanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </template>

      <el-form :model="filterModel" label-width="100px">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="操作人">
              <el-input
                v-model="filterModel.operatorName"
                placeholder="输入操作人姓名"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="角色">
              <el-select
                v-model="filterModel.operatorRole"
                placeholder="全部角色"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in auditStore.userRoleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="操作类型">
              <el-select
                v-model="filterModel.operationType"
                placeholder="全部类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in auditStore.operationTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="操作对象">
              <el-select
                v-model="filterModel.targetType"
                placeholder="全部对象"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in auditStore.targetTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isExpanded">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="filterModel.startTime"
                type="date"
                placeholder="选择开始日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-show="isExpanded">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="filterModel.endTime"
                type="date"
                placeholder="选择结束日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-tag 
            v-if="hasActiveFilters" 
            type="info" 
            closable
            @close="handleReset"
          >
            已筛选 {{ activeFilterCount }} 个条件
          </el-tag>
        </div>
      </el-form>
    </el-card>

    <div class="stats-bar">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-value">{{ auditStore.filteredLogs.length }}</div>
            <div class="stat-label">操作记录总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-admin">
            <div class="stat-value">{{ getRoleCount('admin') }}</div>
            <div class="stat-label">管理员操作</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-doctor">
            <div class="stat-value">{{ getRoleCount('doctor') }}</div>
            <div class="stat-label">医生操作</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-other">
            <div class="stat-value">{{ getRoleCount('other') }}</div>
            <div class="stat-label">其他操作</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table
        :data="auditStore.filteredLogs"
        v-loading="auditStore.isLoading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.operatorRole)" size="small">
              {{ getRoleLabel(row.operatorRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            {{ row.operationDescription }}
          </template>
        </el-table-column>
        <el-table-column label="操作对象" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getTargetTagType(row.targetType)" size="small">
              {{ getTargetLabel(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="对象名称" width="180" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="600px"
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="操作人">
            {{ currentLog.operatorName }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleTagType(currentLog.operatorRole)" size="small">
              {{ getRoleLabel(currentLog.operatorRole) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            {{ currentLog.operationDescription }}
          </el-descriptions-item>
          <el-descriptions-item label="操作对象">
            <el-tag :type="getTargetTagType(currentLog.targetType)" size="small">
              {{ getTargetLabel(currentLog.targetType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="对象ID">
            {{ currentLog.targetId }}
          </el-descriptions-item>
          <el-descriptions-item label="对象名称">
            {{ currentLog.targetName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatTime(currentLog.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-card v-if="currentLog.oldValue" class="detail-card">
          <template #header>
            <span class="card-title">变更前</span>
          </template>
          <pre class="json-preview">{{ currentLog.oldValue }}</pre>
        </el-card>

        <el-card v-if="currentLog.newValue" class="detail-card">
          <template #header>
            <span class="card-title">变更后</span>
          </template>
          <pre class="json-preview">{{ currentLog.newValue }}</pre>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import {
  CaretTop,
  CaretBottom,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import type { OperationLog, UserRole, OperationType, TargetType } from '@/types'
import { useAuditStore } from '@/stores/audit'
import type { LogFilterParams } from '@/stores/audit'

const auditStore = useAuditStore()

const isExpanded = ref(false)
const detailDialogVisible = ref(false)
const currentLog = ref<OperationLog | null>(null)

const filterModel = reactive<{
  operatorName: string
  operatorRole: UserRole | ''
  operationType: OperationType | ''
  targetType: TargetType | ''
  startTime: string
  endTime: string
}>({
  operatorName: '',
  operatorRole: '',
  operationType: '',
  targetType: '',
  startTime: '',
  endTime: ''
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filterModel.operatorName) count++
  if (filterModel.operatorRole) count++
  if (filterModel.operationType) count++
  if (filterModel.targetType) count++
  if (filterModel.startTime) count++
  if (filterModel.endTime) count++
  return count
})

const hasActiveFilters = computed(() => activeFilterCount.value > 0)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function getRoleCount(type: string): number {
  if (type === 'other') {
    return auditStore.filteredLogs.filter(log => 
      log.operatorRole !== 'admin' && log.operatorRole !== 'doctor'
    ).length
  }
  return auditStore.filteredLogs.filter(log => log.operatorRole === type).length
}

function getRoleTagType(role: UserRole): string {
  const types: Record<UserRole, string> = {
    admin: 'danger',
    doctor: 'primary',
    reception: 'success',
    nurse: 'warning'
  }
  return types[role] || 'info'
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: '管理员',
    doctor: '医生',
    reception: '挂号员',
    nurse: '护士'
  }
  return labels[role] || role
}

function getTargetTagType(type: string): string {
  const types: Record<string, string> = {
    department: 'primary',
    doctor: 'success',
    registration: 'warning',
    prescription: 'danger',
    schedule: 'info'
  }
  return types[type] || 'info'
}

function getTargetLabel(type: string): string {
  const labels: Record<string, string> = {
    department: '科室',
    doctor: '医生',
    registration: '挂号单',
    prescription: '处方',
    schedule: '排班'
  }
  return labels[type] || type
}

function formatTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function handleSearch() {
  const params: LogFilterParams = {
    operatorName: filterModel.operatorName || undefined
  }
  if (filterModel.operatorRole) {
    params.operatorRole = filterModel.operatorRole
  }
  if (filterModel.operationType) {
    params.operationType = filterModel.operationType
  }
  if (filterModel.targetType) {
    params.targetType = filterModel.targetType
  }
  if (filterModel.startTime) {
    params.startTime = filterModel.startTime
  }
  if (filterModel.endTime) {
    params.endTime = filterModel.endTime
  }
  auditStore.setFilterParams(params)
}

function handleReset() {
  Object.assign(filterModel, {
    operatorName: '',
    operatorRole: '',
    operationType: '',
    targetType: '',
    startTime: '',
    endTime: ''
  })
  auditStore.clearFilters()
}

function handleViewDetail(row: OperationLog) {
  currentLog.value = row
  detailDialogVisible.value = true
}

onMounted(() => {
  auditStore.fetchLogs()
})
</script>

<style scoped lang="scss">
.audit-page {
  padding: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.stats-bar {
  margin: 16px 0;

  .stat-card {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    text-align: center;
    border-left: 4px solid #409eff;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    &.stat-admin {
      border-left-color: #f56c6c;
    }

    &.stat-doctor {
      border-left-color: #67c23a;
    }

    &.stat-other {
      border-left-color: #e6a23c;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.table-card {
  margin-top: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.log-detail {
  .detail-card {
    margin-top: 16px;

    :deep(.el-card__header) {
      padding: 12px 20px;
    }
  }

  .card-title {
    font-weight: 600;
  }

  .json-preview {
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
