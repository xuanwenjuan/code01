<template>
  <div class="page-container">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">今日操作</div>
          <div class="stat-number">{{ logStats.today_count }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="stat-label">本周操作</div>
          <div class="stat-number">{{ logStats.week_count }}</div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card-wrapper" style="height: 100%; display: flex; align-items: center; padding: 0 24px;">
          <div v-for="stat in logStats.type_stats" :key="stat.type" class="type-stat">
            <el-tag :type="getLogTagType(stat.type)" size="large">{{ stat.type }}</el-tag>
            <span class="type-count">{{ stat.count }} 次</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card-wrapper">
      <div class="page-header">
        <span class="page-title">操作履历</span>
      </div>

      <div class="search-bar">
        <el-form :inline="true" :model="filters" label-width="80px">
          <el-form-item label="操作类型">
            <el-select v-model="filters.type" placeholder="请选择" clearable style="width: 150px">
              <el-option label="分类管理" value="分类管理" />
              <el-option label="商品管理" value="商品管理" />
              <el-option label="出入库管理" value="出入库管理" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作动作">
            <el-select v-model="filters.action" placeholder="请选择" clearable style="width: 120px">
              <el-option label="新增" value="新增" />
              <el-option label="修改" value="修改" />
              <el-option label="删除" value="删除" />
              <el-option label="入库" value="入库" />
              <el-option label="销售" value="销售" />
              <el-option label="下架" value="下架" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作目标">
            <el-input v-model="filters.target" placeholder="搜索目标名称" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="操作人">
            <el-input v-model="filters.operator" placeholder="搜索操作人" clearable style="width: 120px" />
          </el-form-item>
          <el-form-item label="日期范围">
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
            <el-button type="primary" @click="loadLogs">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="logs" border v-loading="loading">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="type" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLogTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作动作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionTagType(row.action)">{{ row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="操作目标" min-width="180" />
        <el-table-column prop="details" label="操作详情" min-width="250" show-overflow-tooltip />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="created_at" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadLogs"
          @current-change="loadLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { logApi } from '@/api'
import { formatDate, getLogTagType, getActionTagType, cleanParams } from '@/utils/helpers'
import type { OperationLog, LogFilters, LogStats, PaginationParams } from '@/types'

const loading = ref<boolean>(false)
const logs = ref<OperationLog[]>([])
const dateRange = ref<string[] | undefined>(undefined)

const logStats = reactive<LogStats>({
  today_count: 0,
  week_count: 0,
  type_stats: [],
  action_stats: []
})

const filters = reactive<LogFilters>({
  type: undefined,
  action: undefined,
  target: undefined,
  operator: undefined,
  start_date: undefined,
  end_date: undefined
})

const pagination = reactive<PaginationParams & { total: number }>({
  page: 1,
  page_size: 20,
  total: 0
})

async function loadStats(): Promise<void> {
  try {
    const response = await logApi.getStats()
    if (response.success && response.data) {
      Object.assign(logStats, response.data)
    }
  } catch (error) {
    console.error('加载日志统计失败:', error)
  }
}

async function loadLogs(): Promise<void> {
  loading.value = true
  try {
    const params = cleanParams({
      page: pagination.page,
      page_size: pagination.page_size,
      type: filters.type,
      action: filters.action,
      target: filters.target,
      operator: filters.operator,
      start_date: dateRange.value?.[0],
      end_date: dateRange.value?.[1]
    })
    
    const response = await logApi.getList(params as LogFilters & PaginationParams)
    if (response.success) {
      logs.value = response.data
      pagination.total = response.pagination?.total || 0
    }
  } catch (error) {
    console.error('加载日志列表失败:', error)
  } finally {
    loading.value = false
  }
}

function resetFilters(): void {
  Object.assign(filters, {
    type: undefined,
    action: undefined,
    target: undefined,
    operator: undefined
  })
  dateRange.value = undefined
  pagination.page = 1
  loadLogs()
}

onMounted((): void => {
  loadStats()
  loadLogs()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.type-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 30px;
}

.type-count {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
