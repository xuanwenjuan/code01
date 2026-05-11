<template>
  <div class="logs-page">
    <div class="page-header">
      <h1 class="page-title">操作履历</h1>
      <div class="page-actions">
        <el-tag type="info">共 {{ logStore.totalLogs }} 条记录</el-tag>
        <el-button @click="refreshAllLogs">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <div class="filter-panel">
      <div class="filter-row">
        <el-input
          class="filter-item"
          v-model="filterParams.keyword"
          placeholder="搜索操作描述或课程名称"
          clearable
          @keyup.enter="applyFilter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          class="filter-item"
          v-model="filterParams.type"
          placeholder="操作类型"
          clearable
        >
          <el-option
            v-for="(label, value) in OperationTypeMap"
            :key="value"
            :label="label"
            :value="value"
          />
        </el-select>
        
        <el-date-picker
          class="filter-item"
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
      </div>
      
      <div class="filter-actions">
        <el-button @click="resetFilter">重置</el-button>
        <el-button type="primary" @click="applyFilter">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作记录</span>
          <el-tag type="primary">筛选结果: {{ filteredLogs.length }} 条</el-tag>
        </div>
      </template>
      
      <el-timeline v-if="filteredLogs.length > 0" class="timeline-log">
        <el-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          :type="timelineType(log.type)"
          :timestamp="formatDate(log.createdAt)"
          placement="top"
          :hollow="true"
        >
          <div class="timeline-item">
            <div class="timeline-header">
              <div class="timeline-header-left">
                <span class="log-type">
                  <el-tag :type="timelineType(log.type)" size="small">
                    {{ OperationTypeMap[log.type] }}
                  </el-tag>
                </span>
                <span v-if="log.courseName" class="log-course-link">
                  <el-icon><Reading /></el-icon>
                  {{ log.courseName }}
                </span>
              </div>
              <div class="timeline-header-right">
                <span class="log-time">{{ formatDate(log.createdAt, 'YYYY-MM-DD HH:mm:ss') }}</span>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="toggleDetail(log.id)"
                >
                  <el-icon>
                    <component :is="expandedLogs.has(log.id) ? 'ArrowUp' : 'ArrowDown'" />
                  </el-icon>
                  {{ expandedLogs.has(log.id) ? '收起' : '详情' }}
                </el-button>
              </div>
            </div>
            
            <div class="timeline-content">
              {{ log.description }}
            </div>
            
            <el-collapse-transition>
              <div v-show="expandedLogs.has(log.id)" class="timeline-detail-panel">
                <div class="detail-title">操作详情</div>
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="日志ID">
                    <el-tag size="small" type="info">{{ log.id }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="操作类型">
                    {{ OperationTypeMap[log.type] }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="log.courseId" label="课程ID">
                    {{ log.courseId }}
                  </el-descriptions-item>
                  <el-descriptions-item v-if="log.courseName" label="课程名称">
                    {{ log.courseName }}
                  </el-descriptions-item>
                  <el-descriptions-item label="操作时间">
                    {{ formatDate(log.createdAt, 'YYYY-MM-DD HH:mm:ss') }}
                  </el-descriptions-item>
                  <el-descriptions-item label="详细数据">
                    <pre class="detail-json">{{ formatDetail(log.detail) }}</pre>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-collapse-transition>
          </div>
        </el-timeline-item>
      </el-timeline>
      
      <el-empty v-else description="暂无符合条件的操作记录">
        <el-button type="primary" @click="resetFilter">清除筛选条件</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useLogStore } from '@/stores/log'
import { OperationType, OperationTypeMap } from '@/types'
import { formatDate } from '@/utils'
import type { LogFilterParams } from '@/types'

const logStore = useLogStore()

const dateRange = ref<[string, string] | null>(null)
const expandedLogs = ref<Set<string>>(new Set())

const defaultFilterParams = (): LogFilterParams => ({
  keyword: '',
  type: undefined,
  startTime: undefined,
  endTime: undefined
})

const filterParams = reactive<LogFilterParams>(defaultFilterParams())
const appliedFilter = ref<LogFilterParams>(defaultFilterParams())

const filteredLogs = computed(() => {
  return logStore.filterLogs(appliedFilter.value)
})

const toggleDetail = (id: string): void => {
  if (expandedLogs.value.has(id)) {
    expandedLogs.value.delete(id)
  } else {
    expandedLogs.value.add(id)
  }
}

const applyFilter = (): void => {
  const params: LogFilterParams = { ...filterParams }
  if (dateRange.value) {
    params.startTime = dateRange.value[0]
    params.endTime = dateRange.value[1]
  }
  appliedFilter.value = params
}

const resetFilter = (): void => {
  Object.assign(filterParams, defaultFilterParams())
  dateRange.value = null
  appliedFilter.value = defaultFilterParams()
  expandedLogs.value.clear()
}

const refreshAllLogs = (): void => {
  logStore.initializeLogs()
}

const timelineType = (type: OperationType): string => {
  switch (type) {
    case OperationType.CHECK_IN:
    case OperationType.UPDATE_PROGRESS:
    case OperationType.ADD_NOTE:
      return 'success'
    case OperationType.DELETE_COURSE:
      return 'danger'
    case OperationType.UPDATE_STATUS:
    case OperationType.UPDATE_PLAN:
      return 'warning'
    default:
      return 'primary'
  }
}

const formatDetail = (detail: Record<string, unknown>): string => {
  try {
    return JSON.stringify(detail, null, 2)
  } catch {
    return String(detail)
  }
}
</script>

<style lang="scss" scoped>
.timeline-log {
  margin-bottom: 0;
  
  :deep(.el-timeline-item__wrapper) {
    padding-bottom: 32px;
  }
  
  :deep(.el-timeline-item__timestamp.is-top) {
    margin-bottom: 12px;
    color: #909399;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .timeline-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .timeline-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .log-course-link {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #409eff;
      cursor: default;
    }
    
    .log-time {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .timeline-content {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
  }
  
  .timeline-detail-panel {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px dashed #ebeef5;
    
    .detail-title {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }
    
    .detail-json {
      margin: 0;
      padding: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 200px;
      overflow-y: auto;
    }
  }
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
