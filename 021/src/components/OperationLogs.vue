<template>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
      <h2>操作履历日志</h2>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-secondary" @click="exportLogs">导出日志</button>
        <button class="btn btn-danger" @click="clearLogs">清空日志</button>
      </div>
    </div>

    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin-bottom: 15px;">日志筛选</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">操作员</label>
          <input
            v-model="filters.operator"
            type="text"
            class="input"
            placeholder="操作员姓名"
            @input="onFilterChange"
          />
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">操作类型</label>
          <select v-model="filters.operationType" class="select" @change="onFilterChange">
            <option value="">全部</option>
            <option v-for="type in OPERATION_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">产品名称</label>
          <input
            v-model="filters.productName"
            type="text"
            class="input"
            placeholder="产品名称"
            @input="onFilterChange"
          />
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">开始日期</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="input"
            @change="onFilterChange"
          />
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">结束日期</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="input"
            @change="onFilterChange"
          />
        </div>
      </div>
      <div style="margin-top: 15px; display: flex; gap: 10px;">
        <button class="btn btn-secondary" @click="resetFilters">重置筛选</button>
        <span style="color: #909399; align-self: center;">
          显示 {{ filteredLogs.length }} / {{ logs.length }} 条记录
        </span>
      </div>
    </div>

    <div style="overflow-x: auto;">
      <table class="table">
        <thead>
          <tr>
            <th>操作时间</th>
            <th>操作员</th>
            <th>操作类型</th>
            <th>产品名称</th>
            <th>操作详情</th>
            <th>库存变化</th>
            <th>原库存</th>
            <th>新库存</th>
            <th>原状态</th>
            <th>新状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in paginatedLogs" :key="log.id">
            <td>{{ formatDate(log.timestamp) }}</td>
            <td>{{ log.operator }}</td>
            <td>
              <span :class="['badge', getOperationTypeBadgeClass(log.operationType)]">
                {{ log.operationType }}
              </span>
            </td>
            <td>{{ log.productName }}</td>
            <td>{{ log.details }}</td>
            <td>
              <span :style="{ color: log.stockChange > 0 ? '#67c23a' : log.stockChange < 0 ? '#f56c6c' : '#909399' }">
                {{ log.stockChange > 0 ? '+' : '' }}{{ log.stockChange }}
              </span>
            </td>
            <td>{{ log.previousStock }}</td>
            <td>{{ log.newStock }}</td>
            <td>{{ log.previousStatus || '-' }}</td>
            <td>
              <span v-if="log.newStatus" :class="['badge', getStatusBadgeClass(log.newStatus as ProductStatus)]">
                {{ log.newStatus }}
              </span>
              <span v-else>-</span>
            </td>
          </tr>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="10" style="text-align: center; padding: 40px; color: #909399;">
              暂无操作日志
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="color: #909399;">
        共 {{ filteredLogs.length }} 条记录，每页 {{ pageSize }} 条，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div style="display: flex; gap: 5px;">
        <button class="btn btn-secondary" @click="goToPage(1)" :disabled="currentPage === 1">首页</button>
        <button class="btn btn-secondary" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
        <button 
          v-for="page in visiblePages" 
          :key="page" 
          :class="['btn', page === currentPage ? 'btn-primary' : 'btn-secondary']"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button class="btn btn-secondary" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
        <button class="btn btn-secondary" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">末页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { getLogs, getStorageStats, onStorageChange, offStorageChange } from '@/utils/storage'
import { formatDate, getOperationTypeBadgeClass, getStatusBadgeClass } from '@/utils'
import { OPERATION_TYPES } from '@/types'
import type {
  OperationLog,
  ProductStatus,
  OperationType
} from '@/types'

const logs = ref<OperationLog[]>([])
const currentPage = ref(1)
const pageSize = 20

const filters = reactive<{
  operator: string
  operationType: OperationType | ''
  productName: string
  startDate: string
  endDate: string
}>({
  operator: '',
  operationType: '' as OperationType | '',
  productName: '',
  startDate: '',
  endDate: ''
})

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (filters.operator && !log.operator.toLowerCase().includes(filters.operator.toLowerCase())) {
      return false
    }
    
    if (filters.operationType && log.operationType !== filters.operationType) {
      return false
    }
    
    if (filters.productName && !log.productName.toLowerCase().includes(filters.productName.toLowerCase())) {
      return false
    }
    
    if (filters.startDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (logDate < filters.startDate) {
        return false
      }
    }
    
    if (filters.endDate) {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (logDate > filters.endDate) {
        return false
      }
    }
    
    return true
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredLogs.value.length / pageSize))
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredLogs.value.slice(start, end)
})

const loadLogs = () => {
  logs.value = getLogs().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

const onFilterChange = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.operator = ''
  filters.operationType = '' as OperationType | ''
  filters.productName = ''
  filters.startDate = ''
  filters.endDate = ''
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const exportLogs = () => {
  if (filteredLogs.value.length === 0) {
    alert('暂无日志可导出')
    return
  }
  
  const exportData = filteredLogs.value.map(log => ({
    操作时间: formatDate(log.timestamp),
    操作员: log.operator,
    操作类型: log.operationType,
    产品名称: log.productName,
    操作详情: log.details,
    库存变化: log.stockChange > 0 ? `+${log.stockChange}` : log.stockChange,
    原库存: log.previousStock,
    新库存: log.newStock,
    原状态: log.previousStatus || '-',
    新状态: log.newStatus || '-'
  }))
  
  const csvContent = [
    Object.keys(exportData[0]).join(','),
    ...exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `操作日志_${formatDate(new Date().toISOString()).replace(/[:\s]/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
  
  alert('日志导出成功！')
}

const clearLogs = () => {
  if (!confirm('⚠️ 确定要清空所有操作日志吗？此操作不可恢复！')) {
    return
  }
  
  const stats = getStorageStats()
  if (!confirm(`将删除 ${stats.logCount} 条日志记录，确定继续？`)) {
    return
  }
  
  sessionStorage.removeItem('storage:logs')
  loadLogs()
  alert('日志已清空！')
}

const handleStorageChange = () => {
  loadLogs()
}

onMounted(() => {
  loadLogs()
  onStorageChange('logs', handleStorageChange)
})

onUnmounted(() => {
  offStorageChange('logs', handleStorageChange)
})
</script>
