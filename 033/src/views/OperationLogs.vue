<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { LogFilter, ActionType, OperationLog } from '@/types'
import { ActionTypeLabels } from '@/types'
import { useLogStore } from '@/stores/log'
import { getTodayString } from '@/utils/date'

const logStore = useLogStore()

const filter = ref<LogFilter>({})

interface OperatorOption {
  value: string
  label: string
}

const operatorOptions = computed<OperatorOption[]>(() => {
  return [
    { value: '', label: '全部操作人' },
    ...logStore.getUniqueOperators().map((name: string) => ({
      value: name,
      label: name
    }))
  ]
})

interface ActionTypeOption {
  value: ActionType | ''
  label: string
}

const actionTypeOptions = computed<ActionTypeOption[]>(() => [
  { value: '', label: '全部操作类型' },
  ...logStore.getActionTypes().map((type: ActionType) => ({
    value: type,
    label: ActionTypeLabels[type]
  }))
])

interface TargetTypeOption {
  value: '' | 'medicine' | 'reminder'
  label: string
}

const targetTypeOptions: TargetTypeOption[] = [
  { value: '', label: '全部目标类型' },
  { value: 'medicine', label: '药品' },
  { value: 'reminder', label: '用药提醒' }
]

const today = getTodayString()

const filteredLogs = computed<OperationLog[]>(() => {
  return logStore.filterLogs(filter.value)
})

const hasActiveFilter = computed<boolean>(() => {
  return !!(filter.value.operatorName || filter.value.actionType || filter.value.targetType || filter.value.dateRange)
})

const filterResultCount = computed<number>(() => {
  return filteredLogs.value.length
})

function resetFilter(): void {
  filter.value = {}
}

function getTodayOperationCount(): number {
  return logStore.logs.filter((log: OperationLog) => log.createdAt.startsWith(today)).length
}

function actionTypeTagType(type: ActionType): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<ActionType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    add: 'primary',
    update: 'info',
    delete: 'danger',
    consume: 'warning',
    replenish: 'success',
    mark_taken: 'success',
    mark_skipped: 'warning',
    update_reminder: 'info'
  }
  return map[type]
}

function formatTargetType(targetType: 'medicine' | 'reminder'): string {
  return targetType === 'medicine' ? '药品' : '用药提醒'
}

onMounted(() => {
  logStore.initLogs()
})
</script>

<template>
  <div class="logs-page">
    <div class="page-header">
      <h2 class="page-title">操作日志</h2>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">日志总数</div>
        <div class="stat-value primary">{{ logStore.logs.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日操作</div>
        <div class="stat-value success">{{ getTodayOperationCount() }}</div>
      </div>
    </div>

    <div class="filter-section">
      <el-form :inline="true" :model="filter">
        <el-form-item label="操作人">
          <el-select v-model="filter.operatorName" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in operatorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filter.actionType" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in actionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标类型">
          <el-select v-model="filter.targetType" placeholder="请选择" clearable style="width: 150px">
            <el-option
              v-for="item in targetTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filter.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            style="width: 280px"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button :icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div v-if="hasActiveFilter" class="filter-result-info">
        <span>筛选结果：共 <strong>{{ filterResultCount }}</strong> 条记录</span>
        <el-button text type="primary" @click="resetFilter">清除筛选</el-button>
      </div>
    </div>

    <div class="table-section">
      <el-table :data="filteredLogs" stripe style="width: 100%">
        <el-table-column prop="createdAt" label="操作时间" width="180" />
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="actionTypeTagType(row.actionType)">
              {{ ActionTypeLabels[row.actionType] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标类型" width="100">
          <template #default="{ row }">
            {{ formatTargetType(row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="目标名称" width="180" />
        <el-table-column prop="description" label="操作描述" min-width="200" />
      </el-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logs-page {
  .filter-result-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f0f9eb;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    strong {
      color: #67c23a;
    }
  }
}
</style>
