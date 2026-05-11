<template>
  <div class="logs-page">
    <el-card>
      <template #header>
        <div class="flex-between">
          <span>操作日志</span>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-form :model="filters" inline class="mb-10">
        <el-form-item label="操作人">
          <el-input v-model="filters.operatorName" placeholder="请输入操作人姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 300px"
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

      <el-table :data="logStore.logs" v-loading="logStore.loading" style="width: 100%">
        <el-table-column prop="operatorName" label="操作人" width="100" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.operatorRole)" size="small">
              {{ getRoleText(row.operatorRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120" />
        <el-table-column prop="operationModule" label="操作模块" width="120" />
        <el-table-column prop="targetType" label="目标类型" width="100" />
        <el-table-column prop="targetName" label="目标名称" width="120" />
        <el-table-column prop="details" label="操作详情" min-width="250" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="operationTime" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.operationTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper mt-10">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="logStore.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { FilterOptions } from '@/types'
import { useLogStore } from '@/stores/log'

const logStore = useLogStore()

const currentPage = ref(1)
const pageSize = ref(10)
const dateRange = ref<[string, string] | null>(null)

const filters = reactive<FilterOptions>({
  operatorName: '',
})

function getRoleType(role: 'receptionist' | 'coach' | 'admin'): 'primary' | 'success' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'danger'> = {
    admin: 'danger',
    receptionist: 'primary',
    coach: 'success',
  }
  return map[role]
}

function getRoleText(role: 'receptionist' | 'coach' | 'admin'): string {
  const map: Record<string, string> = {
    admin: '管理员',
    receptionist: '前台',
    coach: '教练',
  }
  return map[role]
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

async function loadData() {
  const queryFilters = { ...filters }
  if (dateRange.value) {
    queryFilters.dateRange = dateRange.value
  }
  await logStore.fetchLogs(currentPage.value, pageSize.value, queryFilters)
}

function handleSearch() {
  currentPage.value = 1
  loadData()
}

function handleReset() {
  filters.operatorName = ''
  dateRange.value = null
  handleSearch()
}

function handleRefresh() {
  loadData()
}

function handleSizeChange(val: number) {
  pageSize.value = val
  loadData()
}

function handleCurrentChange(val: number) {
  currentPage.value = val
  loadData()
}

onMounted(() => {
  loadData()
})

watch([currentPage, pageSize], () => {
  loadData()
})
</script>

<style scoped>
.logs-page {
  min-height: 100%;
}

.mb-10 {
  margin-bottom: 10px;
}

.mt-10 {
  margin-top: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
