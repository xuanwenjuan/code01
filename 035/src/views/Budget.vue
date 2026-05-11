<template>
  <div class="budget-page">
    <div class="page-header flex-between">
      <h2 class="page-title">预算管理</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          size="default"
          @change="handleMonthChange"
        />
        <el-button type="primary" :icon="Plus" @click="handleAddBudget">新增预算</el-button>
      </div>
    </div>
    
    <div class="total-budget-card" v-if="budgetStore.totalBudget">
      <div class="total-budget-info">
        <div class="total-budget-header">
          <span class="total-budget-title">{{ budgetStore.totalBudget.name }}</span>
          <el-tag :type="getStatusTagType(budgetStore.totalBudget.status)" effect="dark">
            {{ BUDGET_STATUS_LABELS[budgetStore.totalBudget.status] }}
          </el-tag>
        </div>
        <div class="total-budget-amounts">
          <div class="amount-item">
            <span class="amount-label">已用</span>
            <span class="amount-value text-danger">
              ¥{{ formatMoney(budgetStore.totalBudget.spent) }}
            </span>
          </div>
          <div class="amount-divider"></div>
          <div class="amount-item">
            <span class="amount-label">总预算</span>
            <span class="amount-value">¥{{ formatMoney(budgetStore.totalBudget.amount) }}</span>
          </div>
          <div class="amount-divider"></div>
          <div class="amount-item">
            <span class="amount-label">剩余</span>
            <span 
              class="amount-value"
              :class="remainingTotal >= 0 ? 'text-success' : 'text-danger'"
            >
              ¥{{ formatMoney(Math.abs(remainingTotal)) }}
            </span>
          </div>
        </div>
        <div class="total-budget-progress">
          <el-progress
            :percentage="totalPercentage"
            :status="getProgressStatus(budgetStore.totalBudget.status)"
            :stroke-width="16"
            :show-text="true"
            :format="formatProgress"
          />
        </div>
      </div>
      <div class="total-budget-chart">
        <RingProgress
          :percentage="totalPercentage"
          :status-color="BUDGET_STATUS_COLORS[budgetStore.totalBudget.status]"
          :inner-text="budgetStore.totalBudget.status"
        />
      </div>
    </div>
    
    <div class="card-container">
      <div class="list-header flex-between mb-15">
        <span class="list-title">分类预算</span>
        <div class="summary-tags">
          <el-tag v-if="budgetStore.overBudgetCount > 0" type="danger" effect="dark">
            {{ budgetStore.overBudgetCount }} 项超支
          </el-tag>
          <el-tag v-if="budgetStore.warningBudgetCount > 0" type="warning" effect="dark">
            {{ budgetStore.warningBudgetCount }} 项预警
          </el-tag>
        </div>
      </div>
      
      <div class="budget-list">
        <div
          v-for="budget in budgetStore.categoryBudgets"
          :key="budget.id"
          class="budget-item"
          :class="{ warning: budget.status === 'warning', over: budget.status === 'over' }"
        >
          <div class="budget-header">
            <div class="budget-category">
              <div 
                class="category-icon"
                :style="{ backgroundColor: getBudgetCategoryColor(budget.categoryId) + '20' }"
              >
                <el-icon :size="20" :color="getBudgetCategoryColor(budget.categoryId)">
                  <component :is="getBudgetCategoryIcon(budget.categoryId)" />
                </el-icon>
              </div>
              <div class="category-info">
                <div class="category-name">{{ budget.name }}</div>
                <el-tag :type="getStatusTagType(budget.status)" size="small">
                  {{ BUDGET_STATUS_LABELS[budget.status] }}
                </el-tag>
              </div>
            </div>
            <div class="budget-actions">
              <el-dropdown trigger="click" @command="(cmd: string) => handleAction(cmd, budget)">
                <el-button size="small" :icon="MoreFilled" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="adjust">
                      <el-icon><EditPen /></el-icon>
                      调整额度
                    </el-dropdown-item>
                    <el-dropdown-item command="reset">
                      <el-icon><RefreshLeft /></el-icon>
                      重置
                    </el-dropdown-item>
                    <el-dropdown-item divided command="delete">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="budget-progress">
            <div class="progress-info">
              <span class="spent">已用 ¥{{ formatMoney(budget.spent) }}</span>
              <span class="remaining">
                剩余 ¥{{ formatMoney(Math.max(0, budget.amount - budget.spent)) }}
              </span>
            </div>
            <el-progress
              :percentage="budgetStore.calcPercentage(budget.spent, budget.amount)"
              :status="getProgressStatus(budget.status)"
              :stroke-width="8"
              :show-text="false"
            />
          </div>
          
          <div class="budget-amounts">
            <span class="amount-text">
              预算 ¥{{ formatMoney(budget.amount) }}
            </span>
            <span class="percentage-text">
              {{ budgetStore.calcPercentage(budget.spent, budget.amount).toFixed(1) }}%
            </span>
          </div>
        </div>
        
        <el-empty v-if="budgetStore.categoryBudgets.length === 0" description="暂无分类预算" />
      </div>
    </div>
    
    <el-dialog
      v-model="budgetDialogVisible"
      :title="editingBudget ? '编辑预算' : '新增预算'"
      width="400px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="budgetForm" :rules="rules" label-width="80px">
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="budgetForm.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in expenseCategories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预算额度" prop="amount">
          <el-input-number
            v-model="budgetForm.amount"
            :min="0"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="budgetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleBudgetSubmit">确认</el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="adjustDialogVisible"
      title="调整预算额度"
      width="400px"
      destroy-on-close
    >
      <el-form ref="adjustFormRef" :model="adjustForm" :rules="adjustRules" label-width="80px">
        <el-form-item label="当前预算">
          <el-input disabled :value="`¥${formatMoney(adjustingBudget?.amount || 0)}`" />
        </el-form-item>
        <el-form-item label="调整额度" prop="adjustAmount">
          <el-input-number
            v-model="adjustForm.adjustAmount"
            :precision="2"
            style="width: 100%"
          >
            <template #prefix>¥</template>
          </el-input-number>
          <div class="form-tip text-light">
            提示：正数增加预算，负数减少预算
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adjustLoading" @click="handleAdjustSubmit">确认调整</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Budget, CategoryType, BudgetStatus } from '@/types'
import { useBudgetStore } from '@/stores/budget'
import { useLogStore } from '@/stores/log'
import { CATEGORIES, BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '@/constants'
import { formatMoney, getCurrentMonth } from '@/utils'
import RingProgress from '@/components/RingProgress.vue'

const budgetStore = useBudgetStore()
const logStore = useLogStore()

const selectedMonth = ref(getCurrentMonth())
const loading = ref(false)
const adjustLoading = ref(false)
const formRef = ref<FormInstance>()
const adjustFormRef = ref<FormInstance>()

const expenseCategories = computed(() => CATEGORIES.filter(c => c.type === 'expense'))

const budgetDialogVisible = ref(false)
const editingBudget = ref<Budget | null>(null)
const budgetForm = reactive({
  categoryId: 'food' as CategoryType,
  amount: 0,
})

const adjustDialogVisible = ref(false)
const adjustingBudget = ref<Budget | null>(null)
const adjustForm = reactive({
  adjustAmount: 0,
})

const remainingTotal = computed(() => {
  if (!budgetStore.totalBudget) return 0
  return budgetStore.totalBudget.amount - budgetStore.totalBudget.spent
})

const totalPercentage = computed(() => {
  if (!budgetStore.totalBudget) return 0
  return budgetStore.calcPercentage(budgetStore.totalBudget.spent, budgetStore.totalBudget.amount)
})

const rules: FormRules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  amount: [
    { required: true, type: 'number', message: '请输入预算额度', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '预算额度必须大于0', trigger: 'blur' },
  ],
}

const adjustRules: FormRules = {
  adjustAmount: [
    { required: true, type: 'number', message: '请输入调整额度', trigger: 'blur' },
  ],
}

function getBudgetCategoryColor(categoryId: CategoryType | 'total'): string {
  if (categoryId === 'total') return '#667eea'
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category?.color || '#909399'
}

function getBudgetCategoryIcon(categoryId: CategoryType | 'total'): string {
  if (categoryId === 'total') return 'Wallet'
  const category = CATEGORIES.find(c => c.id === categoryId)
  return category?.icon || 'MoreFilled'
}

function handleMonthChange(month: string): void {
  budgetStore.currentMonth = month
}

function getStatusTagType(status: BudgetStatus): 'success' | 'warning' | 'danger' {
  const map: Record<BudgetStatus, 'success' | 'warning' | 'danger'> = {
    normal: 'success',
    warning: 'warning',
    over: 'danger',
  }
  return map[status]
}

function getProgressStatus(status: BudgetStatus): '' | 'success' | 'warning' | 'exception' {
  const map: Record<BudgetStatus, '' | 'success' | 'warning' | 'exception'> = {
    normal: '',
    warning: 'warning',
    over: 'exception',
  }
  return map[status]
}

function formatProgress(percentage: number): string {
  if (percentage === 100) return '已满'
  if (percentage >= 80) return `${percentage}% 即将超支`
  return `${percentage}%`
}

function handleAddBudget(): void {
  editingBudget.value = null
  budgetForm.categoryId = expenseCategories.value[0]?.id || 'food'
  budgetForm.amount = 0
  budgetDialogVisible.value = true
}

function handleEdit(budget: Budget): void {
  editingBudget.value = budget
  if (budget.categoryId !== 'total') {
    budgetForm.categoryId = budget.categoryId
  }
  budgetForm.amount = budget.amount
  budgetDialogVisible.value = true
}

function handleAdjust(budget: Budget): void {
  adjustingBudget.value = budget
  adjustForm.adjustAmount = 0
  adjustDialogVisible.value = true
}

async function handleAdjustSubmit(): Promise<void> {
  if (!adjustingBudget.value) return
  
  const valid = await adjustFormRef.value?.validate().catch(() => false)
  if (!valid) return
  
  adjustLoading.value = true
  
  try {
    const originalAmount = adjustingBudget.value.amount
    const newAmount = originalAmount + adjustForm.adjustAmount
    
    if (newAmount < 0) {
      ElMessage.warning('预算额度不能小于0')
      return
    }
    
    const updatedBudget = budgetStore.adjustBudget(adjustingBudget.value.id, adjustForm.adjustAmount)
    if (updatedBudget) {
      ElMessage.success('预算调整成功')
      
      logStore.addLog(
        'adjust_budget',
        `调整了「${adjustingBudget.value.name}」预算额度`,
        `原预算: ¥${originalAmount}, 调整: ${adjustForm.adjustAmount >= 0 ? '+' : ''}¥${adjustForm.adjustAmount}, 新预算: ¥${updatedBudget.amount}`
      )
      
      adjustDialogVisible.value = false
    }
  } finally {
    adjustLoading.value = false
  }
}

async function handleReset(budget: Budget): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要重置该预算的已用金额吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    budgetStore.resetBudget(budget.id)
    ElMessage.success('预算已重置')
    
    logStore.addLog(
      'adjust_budget',
      `重置了「${budget.name}」预算`,
      `已用金额重置为0，原已用: ¥${budget.spent}`
    )
  } catch {
  }
}

async function handleDelete(budget: Budget): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该预算吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    budgetStore.deleteBudget(budget.id)
    ElMessage.success('预算已删除')
    
    logStore.addLog(
      'update_budget',
      `删除了预算「${budget.name}」`,
      `原预算额度: ¥${budget.amount}`
    )
  } catch {
  }
}

function handleAction(command: string, budget: Budget): void {
  switch (command) {
    case 'edit':
      handleEdit(budget)
      break
    case 'adjust':
      handleAdjust(budget)
      break
    case 'reset':
      handleReset(budget)
      break
    case 'delete':
      handleDelete(budget)
      break
  }
}

async function handleBudgetSubmit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  
  if (budgetForm.amount <= 0) {
    ElMessage.warning('请输入有效的预算额度')
    return
  }
  
  loading.value = true
  
  try {
    if (editingBudget.value) {
      const originalName = editingBudget.value.name
      const originalAmount = editingBudget.value.amount
      
      budgetStore.updateBudget(editingBudget.value.id, {
        categoryId: budgetForm.categoryId,
        amount: budgetForm.amount,
      })
      
      ElMessage.success('预算更新成功')
      
      const newCategoryName = CATEGORIES.find(c => c.id === budgetForm.categoryId)?.name || ''
      logStore.addLog(
        'update_budget',
        `修改了预算「${originalName}」`,
        `分类: ${newCategoryName}, 原金额: ¥${originalAmount}, 新金额: ¥${budgetForm.amount}`
      )
    } else {
      const categoryName = CATEGORIES.find(c => c.id === budgetForm.categoryId)?.name || '未命名'
      
      budgetStore.addBudget({
        categoryId: budgetForm.categoryId,
        name: categoryName,
        amount: budgetForm.amount,
      })
      
      ElMessage.success('预算添加成功')
      
      logStore.addLog(
        'add_budget',
        `新增了预算「${categoryName}」`,
        `预算额度: ¥${budgetForm.amount}`
      )
    }
    
    budgetDialogVisible.value = false
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.budget-page {
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .page-title {
      margin: 0;
      font-size: 20px;
      color: #303133;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .total-budget-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    color: #fff;
    
    @media screen and (max-width: $breakpoint-tablet) {
      flex-direction: column;
      gap: 20px;
    }
    
    .total-budget-info {
      flex: 1;
      
      .total-budget-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        
        .total-budget-title {
          font-size: 18px;
          font-weight: 600;
        }
      }
      
      .total-budget-amounts {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        
        .amount-item {
          .amount-label {
            display: block;
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 4px;
          }
          
          .amount-value {
            font-size: 20px;
            font-weight: 600;
            
            &.text-danger {
              color: #ff6b6b;
            }
            
            &.text-success {
              color: #51cf66;
            }
          }
        }
        
        .amount-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          margin: 0 24px;
        }
      }
      
      .total-budget-progress {
        :deep(.el-progress__text) {
          color: #fff !important;
        }
      }
    }
    
    .total-budget-chart {
      flex-shrink: 0;
    }
  }
  
  .list-header {
    .list-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .summary-tags {
      display: flex;
      gap: 8px;
    }
  }
  
  .budget-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    
    @media screen and (max-width: $breakpoint-desktop) {
      grid-template-columns: 1fr;
    }
    
    .budget-item {
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      }
      
      &.warning {
        border-color: #faad14;
        background: #fffbe6;
      }
      
      &.over {
        border-color: #ff4d4f;
        background: #fff2f0;
      }
      
      .budget-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .budget-category {
          display: flex;
          align-items: center;
          gap: 12px;
          
          .category-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .category-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .category-name {
              font-size: 15px;
              font-weight: 500;
              color: #303133;
            }
          }
        }
      }
      
      .budget-progress {
        margin-bottom: 8px;
        
        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          color: #606266;
          
          .remaining {
            color: #909399;
          }
        }
      }
      
      .budget-amounts {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #909399;
        
        .percentage-text {
          font-weight: 500;
        }
      }
    }
  }
  
  .form-tip {
    margin-top: 8px;
    font-size: 12px;
  }
}
</style>
