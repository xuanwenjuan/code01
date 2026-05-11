<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHospitalStore } from '@/stores/hospital'
import type { OperationLog, OperationType } from '@/types'

const store = useHospitalStore()

const filterOperator = ref('')
const filterOperationType = ref('')
const filterOperatorRole = ref<'admin' | 'registrar' | ''>('')
const filterTargetType = ref<'doctor' | 'schedule' | 'slot' | 'registration' | ''>('')
const dateRange = ref<[string, string] | null>(null)
const detailDialogVisible = ref(false)
const selectedLog = ref<OperationLog | null>(null)

const operationTypeOptions = [
  { label: '添加医生', value: '添加医生' },
  { label: '编辑医生信息', value: '编辑医生信息' },
  { label: '删除医生', value: '删除医生' },
  { label: '修改出诊状态', value: '修改出诊状态' },
  { label: '创建排班', value: '创建排班' },
  { label: '编辑排班', value: '编辑排班' },
  { label: '删除排班', value: '删除排班' },
  { label: '锁定号源', value: '锁定号源' },
  { label: '解锁号源', value: '解锁号源' },
  { label: '释放号源', value: '释放号源' },
  { label: '添加停诊备注', value: '添加停诊备注' },
  { label: '患者挂号', value: '患者挂号' },
  { label: '取消挂号', value: '取消挂号' },
  { label: '批量创建排班', value: '批量创建排班' },
  { label: '批量锁定号源', value: '批量锁定号源' },
  { label: '批量解锁号源', value: '批量解锁号源' }
]

const operatorRoleOptions = [
  { label: '全部角色', value: '' },
  { label: '管理员', value: 'admin' },
  { label: '挂号员', value: 'registrar' }
]

const targetTypeOptions = [
  { label: '全部类型', value: '' },
  { label: '医生', value: 'doctor' },
  { label: '排班', value: 'schedule' },
  { label: '号源', value: 'slot' },
  { label: '挂号', value: 'registration' }
]

const filteredLogs = computed(() => {
  let result = store.logs
  
  if (filterOperator.value) {
    result = result.filter(l => l.operator.includes(filterOperator.value))
  }
  if (filterOperationType.value) {
    result = result.filter(l => l.operationType === filterOperationType.value)
  }
  if (filterOperatorRole.value) {
    result = result.filter(l => l.operatorRole === filterOperatorRole.value)
  }
  if (filterTargetType.value) {
    result = result.filter(l => l.targetType === filterTargetType.value)
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    result = result.filter(l => {
      const date = l.timestamp.split('T')[0]
      return date >= dateRange.value![0] && date <= dateRange.value![1]
    })
  }
  
  return result
})

const logsStats = computed(() => {
  const logs = store.logs
  const today = new Date().toISOString().split('T')[0]
  const todayLogs = logs.filter(l => l.timestamp.startsWith(today))
  
  return {
    total: logs.length,
    today: todayLogs.length,
    adminCount: logs.filter(l => l.operatorRole === 'admin').length,
    registrarCount: logs.filter(l => l.operatorRole === 'registrar').length
  }
})

const roleMap = {
  admin: { label: '管理员', type: 'primary' as const },
  registrar: { label: '挂号员', type: 'success' as const }
}

const targetTypeMap: Record<string, { label: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  doctor: { label: '医生', type: 'primary' },
  schedule: { label: '排班', type: 'success' },
  slot: { label: '号源', type: 'warning' },
  registration: { label: '挂号', type: 'danger' }
}

const handleViewDetail = (log: OperationLog) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filterOperator.value) count++
  if (filterOperationType.value) count++
  if (filterOperatorRole.value) count++
  if (filterTargetType.value) count++
  if (dateRange.value) count++
  return count
})

const handleReset = () => {
  filterOperator.value = ''
  filterOperationType.value = ''
  filterOperatorRole.value = ''
  filterTargetType.value = ''
  dateRange.value = null
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getOperationIcon = (operationType: string) => {
  if (operationType.includes('添加') || operationType.includes('创建')) return 'Plus'
  if (operationType.includes('编辑') || operationType.includes('修改')) return 'Edit'
  if (operationType.includes('删除')) return 'Delete'
  if (operationType.includes('锁定')) return 'Lock'
  if (operationType.includes('解锁')) return 'Unlock'
  if (operationType.includes('挂号')) return 'Tickets'
  if (operationType.includes('取消')) return 'Close'
  if (operationType.includes('释放')) return 'RefreshLeft'
  if (operationType.includes('批量')) return 'DocumentChecked'
  return 'Document'
}
</script>

<template>
  <div class="operation-logs">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ logsStats.total }}</div>
            <div class="stat-label">总操作数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ logsStats.today }}</div>
            <div class="stat-label">今日操作</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ logsStats.adminCount }}</div>
            <div class="stat-label">管理员操作</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #909399;">
            <el-icon><Tickets /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ logsStats.registrarCount }}</div>
            <div class="stat-label">挂号员操作</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">
            操作履历与审计
            <el-tag v-if="activeFilterCount > 0" type="info" size="small" style="margin-left: 8px;">
              {{ activeFilterCount }} 个筛选条件
            </el-tag>
          </span>
          <el-tag type="info">共 {{ filteredLogs.length }} 条记录</el-tag>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="操作人">
          <el-input
            v-model="filterOperator"
            placeholder="输入操作人"
            style="width: 120px"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select
            v-model="filterOperationType"
            placeholder="全部类型"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in operationTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="角色">
          <el-select
            v-model="filterOperatorRole"
            style="width: 100px"
          >
            <el-option
              v-for="opt in operatorRoleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="目标类型">
          <el-select
            v-model="filterTargetType"
            style="width: 100px"
          >
            <el-option
              v-for="opt in targetTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <el-empty
        v-if="filteredLogs.length === 0"
        description="暂无符合条件的操作记录"
        :image-size="80"
      />
      
      <div v-else class="logs-container">
        <el-table :data="filteredLogs" stripe>
          <el-table-column label="时间" width="180">
            <template #default="{ row }">
              <div style="font-size: 13px;">{{ formatTime(row.timestamp) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作人" width="120">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-avatar :size="24">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>{{ row.operator }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="角色" width="90">
            <template #default="{ row }">
              <el-tag :type="roleMap[row.operatorRole].type" size="small">
                {{ roleMap[row.operatorRole].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作类型" width="130">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                <el-icon style="margin-right: 4px;">
                  <component :is="getOperationIcon(row.operationType)" />
                </el-icon>
                {{ row.operationType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="目标类型" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.targetType" :type="targetTypeMap[row.targetType].type" size="small">
                {{ targetTypeMap[row.targetType].label }}
              </el-tag>
              <span v-else style="color: #C0C4CC;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="目标ID" width="100">
            <template #default="{ row }">
              <span style="font-family: monospace; color: #606266;">{{ row.targetId || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作详情" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.operationDetail }}
            </template>
          </el-table-column>
          <el-table-column label="IP地址" width="130">
            <template #default="{ row }">
              <span style="font-family: monospace; color: #909399;">{{ row.ipAddress || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewDetail(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="操作详情"
      width="500px"
    >
      <el-descriptions v-if="selectedLog" :column="1" border>
        <el-descriptions-item label="日志ID">
          <span style="font-family: monospace;">{{ selectedLog.id }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ formatTime(selectedLog.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作人">
          <el-tag :type="roleMap[selectedLog.operatorRole].type" size="small">
            {{ roleMap[selectedLog.operatorRole].label }}
          </el-tag>
          <span style="margin-left: 8px;">{{ selectedLog.operator }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作类型">
          {{ selectedLog.operationType }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.targetType" label="目标类型">
          <el-tag :type="targetTypeMap[selectedLog.targetType].type" size="small">
            {{ targetTypeMap[selectedLog.targetType].label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.targetId" label="目标ID">
          <span style="font-family: monospace;">{{ selectedLog.targetId }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作详情">
          {{ selectedLog.operationDetail }}
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.ipAddress" label="IP地址">
          <span style="font-family: monospace;">{{ selectedLog.ipAddress }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog.deviceInfo" label="设备信息">
          <span style="word-break: break-all;">{{ selectedLog.deviceInfo }}</span>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
}

.stat-card .el-card__body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px !important;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.logs-container {
  overflow-x: auto;
}

@media screen and (max-width: 768px) {
  .stats-row {
    margin-bottom: 10px;
  }
  
  .stat-value {
    font-size: 18px !important;
  }
  
  .stat-label {
    font-size: 11px !important;
  }
  
  .filter-form :deep(.el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>
