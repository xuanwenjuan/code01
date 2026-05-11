<template>
  <div class="bills-page">
    <div class="page-header flex-between">
      <h2 class="page-title">账单管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加账单</el-button>
    </div>
    
    <div class="summary-cards">
      <div class="summary-card income">
        <div class="summary-label">本月收入</div>
        <div class="summary-value">¥{{ formatMoney(monthlySummary.totalIncome) }}</div>
        <div class="summary-diff">{{ incomeCount }} 笔</div>
      </div>
      <div class="summary-card expense">
        <div class="summary-label">本月支出</div>
        <div class="summary-value">¥{{ formatMoney(monthlySummary.totalExpense) }}</div>
        <div class="summary-diff">{{ expenseCount }} 笔</div>
      </div>
      <div class="summary-card" :class="monthlySummary.balance >= 0 ? 'positive' : 'negative'">
        <div class="summary-label">本月结余</div>
        <div class="summary-value">
          {{ monthlySummary.balance >= 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(monthlySummary.balance)) }}
        </div>
        <div class="summary-diff">
          {{ monthlySummary.balance >= 0 ? '资金富余' : '入不敷出' }}
        </div>
      </div>
    </div>
    
    <BillFilter @change="handleFilterChange" />
    
    <div class="card-container">
      <div class="table-header flex-between mb-15">
        <div class="table-info">
          共 <span class="highlight">{{ filteredBills.length }}</span> 条记录
          <span v-if="filterSummary.total !== filterSummary.filtered" class="summary-text">
            (筛选后 {{ filterSummary.filtered }} 条)
          </span>
        </div>
        <div class="table-actions">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table">表格视图</el-radio-button>
            <el-radio-button value="list">列表视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      
      <el-table
        v-if="viewMode === 'table'"
        :data="paginatedBills"
        style="width: 100%"
        stripe
        @sort-change="handleSortChange"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'income' ? 'success' : 'danger'" size="small">
              {{ row.type === 'income' ? '收入' : '支出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="categoryId" label="分类" width="140">
          <template #default="{ row }">
            <el-icon :size="16" :color="getCategoryColor(row.categoryId)" class="mr-2">
              <component :is="getCategory(row.categoryId)?.icon" />
            </el-icon>
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="150" align="right" sortable="custom">
          <template #default="{ row }">
            <span 
              :class="row.type === 'income' ? 'text-success' : 'text-danger'"
              :style="{ fontWeight: 'bold' }"
            >
              {{ row.type === 'income' ? '+' : '-' }}¥{{ formatMoney(row.amount) }}
            </span>
            <el-tag 
              v-if="row.type === 'expense' && row.amount >= LARGE_AMOUNT_THRESHOLD" 
              type="warning" 
              size="small" 
              class="ml-2"
            >
              大额
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountId" label="账户" width="120">
          <template #default="{ row }">
            <el-icon :size="16" :color="getAccountColor(row.accountId)" class="mr-2">
              <component :is="getAccount(row.accountId)?.icon" />
            </el-icon>
            {{ getAccountName(row.accountId) }}
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120" sortable="custom" />
        <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.note || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" link :icon="Document" @click="handleViewDetail(row)">详情</el-button>
            <el-popconfirm title="确认删除该账单吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button size="small" type="danger" link :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <div v-else class="list-view">
        <div
          v-for="bill in paginatedBills"
          :key="bill.id"
          class="bill-item"
          :class="bill.type"
          @click="handleViewDetail(bill)"
        >
          <div class="bill-left">
            <div 
              class="bill-icon"
              :style="{ backgroundColor: getCategoryColor(bill.categoryId) + '20' }"
            >
              <el-icon :size="24" :color="getCategoryColor(bill.categoryId)">
                <component :is="getCategory(bill.categoryId)?.icon" />
              </el-icon>
            </div>
            <div class="bill-info">
              <div class="bill-title">
                {{ getCategoryName(bill.categoryId) }}
                <el-tag 
                  v-if="bill.type === 'expense' && bill.amount >= LARGE_AMOUNT_THRESHOLD" 
                  type="warning" 
                  size="small"
                >
                  大额
                </el-tag>
              </div>
              <div class="bill-sub">
                <el-icon :size="12" :color="getAccountColor(bill.accountId)">
                  <component :is="getAccount(bill.accountId)?.icon" />
                </el-icon>
                {{ getAccountName(bill.accountId) }}
                <span class="bill-date">{{ bill.date }}</span>
              </div>
              <div v-if="bill.note" class="bill-note">{{ bill.note }}</div>
            </div>
          </div>
          <div class="bill-right">
            <div 
              class="bill-amount">
              <span :class="bill.type === 'income' ? 'text-success' : 'text-danger'">
                {{ bill.type === 'income' ? '+' : '-' }}¥{{ formatMoney(bill.amount) }}
              </span>
            </div>
            <div class="bill-actions">
              <el-button size="small" type="primary" link :icon="Edit" @click.stop="handleEdit(bill)">编辑</el-button>
              <el-button size="small" type="danger" link :icon="Delete" @click.stop="handleDeleteConfirm(bill)">删除</el-button>
            </div>
          </div>
        </div>
        
        <el-empty v-if="paginatedBills.length === 0" description="暂无账单记录" />
      </div>
      
      <div class="pagination-wrapper flex-center mt-20">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredBills.length"
          layout="total, sizes, prev, pager, next"
          small
        />
      </div>
    </div>
    
    <BillDialog ref="billDialogRef" @success="handleBillSuccess" />
    
    <el-dialog
      v-model="detailDialogVisible"
      title="账单详情"
      width="450px"
      destroy-on-close
    >
      <el-descriptions :column="1" border v-if="currentBill">
        <el-descriptions-item label="类型">
          <el-tag :type="currentBill.type === 'income' ? 'success' : 'danger'">
            {{ currentBill.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          <div class="detail-item">
            <el-icon :color="getCategoryColor(currentBill.categoryId)">
              <component :is="getCategory(currentBill.categoryId)?.icon" />
            </el-icon>
            <span>{{ getCategoryName(currentBill.categoryId) }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="金额">
          <span 
            :class="currentBill.type === 'income' ? 'text-success' : 'text-danger'">
            {{ currentBill.type === 'income' ? '+' : '-' }}¥{{ formatMoney(currentBill.amount) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="账户">
          <div class="detail-item">
            <el-icon :color="getAccountColor(currentBill.accountId)">
              <component :is="getAccount(currentBill.accountId)?.icon" />
            </el-icon>
            <span>{{ getAccountName(currentBill.accountId) }}</span>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="日期">
          {{ currentBill.date }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ currentBill.note || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(currentBill.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentBill.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromDetail">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import BillDialog from '@/components/BillDialog.vue'
import BillFilter from '@/components/BillFilter.vue'
import { useBillStore } from '@/stores/bill'
import { useBudgetStore } from '@/stores/budget'
import { useLogStore } from '@/stores/log'
import { LARGE_AMOUNT_THRESHOLD } from '@/constants'
import { 
  formatMoney, getCategory, getCategoryName, getCategoryColor, getAccount, getAccountName, getAccountColor, formatDateTime
} from '@/utils'
import type { Bill, BillFilter as BillFilterType } from '@/types'

const billStore = useBillStore()
const budgetStore = useBudgetStore()
const logStore = useLogStore()

const viewMode = ref<'table' | 'list'>('table')
const currentPage = ref(1)
const pageSize = ref(10)
const billDialogRef = ref<InstanceType<typeof BillDialog>>()
const detailDialogVisible = ref(false)
const currentBill = ref<Bill | null>(null)

const filter = reactive<BillFilterType>({})
const sortField = ref<{ prop: string; order: string } | null>(null)

const incomeCount = computed(() =>
  billStore.currentMonthBills.filter((b) => b.type === 'income').length
)
const expenseCount = computed(() =>
  billStore.currentMonthBills.filter((b) => b.type === 'expense').length
)

const monthlySummary = computed(() => ({
  totalIncome: billStore.currentMonthIncome,
  totalExpense: billStore.currentMonthExpense,
  balance: billStore.currentMonthBalance,
}))

const filteredBills = computed(() => {
  let result = billStore.getBillsByFilter(filter)
  
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      if (sortField.value!.prop === 'amount') {
        return sortField.value!.order === 'ascending' 
          ? a.amount - b.amount 
          : b.amount - a.amount
      } else if (sortField.value!.prop === 'date') {
        return sortField.value!.order === 'ascending'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }
      return 0
    })
  }
  
  return result
})

const filterSummary = computed(() => ({
  total: billStore.bills.length,
  filtered: filteredBills.value.length,
}))

const paginatedBills = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBills.value.slice(start, end)
})

function handleFilterChange(newFilter: BillFilterType): void {
  Object.assign(filter, newFilter)
  currentPage.value = 1
}

function handleSortChange({ prop, order }: { prop: string; order: string }): void {
  sortField.value = { prop, order }
}

function handleAdd(): void {
  billDialogRef.value?.open()
}

function handleEdit(bill: Bill): void {
  billDialogRef.value?.open(bill)
}

function handleViewDetail(bill: Bill): void {
  currentBill.value = bill
  detailDialogVisible.value = true
}

function handleEditFromDetail(): void {
  if (currentBill.value) {
    detailDialogVisible.value = false
    billDialogRef.value?.open(currentBill.value)
  }
}

async function handleDeleteConfirm(bill: Bill): void {
  try {
    await ElMessageBox.confirm('确认删除该账单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    handleDelete(bill)
  } catch {
  }
}

function handleDelete(bill: Bill): void {
  const success = billStore.deleteBill(bill.id)
  if (success) {
    ElMessage.success('账单删除成功')
    
    const categoryName = getCategoryName(bill.categoryId)
    const accountName = getAccountName(bill.accountId)
    
    logStore.addLog(
      'delete_bill',
      `删除了一笔${bill.type === 'expense' ? '支出' : '收入'}`,
      `分类: ${categoryName}, 金额: ¥${bill.amount}, 账户: ${accountName}`
    )
    
    if (bill.type === 'expense') {
      budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, false)
      budgetStore.updateSpentByCategory('total', bill.amount, false)
    }
  }
}

function handleBillSuccess(bill: Bill, isEdit: boolean, oldBill?: Bill): void {
  const categoryName = getCategoryName(bill.categoryId)
  const accountName = getAccountName(bill.accountId)
  
  if (isEdit && oldBill) {
    const oldCategoryName = getCategoryName(oldBill.categoryId)
    const oldAmount = oldBill.amount
    
    logStore.addLog(
      'edit_bill',
      `编辑了一笔${bill.type === 'expense' ? '支出' : 'income'}`,
      `原分类: ${oldCategoryName} ¥${oldAmount} → 新分类: ${categoryName} ¥${bill.amount}, 账户: ${accountName}`
    )
    
    if (oldBill.type === 'expense' && bill.type === 'expense') {
      const amountDiff = bill.amount - oldBill.amount
      if (amountDiff !== 0) {
        if (oldBill.categoryId === bill.categoryId) {
          budgetStore.updateSpentByCategory(bill.categoryId, Math.abs(amountDiff), amountDiff > 0)
        } else {
          budgetStore.updateSpentByCategory(oldBill.categoryId, oldBill.amount, false)
          budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, true)
        }
        budgetStore.updateSpentByCategory('total', Math.abs(amountDiff), amountDiff > 0)
      } else if (oldBill.categoryId !== bill.categoryId) {
        budgetStore.updateSpentByCategory(oldBill.categoryId, oldBill.amount, false)
        budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, true)
      } else {
        budgetStore.updateBudgetStatusByCategory(bill.categoryId)
        budgetStore.updateBudgetStatusByCategory('total')
      }
    } else if (oldBill.type === 'income' && bill.type === 'expense') {
      budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, true)
      budgetStore.updateSpentByCategory('total', bill.amount, true)
    } else if (oldBill.type === 'expense' && bill.type === 'income') {
      budgetStore.updateSpentByCategory(oldBill.categoryId, oldBill.amount, false)
      budgetStore.updateSpentByCategory('total', oldBill.amount, false)
    }
    
    if (bill.note && bill.note !== oldBill.note) {
      logStore.addLog(
        'add_note',
        `添加了账单备注`,
        `账单: ${categoryName} ¥${bill.amount}, 备注: ${bill.note}`
      )
    }
  } else {
    logStore.addLog(
      'add_bill',
      `添加了一笔${bill.type === 'expense' ? '支出' : 'income'}`,
      `分类: ${categoryName}, 金额: ¥${bill.amount}, 账户: ${accountName}`
    )
    
    if (bill.type === 'expense') {
      budgetStore.updateSpentByCategory(bill.categoryId, bill.amount, true)
      budgetStore.updateSpentByCategory('total', bill.amount, true)
    }
    
    if (bill.note) {
      logStore.addLog(
        'add_note',
        `添加了账单备注`,
        `账单: ${categoryName} ¥${bill.amount}, 备注: ${bill.note}`
      )
    }
  }
}
</script>

<style scoped lang="scss">
.bills-page {
  .page-header {
    margin-bottom: 16px;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      color: #303133;
    }
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    
    @media screen and (max-width: $breakpoint-desktop) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media screen and (max-width: $breakpoint-tablet) {
      grid-template-columns: 1fr;
    }
    
    .summary-card {
      background: #fff;
      border-radius: 8px;
      padding: 16px 20px;
      border-left: 4px solid #409eff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      
      &.income {
        border-left-color: #67c23a;
      }
      
      &.expense {
        border-left-color: #f56c6c;
      }
      
      &.positive {
        border-left-color: #67c23a;
        
        .summary-value {
          color: #67c23a;
        }
      }
      
      &.negative {
        border-left-color: #f56c6c;
        
        .summary-value {
          color: #f56c6c;
        }
      }
      
      .summary-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .summary-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }
      
      .summary-diff {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .table-header {
    .highlight {
      color: #409eff;
      font-weight: 600;
    }
    
    .summary-text {
      color: #909399;
      margin-left: 4px;
    }
    
    .table-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .list-view {
    min-height: 400px;
    
    .bill-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #ebeef5;
      cursor: pointer;
      transition: background 0.2s;
      
      &:hover {
        background: #f5f7fa;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .bill-left {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      
      .bill-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .bill-info {
        .bill-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }
        
        .bill-sub {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #909399;
          
          .bill-date {
            margin-left: 8px;
          }
        }
        
        .bill-note {
          margin-top: 4px;
          font-size: 12px;
          color: #909399;
        }
      }
      
      .bill-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        
        .bill-amount {
          font-size: 18px;
          font-weight: 600;
        }
        
        .bill-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
  
  .pagination-wrapper {
    padding-top: 16px;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

@media screen and (max-width: $breakpoint-tablet) {
  .bills-page {
    .list-view {
      .bill-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        
        .bill-right {
          width: 100%;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }
    }
  }
}
</style>
