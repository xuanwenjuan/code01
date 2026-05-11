<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { OperationLog, OperationType } from '@/types/log'
import type { LogFilterParams } from '@/types/log'
import { useLogStore } from '@/stores'
import { getEmployeeNames } from '@/mock/baseData'
import { OPERATION_TYPE_MAP, OPERATION_TYPE_TAG_TYPE } from '@/types/log'
import { Collection, Save, DocumentChecked, RefreshRight, Download, Monitor, Document, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

interface SavedFilter {
  id: string
  name: string
  filters: LogFilterParams
  createdAt: string
}

const logStore = useLogStore()

const detailDialogVisible = ref(false)
const saveFilterDialogVisible = ref(false)
const currentLog = ref<OperationLog | undefined>()
const filterNameInput = ref('')
const timeRange = ref<[string, string] | undefined>(undefined)

const operationTypes = Object.entries(OPERATION_TYPE_MAP).map(([value, label]) => ({ value, label }))
const operators = getEmployeeNames().map(name => ({ value: name, label: name }))

const tableData = computed(() => logStore.logs)
const total = computed(() => logStore.total)
const loading = computed(() => logStore.loading)
const pagination = computed(() => logStore.pagination)
const filters = computed(() => logStore.filters)

const savedFilters = computed((): SavedFilter[] => {
  const saved = localStorage.getItem('log-saved-filters')
  return saved ? (JSON.parse(saved) as SavedFilter[]) : []
})

const hasActiveFilters = computed(() => {
  const f = filters.value
  return f.keyword || f.operationType || f.operator || 
         f.targetType || f.startTime || f.endTime
})

const logStats = computed(() => {
  const logs = logStore.logs
  const stats: Record<string, number> = {}
  logs.forEach(log => {
    stats[log.operationType] = (stats[log.operationType] || 0) + 1
  })
  return stats
})

const topStats = computed(() => {
  const stats = [
    { label: '今日操作', value: getTodayCount(), type: 'create' },
    { label: '资产操作', value: getTargetTypeCount('asset'), type: 'update' },
    { label: '领用操作', value: getTargetTypeCount('borrow'), type: 'borrow' },
    { label: '删除操作', value: getOperationTypeCount('delete'), type: 'delete' }
  ]
  return stats
})

function getTodayCount(): number {
  const today = dayjs().format('YYYY-MM-DD')
  return logStore.logs.filter(log => 
    dayjs(log.operationTime).format('YYYY-MM-DD') === today
  ).length
}

function getTargetTypeCount(type: 'asset' | 'borrow'): number {
  return logStore.logs.filter(log => log.targetType === type).length
}

function getOperationTypeCount(type: OperationType): number {
  return logStore.logs.filter(log => log.operationType === type).length
}

watch(timeRange, (newVal) => {
  if (newVal && newVal.length === 2) {
    logStore.filters.startTime = newVal[0]
    logStore.filters.endTime = newVal[1]
  } else {
    logStore.filters.startTime = ''
    logStore.filters.endTime = ''
  }
})

onMounted(() => {
  logStore.fetchLogs()
  logStore.startListening()
})

onUnmounted(() => {
  logStore.stopListening()
})

watch(() => pagination.value.page, () => {
  logStore.fetchLogs()
})

watch(() => pagination.value.pageSize, () => {
  logStore.fetchLogs()
})

const handleSearch = () => {
  logStore.setPage(1)
  logStore.fetchLogs()
}

const handleReset = () => {
  logStore.resetFilters()
  timeRange.value = undefined
  logStore.fetchLogs()
}

const handlePageChange = (page: number) => {
  logStore.setPage(page)
}

const handleSizeChange = (size: number) => {
  logStore.setPageSize(size)
}

const handleViewDetail = (row: OperationLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

const handleRefresh = () => {
  logStore.fetchLogs()
  ElMessage.success('已刷新')
}

const handleSaveFilter = () => {
  saveFilterDialogVisible.value = true
  filterNameInput.value = ''
}

const confirmSaveFilter = () => {
  if (!filterNameInput.value.trim()) {
    ElMessage.warning('请输入筛选名称')
    return
  }
  
  const saved = savedFilters.value || []
  saved.push({
    id: `filter-${Date.now()}`,
    name: filterNameInput.value,
    filters: { ...filters.value },
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('log-saved-filters', JSON.stringify(saved))
  
  ElMessage.success('筛选条件已保存')
  saveFilterDialogVisible.value = false
}

const handleApplySavedFilter = (id: string) => {
  const saved = savedFilters.value || []
  const filter = saved.find((f: SavedFilter) => f.id === id)
  if (filter) {
    logStore.filters = { ...filter.filters }
    logStore.setPage(1)
    logStore.fetchLogs()
    ElMessage.success('已应用筛选条件')
  }
}

const handleDeleteSavedFilter = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这个保存的筛选条件吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const saved = savedFilters.value || []
    const filtered = saved.filter((f: SavedFilter) => f.id !== id)
    localStorage.setItem('log-saved-filters', JSON.stringify(filtered))
    ElMessage.success('已删除')
  }).catch(() => {})
}

const handleExport = () => {
  const logs = logStore.logs
  const csvContent = [
    ['操作时间', '操作类型', '操作人', '目标名称', '目标类型', '操作描述', '备注'].join(','),
    ...logs.map(log => [
      formatTime(log.operationTime),
      OPERATION_TYPE_MAP[log.operationType as keyof typeof OPERATION_TYPE_MAP],
      log.operator,
      log.targetName,
      getTargetTypeLabel(log.targetType),
      log.description,
      log.remark || ''
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([`\ufeff${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `操作日志_${dayjs().format('YYYYMMDDHHmmss')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  ElMessage.success('导出成功')
}

const getTypeTagType = (type: string) => {
  return OPERATION_TYPE_TAG_TYPE[type as keyof typeof OPERATION_TYPE_TAG_TYPE]
}

const getTargetTypeLabel = (type: string) => {
  return type === 'asset' ? '资产' : '领用'
}

const getTargetTypeTagType = (type: string) => {
  return type === 'asset' ? 'primary' : 'success'
}

const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

const getOperationIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    create: '➕',
    update: '✏️',
    delete: '🗑️',
    borrow: '📤',
    return: '📥',
    approve: '✅',
    reject: '❌',
    repair: '🔧',
    scrap: '♻️',
    adjust: '🔄'
  }
  return iconMap[type] || '📝'
}
</script>

<template>
  <div class="logs-page">
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">操作日志</h2>
        <p class="page-subtitle">记录和追溯系统所有操作记录</p>
      </div>
      <div class="header-right">
        <el-button 
          v-if="hasActiveFilters" 
          type="success" 
          :icon="Save"
          @click="handleSaveFilter"
        >
          保存筛选
        </el-button>
        <el-button :icon="RefreshRight" @click="handleRefresh">
          刷新
        </el-button>
        <el-button type="primary" :icon="Download" @click="handleExport">
          导出
        </el-button>
      </div>
    </div>
    
    <el-card class="stats-card">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon create">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ topStats[0].value }}</div>
              <div class="stat-label">{{ topStats[0].label }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon update">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ topStats[1].value }}</div>
              <div class="stat-label">{{ topStats[1].label }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon borrow">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ topStats[2].value }}</div>
              <div class="stat-label">{{ topStats[2].label }}</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :span="6">
          <div class="stat-item">
            <div class="stat-icon delete">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value danger">{{ topStats[3].value }}</div>
              <div class="stat-label">{{ topStats[3].label }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    
    <el-card v-if="savedFilters.length > 0" class="saved-filters-card">
      <div class="saved-filters-header">
        <el-icon><Collection /></el-icon>
        <span>已保存的筛选条件</span>
      </div>
      <div class="saved-filters-list">
        <el-tag
          v-for="savedFilter in savedFilters"
          :key="savedFilter.id"
          class="saved-filter-tag"
          closable
          @close="handleDeleteSavedFilter(savedFilter.id)"
          @click="handleApplySavedFilter(savedFilter.id)"
        >
          {{ savedFilter.name }}
        </el-tag>
      </div>
    </el-card>
    
    <el-card class="search-card">
      <el-form :model="filters" inline class="search-form">
        <el-form-item label="关键词">
          <el-input 
            v-model="filters.keyword" 
            placeholder="操作人/目标名称/描述"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.operationType" placeholder="全部类型" clearable>
            <el-option
              v-for="item in operationTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-select v-model="filters.operator" placeholder="全部操作人" clearable filterable>
            <el-option
              v-for="item in operators"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型">
          <el-select v-model="filters.targetType" placeholder="全部" clearable>
            <el-option label="资产" value="asset" />
            <el-option label="领用" value="borrow" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>日志列表 (共 {{ total }} 条)</span>
        </div>
      </template>
      
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        :empty-text="'暂无操作日志'"
        @row-click="handleViewDetail"
        :row-class-name="'clickable-row'"
      >
        <el-table-column label="图标" width="60">
          <template #default="{ row }">
            <span class="operation-icon">{{ getOperationIcon(row.operationType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.operationType)" size="small">
              {{ OPERATION_TYPE_MAP[row.operationType as keyof typeof OPERATION_TYPE_MAP] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="targetName" label="目标名称" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click.stop="handleViewDetail(row)">
              {{ row.targetName }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="80">
          <template #default="{ row }">
            <el-tag :type="getTargetTypeTagType(row.targetType)" size="small" effect="plain">
              {{ getTargetTypeLabel(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operationTime" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.operationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    
    <el-dialog
      title="日志详情"
      v-model="detailDialogVisible"
      :width="500"
    >
      <div v-if="currentLog" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作类型">
            <div class="detail-type">
              <span class="detail-icon">{{ getOperationIcon(currentLog.operationType) }}</span>
              <el-tag :type="getTypeTagType(currentLog.operationType)">
                {{ OPERATION_TYPE_MAP[currentLog.operationType as keyof typeof OPERATION_TYPE_MAP] }}
              </el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            <span class="detail-operator">{{ currentLog.operator }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="目标名称">{{ currentLog.targetName }}</el-descriptions-item>
          <el-descriptions-item label="目标类型">
            <el-tag :type="getTargetTypeTagType(currentLog.targetType)">
              {{ getTargetTypeLabel(currentLog.targetType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatTime(currentLog.operationTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ currentLog.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      title="保存筛选条件"
      v-model="saveFilterDialogVisible"
      :width="400"
    >
      <el-form>
        <el-form-item label="筛选名称">
          <el-input 
            v-model="filterNameInput" 
            placeholder="例如：管理员删除操作"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="saveFilterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveFilter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.logs-page {
  .page-header {
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    .page-subtitle {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
    
    .header-right {
      display: flex;
      gap: 8px;
    }
  }
  
  .stats-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .stat-item {
      display: flex;
      align-items: center;
      padding: 16px;
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        
        &.create {
          background-color: rgba(103, 194, 58, 0.1);
          color: #67C23A;
        }
        
        &.update {
          background-color: rgba(64, 158, 255, 0.1);
          color: #409EFF;
        }
        
        &.borrow {
          background-color: rgba(230, 162, 60, 0.1);
          color: #E6A23C;
        }
        
        &.delete {
          background-color: rgba(245, 108, 108, 0.1);
          color: #F56C6C;
        }
      }
      
      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
          margin-bottom: 4px;
          
          &.danger {
            color: #F56C6C;
          }
        }
        
        .stat-label {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
  
  .saved-filters-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .saved-filters-header {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #606266;
      margin-bottom: 12px;
      
      .el-icon {
        margin-right: 8px;
      }
    }
    
    .saved-filters-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .saved-filter-tag {
        cursor: pointer;
        
        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }
  
  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .search-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }
  }
  
  .table-card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    
    .operation-icon {
      font-size: 18px;
    }
    
    :deep(.clickable-row) {
      cursor: pointer;
      
      &:hover {
        background-color: rgba(64, 158, 255, 0.02) !important;
      }
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
  
  .detail-content {
    .detail-type {
      display: flex;
      align-items: center;
      
      .detail-icon {
        font-size: 20px;
        margin-right: 8px;
      }
    }
    
    .detail-operator {
      font-weight: 600;
      color: #409EFF;
    }
  }
}

@media (max-width: 768px) {
  .logs-page {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      
      .header-right {
        margin-top: 16px;
        flex-wrap: wrap;
      }
    }
    
    .stats-card {
      .stat-item {
        margin-bottom: 16px;
      }
    }
    
    .search-card {
      .search-form {
        :deep(.el-form-item) {
          display: block;
          margin-bottom: 12px;
          width: 100%;
        }
      }
    }
    
    .table-card {
      :deep(.el-table) {
        font-size: 12px;
      }
    }
  }
}
</style>
