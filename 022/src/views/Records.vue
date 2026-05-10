<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">操作履历管理</span>
        </div>
      </template>
      
      <div class="filter-section">
        <el-form :inline="true" :model="filterParams">
          <el-form-item label="操作类型">
            <el-select
              v-model="filterParams.operationType"
              placeholder="请选择操作类型"
              clearable
              style="width: 150px"
            >
              <el-option label="入库" value="inbound" />
              <el-option label="出库" value="outbound" />
              <el-option label="残次下架" value="damaged" />
            </el-select>
          </el-form-item>
          <el-form-item label="货品名称">
            <el-select
              v-model="filterParams.productId"
              placeholder="选择货品"
              clearable
              filterable
              style="width: 200px"
            >
              <el-option
                v-for="product in products"
                :key="product.id"
                :label="product.name"
                :value="product.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="操作员">
            <el-input
              v-model="filterParams.operator"
              placeholder="搜索操作员"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="filterParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 280px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="currentPage = 1">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-row :gutter="20" class="stats-row" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-card class="record-stat-card" shadow="hover">
            <div class="record-stat-value" style="color: #409eff">{{ stats.inbound }}</div>
            <div class="record-stat-label">入库次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="record-stat-card" shadow="hover">
            <div class="record-stat-value" style="color: #67c23a">{{ stats.outbound }}</div>
            <div class="record-stat-label">出库次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="record-stat-card" shadow="hover">
            <div class="record-stat-value" style="color: #f56c6c">{{ stats.damaged }}</div>
            <div class="record-stat-label">下架次数</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="record-stat-card" shadow="hover">
            <div class="record-stat-value" style="color: #909399">{{ total }}</div>
            <div class="record-stat-label">总操作记录</div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="操作时间" width="180" prop="createdAt" sortable>
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOperationType(row.operationType)">
              {{ getOperationLabel(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" width="120" prop="operator" />
        <el-table-column label="货品名称" min-width="180" prop="productName" />
        <el-table-column label="分类归属" min-width="180">
          <template #default="{ row }">
            {{ getFullCategoryPath(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column label="操作数量" width="100" align="center" prop="quantity" sortable>
          <template #default="{ row }">
            <span :class="row.operationType === 'inbound' ? 'text-success' : 'text-danger'">
              {{ row.operationType === 'inbound' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存变更" width="180" align="center">
          <template #default="{ row }">
            <span>{{ row.previousStock }}</span>
            <el-icon :color="row.newStock > row.previousStock ? '#67c23a' : '#f56c6c'" style="margin: 0 8px">
              <ArrowRight />
            </el-icon>
            <span>{{ row.newStock }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完好度变更" width="150" align="center">
          <template #default="{ row }">
            <span v-if="row.previousCondition !== row.newCondition">
              <el-tag :type="getConditionType(row.previousCondition || '')" size="small">
                {{ getConditionLabel(row.previousCondition || '') }}
              </el-tag>
              <span style="margin: 0 4px">→</span>
              <el-tag :type="getConditionType(row.newCondition || '')" size="small">
                {{ getConditionLabel(row.newCondition || '') }}
              </el-tag>
            </span>
            <span v-else>
              <el-tag :type="getConditionType(row.previousCondition || '')" size="small">
                {{ getConditionLabel(row.previousCondition || '') }}
              </el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="150" prop="remark" show-overflow-tooltip />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { OperationRecord, OperationType, Product } from '@/types'
import { CONDITION_LABELS, OPERATION_TYPE_LABELS } from '@/types'
import { getOperationRecords, getFullCategoryPath, getProducts } from '@/utils/storage'

interface FilterParams {
  operationType?: OperationType
  productId?: string
  operator?: string
  dateRange?: [string, string]
}

const records = ref<OperationRecord[]>([])
const products = ref<Product[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const filterParams = ref<FilterParams>({})

const filteredData = computed(() => {
  let result = [...records.value]
  
  if (filterParams.value.operationType) {
    result = result.filter(r => r.operationType === filterParams.value.operationType)
  }
  
  if (filterParams.value.productId) {
    result = result.filter(r => r.productId === filterParams.value.productId)
  }
  
  if (filterParams.value.operator) {
    const keyword = filterParams.value.operator.toLowerCase()
    result = result.filter(r => r.operator.toLowerCase().includes(keyword))
  }
  
  if (filterParams.value.dateRange && filterParams.value.dateRange.length === 2) {
    const [start, end] = filterParams.value.dateRange
    const startDate = new Date(start + ' 00:00:00')
    const endDate = new Date(end + ' 23:59:59')
    result = result.filter(r => {
      const date = new Date(r.createdAt)
      return date >= startDate && date <= endDate
    })
  }
  
  return result
})

const total = computed(() => filteredData.value.length)

const stats = computed(() => ({
  inbound: filteredData.value.filter(r => r.operationType === 'inbound').length,
  outbound: filteredData.value.filter(r => r.operationType === 'outbound').length,
  damaged: filteredData.value.filter(r => r.operationType === 'damaged').length
}))

const tableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function getOperationLabel(type: string): string {
  return OPERATION_TYPE_LABELS[type] || type
}

function getOperationType(type: string): string {
  const types: Record<string, string> = {
    inbound: 'success',
    outbound: 'primary',
    damaged: 'danger'
  }
  return types[type] || 'info'
}

function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] || condition
}

function getConditionType(condition: string): string {
  const types: Record<string, string> = {
    excellent: 'success',
    good: 'success',
    fair: 'warning',
    poor: 'danger'
  }
  return types[condition] || 'info'
}

function handleReset() {
  filterParams.value = {}
  currentPage.value = 1
}

function refreshData() {
  records.value = getOperationRecords()
  products.value = getProducts()
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.record-stat-card {
  padding: 16px;
  border-radius: 8px;
}

.record-stat-card .record-stat-value {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 8px;
}

.record-stat-card .record-stat-label {
  font-size: 14px;
  color: #909399;
  text-align: center;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>
