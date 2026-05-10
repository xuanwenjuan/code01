<template>
  <div class="page-container">
    <div class="page-header">
      <div class="page-title">操作日志</div>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">操作人：</span>
          <el-input
            v-model="localFilters.operator"
            placeholder="操作人姓名"
            clearable
            style="width: 150px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">操作类型：</span>
          <el-select
            v-model="localFilters.operationType"
            placeholder="选择类型"
            clearable
            style="width: 140px"
          >
            <el-option label="新增" value="add" />
            <el-option label="编辑" value="edit" />
            <el-option label="删除" value="delete" />
            <el-option label="入库" value="in_stock" />
            <el-option label="出库" value="out_stock" />
            <el-option label="售卖" value="sale" />
            <el-option label="下架" value="offline" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">操作时间：</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </div>
        <div class="filter-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </div>

    <div class="table-section">
      <BaseTable
        :data="logStore.logs"
        :columns="tableColumns"
        :loading="logStore.loading"
        :current-page="logStore.pagination.page"
        :page-size="logStore.pagination.pageSize"
        :total="logStore.total"
        @pagination-change="handlePaginationChange"
      >
        <template #column-operationType="{ row }">
          <StatusTag type="operation" :value="row.operationType" />
        </template>
      </BaseTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { OperationLog, TableColumn, PaginationParams, OperationType } from '@/types'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import { useLogStore } from '@/stores/log'

const logStore = useLogStore()

const tableColumns: TableColumn<OperationLog>[] = [
  { prop: 'operationTypeText', label: '操作类型', width: 100 },
  { prop: 'module', label: '所属模块', width: 100 },
  { prop: 'targetName', label: '操作对象', width: 150 },
  { prop: 'operator', label: '操作人', width: 100 },
  { prop: 'detail', label: '操作详情', width: 250 },
  { prop: 'ip', label: 'IP地址', width: 140 },
  { prop: 'createTime', label: '操作时间', width: 160 }
]

interface LocalFilters {
  operator: string
  operationType: string
}

const localFilters = reactive<LocalFilters>({
  operator: '',
  operationType: ''
})

const dateRange = ref<string[]>([])

function handleSearch(): void {
  logStore.setFilterParams({
    ...localFilters,
    startTime: dateRange.value[0] || '',
    endTime: dateRange.value[1] ? `${dateRange.value[1]} 23:59:59` : ''
  })
  logStore.fetchLogs()
}

function handleReset(): void {
  Object.assign(localFilters, {
    operator: '',
    operationType: ''
  })
  dateRange.value = []
  logStore.resetFilters()
  logStore.fetchLogs()
}

function handlePaginationChange(params: PaginationParams): void {
  logStore.setPagination(params)
  logStore.fetchLogs()
}

onMounted(() => {
  logStore.fetchLogs()
})
</script>
