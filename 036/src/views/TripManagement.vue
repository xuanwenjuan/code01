<template>
  <div class="trip-management">
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" style="color: #409eff">{{ tripStore.totalTrips }}</div>
            <div class="stat-label">总行程数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" style="color: #1890ff">{{ tripStore.preparingTrips }}</div>
            <div class="stat-label">筹备中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" style="color: #52c41a">{{ tripStore.ongoingTrips }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value" style="color: #8c8c8c">{{ tripStore.completedTrips }}</div>
            <div class="stat-label">已结束</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="filter-section">
      <el-form :model="filterParams" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="filterParams.keyword"
            placeholder="搜索行程名称/目的地"
            clearable
            style="width: 200px"
            @input="handleFilter"
          />
        </el-form-item>
        <el-form-item label="行程类型">
          <el-select
            v-model="filterParams.type"
            placeholder="全部类型"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option
              v-for="item in tripStore.getTripTypes()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="行程状态">
          <el-select
            v-model="filterParams.status"
            placeholder="全部状态"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option
              v-for="item in tripStore.getTripStatuses()"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="预算区间">
          <el-input-number
            v-model="filterParams.budgetMin"
            :min="0"
            placeholder="最小"
            style="width: 120px"
            @change="handleFilter"
          />
          <span style="margin: 0 8px">-</span>
          <el-input-number
            v-model="filterParams.budgetMax"
            :min="0"
            placeholder="最大"
            style="width: 120px"
            @change="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleResetFilter">重置筛选</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="page-header">
      <div class="header-left">
        <span class="page-title">行程列表</span>
        <el-tag v-if="hasActiveFilters" type="warning" effect="dark" class="filter-tag">
          已筛选：{{ filteredTrips.length }} / {{ tripStore.totalTrips }} 条
        </el-tag>
      </div>
      <el-button type="primary" class="btn-primary" @click="handleCreateTrip">
        <el-icon><Plus /></el-icon>
        新建行程
      </el-button>
    </div>

    <el-card class="table-container">
      <el-table :data="filteredTrips" v-loading="tripStore.loading" stripe border>
        <el-table-column prop="name" label="行程名称" min-width="150">
          <template #default="{ row }">
            <div class="trip-name">
              <el-icon><Location /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ TripTypeLabels[row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="destination" label="目的地" width="120" />
        <el-table-column label="行程日期" min-width="200">
          <template #default="{ row }">
            <div class="date-range">
              <span>{{ row.startDate }}</span>
              <el-icon><ArrowRight /></el-icon>
              <span>{{ row.endDate }}</span>
              <el-tag type="info" size="small">{{ row.days }}天</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预算情况" width="180">
          <template #default="{ row }">
            <div class="budget-info">
              <el-progress
                :percentage="getBudgetProgress(row.spent, row.budget)"
                :status="isOverBudget(row.spent, row.budget) ? 'exception' : undefined"
                :format="() => `${formatCurrency(row.spent)}/${formatCurrency(row.budget)}`"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" type="trip" />
          </template>
        </el-table-column>
        <el-table-column label="倒计时/进度" min-width="160">
          <template #default="{ row }">
            <div :class="['countdown-badge', getCountdownClass(row)]">
              <el-icon class="countdown-icon">
                <Clock v-if="getCountdownByTrip(row).isFuture" />
                <Timer v-else-if="getCountdownByTrip(row).isOngoing" />
                <Check v-else />
              </el-icon>
              <span class="countdown-text">{{ getCountdownByTrip(row).displayText }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditTrip(row)">编辑</el-button>
            <el-popconfirm title="确定要删除这个行程吗？" @confirm="handleDeleteTrip(row.id)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="filteredTrips.length === 0" description="暂无行程数据" />
    </el-card>

    <TripDialog v-model="tripDialogVisible" :trip="currentEditTrip" @submit="handleTripSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Trip, FilterParams, TripType, TripStatus, CountdownInfo } from '@/types'
import { TripTypeLabels } from '@/types'
import { useTripStore } from '@/stores/tripStore'
import { useLogStore } from '@/stores/logStore'
import StatusTag from '@/components/StatusTag.vue'
import TripDialog from '@/components/TripDialog.vue'
import {
  isOverBudget,
  getBudgetProgress,
  formatCurrency,
  getCountdownByTrip,
  calculateCountdown
} from '@/utils'

const countdownTimer = ref<ReturnType<typeof setInterval> | null>(null)
const countdownTrigger = ref(0)

const tripStore = useTripStore()
const logStore = useLogStore()

const tripDialogVisible = ref(false)
const currentEditTrip = ref<Trip | null>(null)

interface LocalFilterParams {
  keyword: string
  type: TripType | ''
  status: TripStatus | ''
  budgetMin: number | undefined
  budgetMax: number | undefined
}

const filterParams = reactive<LocalFilterParams>({
  keyword: '',
  type: '',
  status: '',
  budgetMin: undefined,
  budgetMax: undefined
})

const hasActiveFilters = computed<boolean>(() => {
  return (
    filterParams.keyword !== '' ||
    filterParams.type !== '' ||
    filterParams.status !== '' ||
    filterParams.budgetMin !== undefined ||
    filterParams.budgetMax !== undefined
  )
})

const filteredTrips = computed<Trip[]>(() => {
  const params: FilterParams = {
    keyword: filterParams.keyword || undefined,
    type: filterParams.type || undefined,
    status: filterParams.status || undefined,
    budgetMin: filterParams.budgetMin,
    budgetMax: filterParams.budgetMax
  }
  return tripStore.filterTrips(params)
})

const handleCreateTrip = (): void => {
  currentEditTrip.value = null
  tripDialogVisible.value = true
}

const handleEditTrip = (trip: Trip): void => {
  currentEditTrip.value = trip
  tripDialogVisible.value = true
}

const handleDeleteTrip = async (id: string): Promise<void> => {
  await tripStore.deleteTrip(id)
  ElMessage.success('行程已删除')
}

const handleTripSubmit = async (data: Partial<Trip>): Promise<void> => {
  if (currentEditTrip.value) {
    await tripStore.updateTrip(currentEditTrip.value.id, data)
    ElMessage.success('行程已更新')
  } else {
    const tripData = data as Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'days' | 'spent'>
    await tripStore.createTrip(tripData)
    ElMessage.success('行程已创建')
  }
}

const handleFilter = (): void => {
}

const handleResetFilter = (): void => {
  filterParams.keyword = ''
  filterParams.type = ''
  filterParams.status = ''
  filterParams.budgetMin = undefined
  filterParams.budgetMax = undefined
  ElMessage.info('筛选条件已重置')
}

const getCountdownClass = (trip: Trip): string => {
  const countdown = getCountdownByTrip(trip)
  if (countdown.isFuture) return 'future'
  if (countdown.isOngoing) return 'ongoing'
  return 'completed'
}

const startCountdownTimer = (): void => {
  countdownTimer.value = setInterval(() => {
    countdownTrigger.value++
  }, 60000)
}

const stopCountdownTimer = (): void => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

onMounted(async () => {
  if (tripStore.trips.length === 0) {
    await tripStore.fetchTrips()
  }
  if (logStore.logs.length === 0) {
    await logStore.fetchLogs()
  }
  startCountdownTimer()
})

onUnmounted(() => {
  stopCountdownTimer()
})
</script>

<style lang="scss" scoped>
.trip-management {
  .stats-row {
    margin-bottom: 24px;
  }

  .countdown-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    .countdown-icon {
      font-size: 14px;
    }

    &.future {
      background-color: #e6f7ff;
      color: #1890ff;

      .countdown-icon {
        animation: pulse 2s infinite;
      }
    }

    &.ongoing {
      background-color: #f6ffed;
      color: #52c41a;

      .countdown-icon {
        animation: rotate 2s linear infinite;
      }
    }

    &.completed {
      background-color: #f5f5f5;
      color: #8c8c8c;
    }

    .countdown-text {
      white-space: nowrap;
    }
  }
  .trip-name {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333;
    font-weight: 500;
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;

    .el-icon {
      color: #999;
    }
  }

  .budget-info {
    width: 160px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-tag {
    margin-left: 8px;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
