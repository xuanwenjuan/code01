<template>
  <div class="page-container">
    <h2 style="margin-bottom: 24px;">操作日志</h2>
    
    <AdvancedFilter
      v-model="filterParams"
      :filters="logFilters"
      :show-active-filters="true"
      :auto-search="true"
      @search="handleFilter"
      @reset="handleReset"
    />
    
    <div class="table-container">
      <el-table :data="logStore.filteredLogs" style="width: 100%">
        <el-table-column prop="id" label="日志ID" width="120" />
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.operationType)" size="small">
              {{ row.operationType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100" />
        <el-table-column prop="targetName" label="目标名称" width="120" />
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column prop="ip" label="IP地址" width="130" />
      </el-table>
      
      <el-empty v-if="logStore.filteredLogs.length === 0" description="暂无操作日志" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useOperationLogStore } from '@/stores/operationLog'
import type { FilterParams, OperationType } from '@/types'
import AdvancedFilter, { type FilterConfig } from '@/components/AdvancedFilter.vue'

const logStore = useOperationLogStore()

const operationTypes: OperationType[] = [
  '新增', '编辑', '删除', '调整部门', '修改薪资', '审批通过', '审批驳回'
]

const logFilters = computed<FilterConfig[]>(() => [
  {
    key: 'operationType',
    label: '操作类型',
    type: 'select',
    placeholder: '请选择操作类型',
    width: '150px',
    options: operationTypes.map((type) => ({
      label: type,
      value: type
    }))
  },
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '操作人/描述',
    width: '250px'
  }
])

const filterParams = reactive<Record<string, unknown>>({})

function getTagType(type: OperationType): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const typeMap: Record<OperationType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    '新增': 'success',
    '编辑': 'primary',
    '删除': 'danger',
    '调整部门': 'warning',
    '修改薪资': 'warning',
    '审批通过': 'success',
    '审批驳回': 'danger'
  }
  return typeMap[type] || 'info'
}

function handleFilter(params: Record<string, unknown>): void {
  const typedParams: Partial<FilterParams> = {
    keyword: params.keyword as string | undefined
  }
  logStore.setFilterParams(typedParams)
}

function handleReset(): void {
  logStore.clearFilterParams()
}
</script>
