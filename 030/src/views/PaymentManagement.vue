<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useCommunityStore } from '@/stores'
import AdvancedFilter from '@/components/AdvancedFilter.vue'
import PaymentDialog from '@/components/PaymentDialog.vue'
import type { AdvancedFilter as FilterType, Payment } from '@/types'

const store = useCommunityStore()

const filter = ref<FilterType>({})
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'view' | 'pay'>('create')
const currentPayment = ref<Payment | null>(null)

const filteredPayments = computed(() => {
  return store.filterPayments(filter.value)
})

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  filter.value = {}
  ElMessage.info('已重置筛选条件')
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  currentPayment.value = null
  dialogVisible.value = true
}

const openViewDialog = (payment: Payment) => {
  dialogMode.value = 'view'
  currentPayment.value = payment
  dialogVisible.value = true
}

const openPayDialog = (payment: Payment) => {
  dialogMode.value = 'pay'
  currentPayment.value = payment
  dialogVisible.value = true
}

const getStatusTag = (status: Payment['status']) => {
  const map: Record<string, { type: string; text: string }> = {
    unpaid: { type: 'danger', text: '未缴费' },
    partial: { type: 'warning', text: '部分缴费' },
    paid: { type: 'success', text: '已缴费' }
  }
  return map[status]
}

const getTypeTag = (type: Payment['type']) => {
  const map: Record<string, { type: string; text: string }> = {
    property: { type: 'primary', text: '物业费' },
    water: { type: 'success', text: '水费' },
    electricity: { type: 'warning', text: '电费' },
    gas: { type: 'info', text: '燃气费' },
    parking: { type: '', text: '停车费' }
  }
  return map[type]
}
</script>

<template>
  <div class="payment-management">
    <AdvancedFilter
      v-model="filter"
      :show-keyword="true"
      :show-building="true"
      :show-payment-status="true"
      :show-date-range="true"
      @search="handleSearch"
      @reset="handleReset"
    />
    
    <el-card>
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <span>缴费列表</span>
            <div class="stat-chips">
              <el-tag type="danger" effect="light" class="stat-chip">
                未缴费: {{ store.payments.filter(p => p.status === 'unpaid').length }}
              </el-tag>
              <el-tag type="warning" effect="light" class="stat-chip">
                部分缴费: {{ store.payments.filter(p => p.status === 'partial').length }}
              </el-tag>
              <el-tag type="success" effect="light" class="stat-chip">
                已缴费: {{ store.payments.filter(p => p.status === 'paid').length }}
              </el-tag>
            </div>
          </div>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            创建费用
          </el-button>
        </div>
      </template>
      
      <el-table :data="filteredPayments" stripe>
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column label="费用编号" min-width="140">
          <template #default="{ row }">
            {{ row.id }}
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type).type" size="small">
              {{ getTypeTag(row.type).text }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="buildingName" label="楼栋" width="100" />
        <el-table-column prop="houseNo" label="房号" width="80" />
        <el-table-column prop="residentName" label="住户" width="80" />
        
        <el-table-column label="金额" width="100">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="已缴" width="100">
          <template #default="{ row }">
            <span class="paid-amount">¥{{ row.paidAmount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="待缴" width="100">
          <template #default="{ row }">
            <span :class="{ 'unpaid-amount': row.amount - row.paidAmount > 0 }">
              ¥{{ (row.amount - row.paidAmount).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type" size="small">
              {{ getStatusTag(row.status).text }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="dueDate" label="截止日期" width="110" />
        <el-table-column prop="paidDate" label="缴费日期" width="110">
          <template #default="{ row }">
            {{ row.paidDate || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openViewDialog(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status !== 'paid'"
              type="success" 
              link 
              size="small" 
              @click="openPayDialog(row)"
            >
              缴费
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next, total"
        :total="filteredPayments.length"
        :page-size="10"
      />
    </el-card>
    
    <PaymentDialog
      v-model="dialogVisible"
      :payment="currentPayment"
      :mode="dialogMode"
      @success="() => ElMessage.success('操作成功')"
    />
  </div>
</template>

<style scoped>
.payment-management {
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-chips {
  display: flex;
  gap: 8px;
}

.stat-chip {
  margin: 0 !important;
}

.amount {
  font-weight: bold;
  color: #303133;
}

.paid-amount {
  color: #67c23a;
}

.unpaid-amount {
  color: #f56c6c;
  font-weight: bold;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
