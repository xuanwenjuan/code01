<template>
  <div class="logs-page">
    <div class="page-header flex-between">
      <h2 class="page-title">操作履历</h2>
      <div class="header-actions">
        <el-button :icon="Download" plain @click="handleExport">
          导出记录
        </el-button>
        <el-popconfirm title="确定要清空所有操作记录吗？此操作不可恢复。" @confirm="handleClearAll">
          <template #reference>
            <el-button :icon="Delete" type="danger" plain>清空记录</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    
    <div class="card-container">
      <div class="filter-bar">
        <el-form :model="filterForm" inline>
          <el-form-item label="操作类型">
            <el-select v-model="filterForm.type" placeholder="全部" clearable style="width: 140px">
              <el-option
                v-for="[value, label] in operationTypeEntries"
                :key="value"
                :label="`${label} (${logStore.getCountByType(value)})`"
                :value="value"
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
              style="width: 260px"
            />
          </el-form-item>
          
          <el-form-item label="关键词">
            <el-input
              v-model="filterForm.keyword"
              placeholder="搜索描述或详情"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="isFilterActive" class="active-filters flex-between">
          <div class="filter-tags">
            <span class="filter-label">当前筛选：</span>
            <el-tag
              v-if="filterForm.type"
              size="small"
              closable
              @close="clearFilter('type')"
            >
              类型: {{ OPERATION_TYPE_LABELS[filterForm.type] }}
            </el-tag>
            <el-tag
              v-if="dateRange"
              size="small"
              closable
              @close="clearDateRange"
            >
              日期: {{ dateRange[0] }} 至 {{ dateRange[1] }}
            </el-tag>
            <el-tag
              v-if="filterForm.keyword"
              size="small"
              closable
              @close="clearFilter('keyword')"
            >
              关键词: {{ filterForm.keyword }}
            </el-tag>
          </div>
          <el-button type="primary" link size="small" @click="handleReset">清除全部</el-button>
        </div>
      </div>
      
      <div class="stats-bar flex-between">
        <span>共 <span class="highlight">{{ filteredLogs.length }}</span> 条记录</span>
        <div class="type-stats" v-if="!filterForm.type">
          <el-tag
            v-for="[value, label] in operationTypeEntries"
            :key="value"
            :type="getTypeTagColor(value)"
            :effect="'light'"
            size="small"
          >
            {{ label }}: {{ logStore.getCountByType(value) }}
          </el-tag>
        </div>
      </div>
      
      <div class="logs-list">
        <el-timeline>
          <el-timeline-item
            v-for="log in paginatedLogs"
            :key="log.id"
            :timestamp="formatDateTime(log.timestamp)"
            placement="top"
            :type="getTypeTagColor(log.type)"
          >
            <div class="log-card">
              <div class="log-header flex-between">
                <div class="log-header-left">
                  <el-tag :type="getTypeTagColor(log.type)" size="small" class="log-tag">
                    {{ OPERATION_TYPE_LABELS[log.type] }}
                  </el-tag>
                  <span class="log-time text-light">{{ formatDateTime(log.timestamp) }}</span>
                </div>
                <el-dropdown trigger="click" @command="(cmd: string) => handleLogAction(cmd, log)">
                  <el-button type="primary" link :icon="MoreFilled" circle size="small" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="detail">
                        <el-icon><InfoFilled /></el-icon>
                        查看详情
                      </el-dropdown-item>
                      <el-dropdown-item divided command="delete">
                        <el-icon><Delete /></el-icon>
                        删除记录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="log-content">
                <div class="log-description">
                  <el-icon><Document /></el-icon>
                  <span>{{ log.description }}</span>
                </div>
                <div v-if="log.detail" class="log-detail">
                  <el-icon class="detail-icon"><InfoFilled /></el-icon>
                  <span>{{ log.detail }}</span>
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        
        <el-empty v-if="filteredLogs.length === 0" description="暂无操作记录" />
        
        <div class="pagination-wrapper flex-center">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredLogs.length"
            layout="total, sizes, prev, pager, next"
            small
          />
        </div>
      </div>
    </div>
    
    <el-dialog
      v-model="detailDialogVisible"
      title="操作详情"
      width="500px"
      destroy-on-close
    >
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item label="操作类型">
          <el-tag :type="getTypeTagColor(currentLog.type)">
            {{ OPERATION_TYPE_LABELS[currentLog.type] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">
          {{ formatDateTime(currentLog.timestamp) }}
        </el-descriptions-item>
        <el-descriptions-item label="操作描述">
          {{ currentLog.description }}
        </el-descriptions-item>
        <el-descriptions-item label="详细信息">
          {{ currentLog.detail || '无' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLogStore } from '@/stores/log'
import { OPERATION_TYPE_LABELS } from '@/constants'
import { formatDateTime } from '@/utils'
import type { OperationType, LogFilter, OperationLog } from '@/types'

const logStore = useLogStore()

const dateRange = ref<[string, string] | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const currentLog = ref<OperationLog | null>(null)

const defaultFilter: LogFilter = {
  type: undefined,
  startDate: undefined,
  endDate: undefined,
  keyword: undefined,
}

const filterForm = reactive<LogFilter>({ ...defaultFilter })

const operationTypeEntries = computed(() => 
  Object.entries(OPERATION_TYPE_LABELS) as Array<[OperationType, string]>
)

const isFilterActive = computed(() => 
  filterForm.type !== undefined ||
  dateRange.value !== null ||
  filterForm.keyword !== undefined
)

const filteredLogs = computed(() => {
  const filter: LogFilter = { ...filterForm }
  if (dateRange.value) {
    filter.startDate = dateRange.value[0]
    filter.endDate = dateRange.value[1]
  }
  return logStore.getLogsByFilter(filter)
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

function getTypeTagColor(type: OperationType): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const colorMap: Record<OperationType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    add_bill: 'success',
    edit_bill: 'primary',
    delete_bill: 'danger',
    update_budget: 'warning',
    adjust_budget: 'info',
    add_budget: 'success',
    add_note: 'info',
  }
  return colorMap[type]
}

function handleSearch(): void {
  currentPage.value = 1
}

function handleReset(): void {
  Object.assign(filterForm, defaultFilter)
  dateRange.value = null
  currentPage.value = 1
}

function clearFilter(key: keyof LogFilter): void {
  if (key in filterForm) {
    ;(filterForm as Record<string, OperationType | string | undefined>)[key] = undefined
  }
  currentPage.value = 1
}

function clearDateRange(): void {
  dateRange.value = null
  filterForm.startDate = undefined
  filterForm.endDate = undefined
  currentPage.value = 1
}

function handleLogAction(command: string, log: OperationLog): void {
  switch (command) {
    case 'detail':
      currentLog.value = log
      detailDialogVisible.value = true
      break
    case 'delete':
      handleDeleteLog(log)
      break
  }
}

async function handleDeleteLog(log: OperationLog): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该操作记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    const success = logStore.deleteLog(log.id)
    if (success) {
      ElMessage.success('记录已删除')
    }
  } catch {
  }
}

function handleClearAll(): void {
  logStore.clearLogs()
  ElMessage.success('已清空所有操作记录')
  currentPage.value = 1
}

function handleExport(): void {
  const data = JSON.stringify(logStore.logs, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `operation-logs-${formatDateTime(new Date()).replace(/[:]/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}
</script>

<style scoped lang="scss">
.logs-page {
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      color: #303133;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .filter-bar {
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;
    
    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;
    }
    
    .active-filters {
      padding-top: 12px;
      margin-top: 4px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      
      .filter-tags {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        
        .filter-label {
          color: #606266;
          font-size: 13px;
        }
      }
    }
  }
  
  .stats-bar {
    padding: 16px 0;
    
    .highlight {
      color: #409eff;
      font-weight: 600;
    }
    
    .type-stats {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      @media screen and (max-width: $breakpoint-tablet) {
        display: none;
      }
    }
  }
  
  .logs-list {
    padding: 20px 0;
    
    .log-card {
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 16px;
      
      .log-header {
        margin-bottom: 12px;
        
        .log-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .log-tag {
          flex-shrink: 0;
        }
        
        .log-time {
          font-size: 12px;
        }
      }
      
      .log-content {
        .log-description {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 14px;
          color: #303133;
          line-height: 1.5;
          
          el-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }
        }
        
        .log-detail {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 8px;
          padding-left: 24px;
          font-size: 13px;
          color: #909399;
          line-height: 1.5;
          
          .detail-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }
        }
      }
    }
  }
  
  .pagination-wrapper {
    padding-top: 20px;
  }
}

@media screen and (max-width: $breakpoint-tablet) {
  .logs-page {
    .filter-bar {
      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 12px;
      }
      
      :deep(.el-select),
      :deep(.el-date-editor),
      :deep(.el-input) {
        width: 100% !important;
      }
    }
  }
}
</style>
