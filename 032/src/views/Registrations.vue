<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Registration, RegistrationFilter, RegistrationStatus, Activity, SelectOption, CheckInMethod } from '@/types'
import { RegistrationStatus as RS, registrationStatusLabels, OperationType, ActivityStatus as AS, CheckInMethod as CIM, checkInMethodLabels } from '@/types'
import { useRegistrationStore } from '@/stores/registration'
import { useActivityStore } from '@/stores/activity'
import { useOperationLogStore } from '@/stores/operationLog'
import FilterForm, { type FilterField } from '@/components/FilterForm.vue'
import ScanCheckIn from '@/components/ScanCheckIn.vue'
import { generateId } from '@/utils'
import dayjs from 'dayjs'

const registrationStore = useRegistrationStore()
const activityStore = useActivityStore()
const operationLogStore = useOperationLogStore()

const scanDialogVisible = ref(false)
const selectedActivity = ref<Activity | null>(null)

const filterForm = ref<Record<string, unknown>>({
  activityId: '',
  status: undefined,
  keyword: '',
  studentId: '',
  checkInMethod: undefined
})

const currentPage = ref(1)
const pageSize = ref(10)

const activityOptions = computed<SelectOption[]>(() =>
  activityStore.activityList.map((a) => ({
    label: a.title,
    value: a.id,
    disabled: a.status === AS.CANCELLED
  }))
)

const statusOptions: SelectOption<RegistrationStatus>[] = Object.entries(registrationStatusLabels).map(
  ([value, label]) => ({
    value: value as RegistrationStatus,
    label
  })
)

const checkInMethodOptions: SelectOption<CheckInMethod>[] = Object.entries(checkInMethodLabels).map(
  ([value, label]) => ({
    value: value as CheckInMethod,
    label
  })
)

const filterFields: FilterField[] = [
  {
    key: 'activityId',
    label: '活动',
    type: 'select',
    placeholder: '全部活动',
    options: activityOptions.value,
    width: '220px'
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '全部状态',
    options: statusOptions,
    width: '150px'
  },
  {
    key: 'checkInMethod',
    label: '签到方式',
    type: 'select',
    placeholder: '全部方式',
    options: checkInMethodOptions,
    width: '150px'
  },
  {
    key: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '姓名/活动/班级',
    width: '200px'
  },
  {
    key: 'studentId',
    label: '学号',
    type: 'input',
    placeholder: '精确查找',
    width: '160px'
  }
]

const filteredRegistrations = computed(() => {
  const filter = filterForm.value as RegistrationFilter
  const results = registrationStore.filterRegistrations({
    activityId: filter.activityId || undefined,
    status: filter.status,
    keyword: filter.keyword || undefined,
    studentId: filter.studentId || undefined
  })

  if (filter.checkInMethod) {
    return results.filter((r) => r.checkInMethod === filter.checkInMethod)
  }
  return results
})

const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRegistrations.value.slice(start, end)
})

function getStatusType(status: RegistrationStatus): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const typeMap: Record<RegistrationStatus, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    [RS.REGISTERED]: 'primary',
    [RS.CHECKED_IN]: 'success',
    [RS.LEAVE]: 'warning',
    [RS.REJECTED]: 'info'
  }
  return typeMap[status]
}

function handleSearch(): void {
  currentPage.value = 1
}

function handleReset(): void {
  filterForm.value = {
    activityId: '',
    status: undefined,
    keyword: '',
    studentId: '',
    checkInMethod: undefined
  }
  currentPage.value = 1
}

function canActivityCheckIn(activityId: string): { canCheckIn: boolean; reason?: string } {
  const activity = activityStore.getActivityById(activityId)
  if (!activity) {
    return { canCheckIn: false, reason: '活动不存在' }
  }
  if (activity.status === AS.CANCELLED) {
    return { canCheckIn: false, reason: '活动已取消' }
  }
  if (activity.status === AS.ENDED) {
    return { canCheckIn: false, reason: '活动已结束' }
  }
  if (!activity.checkInEnabled) {
    return { canCheckIn: false, reason: '该活动未开启签到功能' }
  }
  const now = dayjs()
  if (activity.checkInStartTime && now.isBefore(dayjs(activity.checkInStartTime))) {
    return { canCheckIn: false, reason: `签到尚未开始，签到开始时间：${activity.checkInStartTime}` }
  }
  return { canCheckIn: true }
}

function handleCheckIn(registration: Registration): void {
  const checkInValidation = canActivityCheckIn(registration.activityId)
  if (!checkInValidation.canCheckIn) {
    ElMessage.warning(checkInValidation.reason || '无法签到')
    return
  }
  if (registration.status === RS.CHECKED_IN) {
    ElMessage.warning('该学生已签到')
    return
  }
  if (registration.status === RS.LEAVE) {
    ElMessage.warning('该学生已请假，无法签到')
    return
  }
  if (registration.status === RS.REJECTED) {
    ElMessage.warning('该报名已取消，无法签到')
    return
  }
  registrationStore.updateRegistration(registration.id, {
    status: RS.CHECKED_IN,
    checkInMethod: CIM.MANUAL,
    checkedInAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })
  operationLogStore.recordOperation(
    OperationType.CHECK_IN,
    registration.id,
    registration.studentName,
    `手动签到：学生"${registration.studentName}"在活动"${registration.activityTitle}"签到成功`
  )
  ElMessage.success('签到成功')
}

function handleBatchCheckIn(): void {
  const toCheckIn = filteredRegistrations.value.filter((r) => {
    if (r.status !== RS.REGISTERED) return false
    const validation = canActivityCheckIn(r.activityId)
    return validation.canCheckIn
  })
  if (toCheckIn.length === 0) {
    ElMessage.warning('当前筛选条件下没有可签到的学生')
    return
  }

  ElMessageBox.confirm(`确定批量签到当前筛选条件下的 ${toCheckIn.length} 名学生吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      toCheckIn.forEach((r) => {
        registrationStore.updateRegistration(r.id, {
          status: RS.CHECKED_IN,
          checkInMethod: CIM.MANUAL,
          checkedInAt: now
        })
      })
      operationLogStore.recordOperation(
        OperationType.BATCH_CHECK_IN,
        generateId(),
        '批量签到',
        `批量签到了 ${toCheckIn.length} 名学生（筛选条件：活动=${filterForm.value.activityId || '全部'}, 状态=${filterForm.value.status || '全部'}, 关键词=${filterForm.value.keyword || '无'}）`
      )
      ElMessage.success(`已批量签到 ${toCheckIn.length} 名学生`)
    })
    .catch(() => {})
}

function handleScanCheckIn(): void {
  const activeActivities = activityStore.activityList.filter(
    (a) => a.status === AS.SIGNING_UP || a.status === AS.PREPARING
  )
  if (activeActivities.length === 0) {
    ElMessage.warning('当前没有进行中的活动')
    return
  }
  selectedActivity.value = activeActivities[0]
  scanDialogVisible.value = true
}

function handleLeave(registration: Registration): void {
  ElMessageBox.confirm(`确定为"${registration.studentName}"标记请假吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      registrationStore.updateRegistration(registration.id, {
        status: RS.LEAVE
      })
      operationLogStore.recordOperation(
        OperationType.LEAVE,
        registration.id,
        registration.studentName,
        `学生"${registration.studentName}"在活动"${registration.activityTitle}"标记请假`
      )
      ElMessage.success('已标记请假')
    })
    .catch(() => {})
}

function handleResetStatus(registration: Registration): void {
  registrationStore.updateRegistration(registration.id, {
    status: RS.REGISTERED,
    checkedInAt: null,
    checkInMethod: null
  })
  ElMessage.success('已重置状态')
}

function handleDelete(registration: Registration): void {
  ElMessageBox.confirm(`确定取消"${registration.studentName}"的报名吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      registrationStore.updateRegistration(registration.id, {
        status: RS.REJECTED
      })
      activityStore.decrementParticipants(registration.activityId)
      operationLogStore.recordOperation(
        OperationType.REJECT_REGISTRATION,
        registration.id,
        registration.studentName,
        `取消了"${registration.studentName}"在活动"${registration.activityTitle}"的报名`
      )
      ElMessage.success('已取消报名')
    })
    .catch(() => {})
}

const statistics = computed(() => {
  const total = registrationStore.registrationList.length
  const checkedIn = registrationStore.getRegistrationsByStatus(RS.CHECKED_IN).length
  const registered = registrationStore.getRegistrationsByStatus(RS.REGISTERED).length
  const leave = registrationStore.getRegistrationsByStatus(RS.LEAVE).length
  const rejected = registrationStore.getRegistrationsByStatus(RS.REJECTED).length
  const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0
  return { total, checkedIn, registered, leave, rejected, checkInRate }
})

function getCheckInMethodTag(checkInMethod: CheckInMethod | null): string {
  if (!checkInMethod) return '-'
  return checkInMethodLabels[checkInMethod]
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">报名管理</h1>
      <div class="flex gap-2">
        <el-button type="success" @click="handleScanCheckIn">
          <el-icon><Camera /></el-icon>
          扫码签到
        </el-button>
        <el-button type="warning" @click="handleBatchCheckIn">
          <el-icon><Tickets /></el-icon>
          批量签到
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="mb-4">
      <el-col :span="4">
        <div class="stat-card">
          <div class="stat-value text-gray-800">{{ statistics.total }}</div>
          <div class="stat-label">总报名数</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-green-500">{{ statistics.checkedIn }}</div>
          <div class="stat-label">已签到</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-blue-500">{{ statistics.registered }}</div>
          <div class="stat-label">待签到</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-orange-500">{{ statistics.leave }}</div>
          <div class="stat-label">已请假</div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="stat-card">
          <div class="stat-value text-purple-500">{{ statistics.checkInRate }}%</div>
          <div class="stat-label">签到率</div>
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
      <el-table :data="paginatedRegistrations" stripe border v-loading="false">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="activityTitle" label="活动名称" min-width="180" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="studentClass" label="班级" width="140" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="registeredAt" label="报名时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="light" size="small">
              {{ registrationStatusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到方式" width="100">
          <template #default="{ row }">
            {{ getCheckInMethodTag(row.checkInMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkedInAt" label="签到时间" width="160">
          <template #default="{ row }">
            {{ row.checkedInAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'registered'"
              type="success"
              link
              @click="handleCheckIn(row)"
            >
              签到
            </el-button>
            <el-button
              v-if="row.status === 'registered'"
              type="warning"
              link
              @click="handleLeave(row)"
            >
              请假
            </el-button>
            <el-button
              v-if="row.status !== 'registered' && row.status !== 'rejected'"
              type="primary"
              link
              @click="handleResetStatus(row)"
            >
              重置
            </el-button>
            <el-button
              v-if="row.status !== 'rejected'"
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
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredRegistrations.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>

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
.gap-2 {
  gap: 8px;
}
.mb-4 {
  margin-bottom: 20px;
}
.text-gray-800 {
  color: #303133;
}
.text-green-500 {
  color: #67c23a;
}
.text-blue-500 {
  color: #409eff;
}
.text-orange-500 {
  color: #e6a23c;
}
.text-purple-500 {
  color: #909399;
}
</style>
