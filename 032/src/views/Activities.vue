<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Activity, ActivityStatus, ActivityFilter, SelectOption } from '@/types'
import { ActivityStatus as AS, activityStatusLabels, OperationType } from '@/types'
import { useActivityStore } from '@/stores/activity'
import { useOperationLogStore } from '@/stores/operationLog'
import { useClubStore } from '@/stores/club'
import { useRegistrationStore } from '@/stores/registration'
import ActivityDialog from '@/components/ActivityDialog.vue'
import RegistrationDialog from '@/components/RegistrationDialog.vue'
import ScanCheckIn from '@/components/ScanCheckIn.vue'
import CountdownTimer from '@/components/CountdownTimer.vue'
import FilterForm, { type FilterField } from '@/components/FilterForm.vue'
import { getParticipationStatus, isActivityFull, isActivityAlmostFull } from '@/utils/countdown'
import { useRouter } from 'vue-router'

const router = useRouter()
const activityStore = useActivityStore()
const operationLogStore = useOperationLogStore()
const clubStore = useClubStore()
const registrationStore = useRegistrationStore()

const dialogVisible = ref(false)
const registrationDialogVisible = ref(false)
const scanDialogVisible = ref(false)
const editingActivity = ref<Activity | null>(null)
const selectedActivity = ref<Activity | null>(null)

const filterForm = ref<Record<string, unknown>>({
  clubId: '',
  status: undefined,
  keyword: '',
  startDate: '',
  endDate: '',
  hasRegistration: undefined
})

const currentPage = ref(1)
const pageSize = ref(10)

const clubOptions = computed<SelectOption[]>(() =>
  clubStore.clubOptions.map((opt) => ({
    label: opt.label,
    value: opt.value
  }))
)

const statusOptions: SelectOption<ActivityStatus>[] = Object.entries(activityStatusLabels).map(
  ([value, label]) => ({
    value: value as ActivityStatus,
    label
  })
)

const filterFields: FilterField[] = [
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '搜索活动标题/地点/描述',
    width: '250px'
  },
  {
    key: 'clubId',
    label: '所属社团',
    type: 'select',
    placeholder: '全部社团',
    options: clubOptions.value,
    width: '180px'
  },
  {
    key: 'status',
    label: '活动状态',
    type: 'select',
    placeholder: '全部状态',
    options: statusOptions,
    width: '150px'
  },
  {
    key: 'startDate',
    label: '开始日期',
    type: 'date',
    placeholder: '开始日期',
    width: '140px'
  },
  {
    key: 'endDate',
    label: '结束日期',
    type: 'date',
    placeholder: '结束日期',
    width: '140px'
  }
]

const filteredActivities = computed(() => {
  const filter = filterForm.value as ActivityFilter
  return activityStore.filterActivities({
    clubId: filter.clubId || undefined,
    status: filter.status,
    keyword: filter.keyword || undefined,
    startDate: filter.startDate || undefined,
    endDate: filter.endDate || undefined,
    hasRegistration: filter.hasRegistration
  })
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredActivities.value.slice(start, end)
})

const statistics = computed(() => {
  const total = activityStore.activityList.length
  const preparing = activityStore.getActivitiesByStatus(AS.PREPARING).length
  const signingUp = activityStore.getActivitiesByStatus(AS.SIGNING_UP).length
  const ended = activityStore.getActivitiesByStatus(AS.ENDED).length
  const cancelled = activityStore.getActivitiesByStatus(AS.CANCELLED).length
  return { total, preparing, signingUp, ended, cancelled }
})

function handleCreate(): void {
  editingActivity.value = null
  dialogVisible.value = true
}

function handleEdit(activity: Activity): void {
  editingActivity.value = { ...activity }
  dialogVisible.value = true
}

function handleDelete(activity: Activity): void {
  ElMessageBox.confirm(`确定要删除活动"${activity.title}"吗？此操作不可恢复`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      activityStore.updateActivity(activity.id, { status: AS.CANCELLED })
      operationLogStore.recordOperation(
        OperationType.CANCEL_ACTIVITY,
        activity.id,
        activity.title,
        `取消了活动：${activity.title}`
      )
      ElMessage.success('活动已取消')
    })
    .catch(() => {})
}

function handleViewRegistrations(activity: Activity): void {
  selectedActivity.value = activity
  registrationDialogVisible.value = true
}

function handleScanCheckIn(activity: Activity): void {
  selectedActivity.value = activity
  scanDialogVisible.value = true
}

function handleSubmit(activity: Activity): void {
  if (editingActivity.value) {
    activityStore.updateActivity(activity.id, activity)
    operationLogStore.recordOperation(
      OperationType.UPDATE_ACTIVITY,
      activity.id,
      activity.title,
      `更新了活动信息：${activity.title}`
    )
  } else {
    activityStore.addActivity(activity)
    operationLogStore.recordOperation(
      OperationType.CREATE_ACTIVITY,
      activity.id,
      activity.title,
      `创建了活动：${activity.title}`
    )
  }
}

function handleSearch(): void {
  currentPage.value = 1
}

function handleReset(): void {
  filterForm.value = {
    clubId: '',
    status: undefined,
    keyword: '',
    startDate: '',
    endDate: '',
    hasRegistration: undefined
  }
  currentPage.value = 1
}

function handleGoToRegistrations(): void {
  router.push('/registrations')
}

function getStatusClass(status: ActivityStatus): string {
  const classMap: Record<ActivityStatus, string> = {
    [AS.PREPARING]: 'status-preparing',
    [AS.SIGNING_UP]: 'status-signing-up',
    [AS.ENDED]: 'status-ended',
    [AS.CANCELLED]: 'status-ended'
  }
  return classMap[status] || 'status-ended'
}

function getStatusType(status: ActivityStatus): 'warning' | 'success' | 'info' | 'danger' {
  const typeMap: Record<ActivityStatus, 'warning' | 'success' | 'info' | 'danger'> = {
    [AS.PREPARING]: 'warning',
    [AS.SIGNING_UP]: 'success',
    [AS.ENDED]: 'info',
    [AS.CANCELLED]: 'danger'
  }
  return typeMap[status]
}

function getParticipationRate(activity: Activity): number {
  if (activity.maxParticipants === 0) return 0
  return Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
}

function getParticipationStatusType(activity: Activity): string {
  const status = getParticipationStatus(activity.currentParticipants, activity.maxParticipants)
  const typeMap: Record<string, string> = {
    empty: '',
    normal: '',
    warning: 'exception',
    full: 'exception'
  }
  return typeMap[status] || ''
}

function showFullWarning(activity: Activity): boolean {
  return isActivityAlmostFull(activity.currentParticipants, activity.maxParticipants)
}

function isActivityCanCheckIn(activity: Activity): boolean {
  return activity.status === AS.SIGNING_UP || activity.status === AS.PREPARING
}

function isActivityFullyBooked(activity: Activity): boolean {
  return isActivityFull(activity.currentParticipants, activity.maxParticipants)
}

function handleCountdownExpired(activity: Activity): void {
  if (activity.status === AS.PREPARING) {
    activityStore.updateActivity(activity.id, { status: AS.SIGNING_UP })
    operationLogStore.recordOperation(
      OperationType.UPDATE_ACTIVITY,
      activity.id,
      activity.title,
      `活动"${activity.title}"状态自动变更为：报名中`
    )
  }
}

function handleEndCountdownExpired(activity: Activity): void {
  if (activity.status === AS.SIGNING_UP || activity.status === AS.PREPARING) {
    activityStore.updateActivity(activity.id, { status: AS.ENDED })
    operationLogStore.recordOperation(
      OperationType.UPDATE_ACTIVITY,
      activity.id,
      activity.title,
      `活动"${activity.title}"已自动结束`
    )
  }
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">活动管理</h1>
      <div class="flex gap-2">
        <el-button @click="handleGoToRegistrations">
          <el-icon><User /></el-icon>
          报名管理
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建活动
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="4">
        <div class="stat-card">
          <div class="stat-value text-blue-500">{{ statistics.total }}</div>
          <div class="stat-label">活动总数</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-orange-500">{{ statistics.preparing }}</div>
          <div class="stat-label">筹备中</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-green-500">{{ statistics.signingUp }}</div>
          <div class="stat-label">报名中</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-gray-500">{{ statistics.ended }}</div>
          <div class="stat-label">已结束</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-red-500">{{ statistics.cancelled }}</div>
          <div class="stat-label">已取消</div>
        </div>
      </el-col>
    </el-row>

    <div class="filter-section">
      <FilterForm
        :fields="filterFields"
        v-model="filterForm"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div class="table-container">
      <el-table :data="paginatedActivities" stripe border v-loading="false">
        <el-table-column prop="title" label="活动标题" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <el-icon :size="18" color="#409eff">
                  <Calendar />
                </el-icon>
                <span class="font-medium">{{ row.title }}</span>
                <el-tag
                  v-if="isActivityFullyBooked(row)"
                  type="danger"
                  size="small"
                  effect="dark"
                >
                  已满员
                </el-tag>
                <el-tag
                  v-else-if="showFullWarning(row)"
                  type="warning"
                  size="small"
                >
                  名额紧张
                </el-tag>
              </div>
              <CountdownTimer
                v-if="row.status !== 'ended' && row.status !== 'cancelled'"
                :target-time="row.startTime"
                prefix="距离开始"
                size="small"
                @expired="handleCountdownExpired(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="clubName" label="所属社团" width="140" />
        <el-table-column prop="status" label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light">
              {{ activityStatusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="活动地点" width="150" />
        <el-table-column label="活动时间" width="230">
          <template #default="{ row }">
            <div class="text-sm">
              <div class="flex items-center gap-1">
                <el-icon :size="14"><Clock /></el-icon>
                <span>{{ row.startTime }}</span>
              </div>
              <div class="flex items-center gap-1 mt-1">
                <el-icon :size="14"><Clock /></el-icon>
                <span>{{ row.endTime }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="报名情况" width="160">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <el-progress
                  :percentage="getParticipationRate(row)"
                  :status="getParticipationStatusType(row) || undefined"
                  :stroke-width="12"
                />
              </div>
              <div class="text-xs text-gray-500">
                {{ row.currentParticipants }}/{{ row.maxParticipants }} 人
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isActivityCanCheckIn(row)"
              type="success"
              link
              @click="handleScanCheckIn(row)"
            >
              扫码签到
            </el-button>
            <el-button type="primary" link @click="handleViewRegistrations(row)">
              查看报名
            </el-button>
            <el-button
              v-if="row.status !== 'ended' && row.status !== 'cancelled'"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="row.status !== 'cancelled'"
              type="danger"
              link
              @click="handleDelete(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredActivities.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

    <ActivityDialog
      v-model:visible="dialogVisible"
      :activity="editingActivity"
      @submit="handleSubmit"
    />

    <RegistrationDialog
      v-model:visible="registrationDialogVisible"
      :activity="selectedActivity"
    />

    <ScanCheckIn
      v-model:visible="scanDialogVisible"
      :activity="selectedActivity"
    />
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.items-center {
  align-items: center;
}
.flex-col {
  flex-direction: column;
}
.font-medium {
  font-weight: 500;
}
.text-sm {
  font-size: 14px;
}
.text-xs {
  font-size: 12px;
}
.text-gray-500 {
  color: #909399;
}
.text-blue-500 {
  color: #409eff;
}
.text-green-500 {
  color: #67c23a;
}
.text-orange-500 {
  color: #e6a23c;
}
.text-red-500 {
  color: #f56c6c;
}
.mb-4 {
  margin-bottom: 20px;
}
.mt-1 {
  margin-top: 4px;
}
</style>
