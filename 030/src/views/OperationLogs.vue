<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommunityStore } from '@/stores'
import type { AdvancedFilter, OperationLog, UserRole, SelectOption } from '@/types'

const store = useCommunityStore()

const filter = ref<AdvancedFilter & { operatorName?: string; actionType?: string }>({
  keyword: '',
  operatorName: '',
  actionType: '',
  dateRange: undefined
})

const currentPage = ref(1)
const pageSize = ref(10)

const actionTypeOptions: SelectOption[] = [
  { label: '创建记录', value: '创建' },
  { label: '修改信息', value: '修改' },
  { label: '删除记录', value: '删除' },
  { label: '更新状态', value: '更新' },
  { label: '派单处理', value: '派单' },
  { label: '强制结单', value: '强制结单' },
  { label: '费用减免', value: '费用减免' },
  { label: '批量生成', value: '批量生成' }
]

const filteredLogs = computed(() => {
  let result = store.operationLogs
  
  if (filter.value.operatorName) {
    result = result.filter((l: OperationLog) => l.operatorName.includes(filter.value.operatorName!))
  }
  
  if (filter.value.actionType) {
    result = result.filter((l: OperationLog) => l.action.includes(filter.value.actionType!))
  }
  
  if (filter.value.keyword) {
    const keyword = filter.value.keyword
    result = result.filter((l: OperationLog) => 
      l.action.includes(keyword) || 
      l.targetName.includes(keyword) ||
      l.targetId.includes(keyword)
    )
  }
  
  if (filter.value.dateRange) {
    const [start, end] = filter.value.dateRange
    result = result.filter((l: OperationLog) => {
      const createTime = new Date(l.createTime)
      return createTime >= new Date(start) && createTime <= new Date(end + ' 23:59:59')
    })
  }
  
  return result
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

const operatorNames = computed(() => {
  const names = new Set(store.operationLogs.map((l: OperationLog) => l.operatorName))
  return Array.from(names)
})

const roleTagMap: Record<UserRole, { type: string; text: string }> = {
  admin: { type: 'danger', text: '管理员' },
  property: { type: 'primary', text: '物业' },
  maintenance: { type: 'warning', text: '维修' }
}

const operationTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  store.operationLogs.forEach((log: OperationLog) => {
    const type = log.targetType
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
})

const todayStats = computed(() => {
  const today = new Date().toDateString()
  return store.operationLogs.filter((l: OperationLog) => 
    new Date(l.createTime).toDateString() === today
  ).length
})

function handleSearch() {
  currentPage.value = 1
  ElMessage.success(`搜索完成，找到 ${filteredLogs.value.length} 条记录`)
}

function handleReset() {
  filter.value = {
    keyword: '',
    operatorName: '',
    actionType: '',
    dateRange: undefined
  }
  currentPage.value = 1
  ElMessage.info('已重置筛选条件')
}

function getRoleTag(role: OperationLog['operatorRole']) {
  return roleTagMap[role] || { type: 'info', text: role }
}

function getActionIcon(action: string) {
  if (action.includes('创建')) return 'Plus'
  if (action.includes('修改')) return 'Edit'
  if (action.includes('删除')) return 'Delete'
  if (action.includes('派单')) return 'UserFilled'
  if (action.includes('强制')) return 'Warning'
  if (action.includes('减免')) return 'Money'
  if (action.includes('批量')) return 'Document'
  if (action.includes('更新')) return 'Refresh'
  return 'Operation'
}

function getTimelineType(role: OperationLog['operatorRole']) {
  const typeMap: Record<UserRole, 'danger' | 'primary' | 'warning' | 'info'> = {
    admin: 'danger',
    property: 'primary',
    maintenance: 'warning'
  }
  return typeMap[role] || 'info'
}
</script>

<template>
  <div class="operation-logs">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#409EFF"><Document /></el-icon>
            <div>
              <div class="stat-value">{{ store.operationLogs.length }}</div>
              <div class="stat-label">总操作记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#67C23A"><Calendar /></el-icon>
            <div>
              <div class="stat-value">{{ todayStats }}</div>
              <div class="stat-label">今日操作</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#E6A23C"><User /></el-icon>
            <div>
              <div class="stat-value">{{ operatorNames.length }}</div>
              <div class="stat-label">操作人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <el-icon :size="32" color="#F56C6C"><DataAnalysis /></el-icon>
            <div>
              <div class="stat-value">{{ Object.keys(operationTypeStats).length }}</div>
              <div class="stat-label">操作类型</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="filter-card">
      <el-form :inline="true" :model="filter" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filter.keyword"
            placeholder="搜索操作/对象名称/ID"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="操作人">
          <el-select
            v-model="filter.operatorName"
            placeholder="请选择操作人"
            clearable
            filterable
            style="width: 150px"
          >
            <el-option
              v-for="name in operatorNames"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select
            v-model="filter.actionType"
            placeholder="请选择操作类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in actionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card>
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <el-icon><Clock /></el-icon>
            <span>操作履历时间线</span>
            <el-tag v-if="filter.keyword || filter.operatorName || filter.actionType || filter.dateRange" type="info" effect="light">
              筛选结果: {{ filteredLogs.length }} 条
            </el-tag>
          </div>
          <el-button type="primary" link @click="handleReset">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>
      
      <el-empty v-if="paginatedLogs.length === 0" description="暂无操作记录" />
      
      <el-timeline v-else class="logs-timeline">
        <el-timeline-item
          v-for="(log, index) in paginatedLogs"
          :key="log.id"
          :timestamp="log.createTime"
          placement="top"
          :type="getTimelineType(log.operatorRole)"
          :hollow="log.operatorRole === 'maintenance'"
        >
          <el-card class="log-card" shadow="hover">
            <div class="log-header">
              <div class="log-title">
                <el-icon class="action-icon">
                  <component :is="getActionIcon(log.action)" />
                </el-icon>
                <el-tag :type="getRoleTag(log.operatorRole).type" size="small" effect="dark">
                  {{ getRoleTag(log.operatorRole).text }}
                </el-tag>
                <span class="operator-name">{{ log.operatorName }}</span>
                <span class="action-text">{{ log.action }}</span>
              </div>
              <div class="log-meta">
                <span class="log-index">#{{ filteredLogs.length - index - (currentPage - 1) * pageSize }}</span>
                <el-tag type="info" size="small" effect="light">
                  {{ log.targetType }}
                </el-tag>
              </div>
            </div>
            
            <div class="log-content">
              <div class="log-row">
                <el-icon><InfoFilled /></el-icon>
                <span class="label">操作对象：</span>
                <span class="value highlight">{{ log.targetName }}</span>
                <span class="target-id">({{ log.targetId }})</span>
              </div>
              
              <template v-if="log.beforeChange || log.afterChange">
                <el-divider class="log-divider" />
                <div class="log-details">
                  <div v-if="log.beforeChange" class="log-detail before">
                    <el-icon><ArrowLeft /></el-icon>
                    <div class="detail-content">
                      <span class="label">变更前：</span>
                      <span class="value">{{ log.beforeChange }}</span>
                    </div>
                  </div>
                  <div v-if="log.afterChange" class="log-detail after">
                    <el-icon><ArrowRight /></el-icon>
                    <div class="detail-content">
                      <span class="label">变更后：</span>
                      <span class="value">{{ log.afterChange }}</span>
                    </div>
                  </div>
                </div>
              </template>
              
              <template v-if="log.remark">
                <el-divider class="log-divider" />
                <div class="log-remark">
                  <el-icon><ChatDotRound /></el-icon>
                  <span class="label">备注：</span>
                  <span class="value">{{ log.remark }}</span>
                </div>
              </template>
              
              <div class="log-footer">
                <div v-if="log.ip" class="log-ip">
                  <el-icon><Location /></el-icon>
                  <span>IP: {{ log.ip }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      
      <el-pagination
        v-if="filteredLogs.length > 0"
        class="pagination"
        background
        layout="prev, pager, next, jumper, total, sizes"
        :total="filteredLogs.length"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
      />
    </el-card>
  </div>
</template>

<style scoped>
.operation-logs {
  padding: 0;
}

.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: 8px;
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logs-timeline {
  padding: 10px 0;
}

.log-card {
  margin-bottom: 12px;
  transition: all 0.3s;
}

.log-card:hover {
  transform: translateX(4px);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-icon {
  color: #409EFF;
}

.operator-name {
  font-weight: 600;
  color: #303133;
}

.action-text {
  color: #409EFF;
  font-weight: 500;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-index {
  color: #909399;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.log-content {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-row .label {
  color: #909399;
  font-size: 13px;
}

.log-row .value {
  color: #303133;
  font-size: 14px;
}

.log-row .highlight {
  color: #409EFF;
  font-weight: 500;
}

.target-id {
  color: #909399;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.log-divider {
  margin: 12px 0;
}

.log-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
}

.log-detail.before {
  background-color: rgba(245, 108, 108, 0.08);
  border-left: 3px solid #f56c6c;
}

.log-detail.after {
  background-color: rgba(103, 194, 58, 0.08);
  border-left: 3px solid #67c23a;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.detail-content .label {
  font-size: 12px;
  color: #909399;
}

.detail-content .value {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
}

.log-remark {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: rgba(64, 158, 255, 0.08);
  border-radius: 6px;
  border-left: 3px solid #409EFF;
}

.log-footer {
  margin-top: 12px;
}

.log-ip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
