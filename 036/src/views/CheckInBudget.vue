<template>
  <div class="checkin-budget">
    <el-card shadow="hover" class="trip-selector">
      <el-form :model="selector" inline>
        <el-form-item label="选择行程">
          <el-select
            v-model="selector.tripId"
            placeholder="请选择要管理的行程"
            style="width: 300px"
            @change="handleTripChange"
          >
            <el-option
              v-for="trip in tripStore.trips"
              :key="trip.id"
              :label="`${trip.name} (${trip.destination})`"
              :value="trip.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-empty v-if="!selectedTrip" description="请先选择一个行程" />

    <template v-else>
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="6" :md="3">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" style="color: #409eff">{{ selectedTrip.attractions.length }}</div>
              <div class="stat-label">景点总数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="6" :md="3">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" style="color: #52c41a">{{ checkedAttractionsCount }}</div>
              <div class="stat-label">已打卡</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="6" :md="3">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" style="color: #e6a23c">{{ pendingAttractionsCount }}</div>
              <div class="stat-label">待打卡</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="6" :md="3">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" style="color: #f56c6c">{{ missedAttractionsCount }}</div>
              <div class="stat-label">已错过</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :md="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" :class="{ 'over-budget': isSelectedTripOverBudget }">
                {{ formatCurrency(selectedTrip.spent) }}
              </div>
              <div class="stat-label">已花费</div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :md="6">
          <el-card shadow="hover">
            <div class="stat-card">
              <div class="stat-value" style="color: #909399">{{ completionRate }}%</div>
              <div class="stat-label">打卡完成率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="budget-progress">
        <el-card shadow="hover">
          <div class="progress-header">
            <span class="progress-title">预算消耗进度</span>
            <span
              :class="['progress-text', { 'budget-warning': isOverBudget(selectedTrip.spent, selectedTrip.budget) }]"
            >
              {{ formatCurrency(selectedTrip.spent) }} / {{ formatCurrency(selectedTrip.budget) }}
              <span v-if="isOverBudget(selectedTrip.spent, selectedTrip.budget)" class="warning-text">
                ⚠️ 已超支
              </span>
            </span>
          </div>
          <el-progress
            :percentage="getBudgetProgress(selectedTrip.spent, selectedTrip.budget)"
            :status="isOverBudget(selectedTrip.spent, selectedTrip.budget) ? 'exception' : undefined"
            :stroke-width="12"
          />
        </el-card>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="景点打卡" name="attractions">
          <div class="page-header">
            <span class="page-title">景点列表</span>
            <el-button type="primary" class="btn-primary" @click="handleAddAttraction">
              <el-icon><Plus /></el-icon>
              添加景点
            </el-button>
          </div>

          <el-card class="table-container">
            <el-table :data="selectedTrip.attractions" stripe border>
              <el-table-column prop="name" label="景点名称" width="150" />
              <el-table-column prop="location" label="位置" width="120" />
              <el-table-column prop="plannedDate" label="计划日期" width="120" />
              <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <StatusTag :status="row.status" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <el-button
                    :type="getButtonType(row.status)"
                    :disabled="row.status === 'checked'"
                    size="small"
                    @click="handleOpenCheckIn(row)"
                  >
                    <el-icon><Camera /></el-icon>
                    {{ getButtonText(row.status) }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-if="selectedTrip.attractions.length === 0" description="暂无景点数据" />
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="花费记录" name="expenses">
          <div class="page-header">
            <span class="page-title">花费列表</span>
            <el-button type="primary" class="btn-primary" @click="handleAddExpense">
              <el-icon><Plus /></el-icon>
              添加花费
            </el-button>
          </div>

          <el-card class="table-container">
            <el-table :data="selectedTrip.expenses" stripe border>
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="category" label="类别" width="100">
                <template #default="{ row }">
                  <el-tag>{{ row.category }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="120">
                <template #default="{ row }">
                  <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
            </el-table>

            <el-empty v-if="selectedTrip.expenses.length === 0" description="暂无花费记录" />
          </el-card>
        </el-tab-pane>
      </el-tabs>

      <AttractionDialog v-model="attractionDialogVisible" @submit="handleAttractionSubmit" />
      <ExpenseDialog v-model="expenseDialogVisible" @submit="handleExpenseSubmit" />
      <TravelCheckInDialog
        v-model="checkInDialogVisible"
        :attraction="currentAttraction"
        @confirm="handleCheckInConfirm"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Trip, Attraction, DailyExpense, CheckInStatus } from '@/types'
import { useTripStore } from '@/stores/tripStore'
import StatusTag from '@/components/StatusTag.vue'
import AttractionDialog from '@/components/AttractionDialog.vue'
import ExpenseDialog from '@/components/ExpenseDialog.vue'
import TravelCheckInDialog from '@/components/TravelCheckInDialog.vue'
import { isOverBudget, getBudgetProgress, formatCurrency, formatDate } from '@/utils'

const tripStore = useTripStore()

const activeTab = ref<'attractions' | 'expenses'>('attractions')
const attractionDialogVisible = ref(false)
const expenseDialogVisible = ref(false)
const checkInDialogVisible = ref(false)
const currentAttraction = ref<Attraction | null>(null)

const selector = reactive<{ tripId: string }>({
  tripId: ''
})

const selectedTrip = computed<Trip | undefined>(() => {
  if (!selector.tripId) return undefined
  return tripStore.getTripById(selector.tripId)
})

const checkedAttractionsCount = computed<number>(() => {
  if (!selectedTrip.value) return 0
  return selectedTrip.value.attractions.filter((a: Attraction) => a.status === 'checked').length
})

const pendingAttractionsCount = computed<number>(() => {
  if (!selectedTrip.value) return 0
  return selectedTrip.value.attractions.filter((a: Attraction) => a.status === 'pending').length
})

const missedAttractionsCount = computed<number>(() => {
  if (!selectedTrip.value) return 0
  return selectedTrip.value.attractions.filter((a: Attraction) => a.status === 'missed').length
})

const completionRate = computed<number>(() => {
  if (!selectedTrip.value || selectedTrip.value.attractions.length === 0) return 0
  return Math.round((checkedAttractionsCount.value / selectedTrip.value.attractions.length) * 100)
})

const isSelectedTripOverBudget = computed<boolean>(() => {
  if (!selectedTrip.value) return false
  return isOverBudget(selectedTrip.value.spent, selectedTrip.value.budget)
})

watch(
  () => tripStore.trips,
  (): void => {
    if (selector.tripId && !tripStore.getTripById(selector.tripId)) {
      selector.tripId = ''
    }
  },
  { deep: true }
)

const handleTripChange = (tripId: string): void => {
  selector.tripId = tripId
}

const handleAddAttraction = (): void => {
  attractionDialogVisible.value = true
}

const handleAttractionSubmit = (data: Omit<Attraction, 'id' | 'status'>): void => {
  if (selectedTrip.value) {
    tripStore.addAttraction(selectedTrip.value.id, data)
    ElMessage.success('景点已添加')
  }
}

const handleOpenCheckIn = (attraction: Attraction): void => {
  currentAttraction.value = { ...attraction }
  checkInDialogVisible.value = true
}

const handleCheckInConfirm = async (data: {
  status: CheckInStatus
  note: string
  photos: string[]
}): Promise<void> => {
  if (!selectedTrip.value || !currentAttraction.value) return

  if (currentAttraction.value.status === 'checked') {
    await ElMessageBox.confirm('该景点已打卡，无法再次修改状态。', '提示', {
      confirmButtonText: '确定',
      showCancelButton: false,
      type: 'warning'
    })
    return
  }

  if (currentAttraction.value.status === 'missed' && data.status === 'pending') {
    await ElMessageBox.confirm('已错过的景点无法恢复为未打卡状态。', '提示', {
      confirmButtonText: '确定',
      showCancelButton: false,
      type: 'warning'
    })
    return
  }

  const result = tripStore.updateAttractionStatus(selectedTrip.value.id, currentAttraction.value.id, data.status)

  if (result.success) {
    ElMessage.success(result.message)
  } else {
    ElMessage.warning(result.message)
  }
}

const handleAddExpense = (): void => {
  expenseDialogVisible.value = true
}

const handleExpenseSubmit = (data: Omit<DailyExpense, 'id'>): void => {
  if (!selectedTrip.value) return

  const result = tripStore.addExpense(selectedTrip.value.id, data)

  if (result.success) {
    if (result.message.includes('超过预算')) {
      ElMessage.warning(result.message)
    } else {
      ElMessage.success(result.message)
    }
  } else {
    ElMessage.error(result.message)
  }
}

const getButtonType = (status: Attraction['status']): 'primary' | 'success' | 'info' => {
  switch (status) {
    case 'checked':
      return 'success'
    case 'missed':
      return 'info'
    default:
      return 'primary'
  }
}

const getButtonText = (status: Attraction['status']): string => {
  switch (status) {
    case 'checked':
      return '已打卡'
    case 'missed':
      return '已错过'
    default:
      return '去打卡'
  }
}
</script>

<style lang="scss" scoped>
.checkin-budget {
  .trip-selector {
    margin-bottom: 24px;
  }

  .stats-row {
    margin-bottom: 24px;
  }

  .over-budget {
    color: #ff4d4f;
  }

  .budget-progress {
    margin-bottom: 24px;

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .progress-title {
        font-weight: 600;
        color: #333;
      }

      .progress-text {
        color: #666;

        &.budget-warning {
          color: #ff4d4f;
          animation: pulse 2s infinite;
        }

        .warning-text {
          margin-left: 8px;
        }
      }
    }
  }

  .amount {
    color: #f56c6c;
    font-weight: 600;
  }
}
</style>
