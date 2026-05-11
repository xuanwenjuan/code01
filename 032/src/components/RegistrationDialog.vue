<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Activity, Registration, RegistrationStatus } from '@/types'
import { RegistrationStatus as RS, registrationStatusLabels, OperationType, CheckInMethod as CIM } from '@/types'
import { useRegistrationStore } from '@/stores/registration'
import { useActivityStore } from '@/stores/activity'
import { useOperationLogStore } from '@/stores/operationLog'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  activity: Activity | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const registrationStore = useRegistrationStore()
const activityStore = useActivityStore()
const operationLogStore = useOperationLogStore()

const currentPage = ref(1)
const pageSize = ref(10)

const registrations = computed(() => {
  if (!props.activity) return []
  return registrationStore.getRegistrationsByActivity(props.activity.id)
})

const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return registrations.value.slice(start, end)
})

const statistics = computed(() => {
  const total = registrations.value.length
  const checkedIn = registrations.value.filter((r) => r.status === RS.CHECKED_IN).length
  const registered = registrations.value.filter((r) => r.status === RS.REGISTERED).length
  const leave = registrations.value.filter((r) => r.status === RS.LEAVE).length
  const rejected = registrations.value.filter((r) => r.status === RS.REJECTED).length
  return { total, checkedIn, registered, leave, rejected }
})

function getStatusClass(status: RegistrationStatus): string {
  const classMap: Record<RegistrationStatus, string> = {
    [RS.REGISTERED]: 'status-registered',
    [RS.CHECKED_IN]: 'status-checked-in',
    [RS.LEAVE]: 'status-leave',
    [RS.REJECTED]: 'status-ended'
  }
  return classMap[status]
}

function canActivityCheckIn(): { canCheckIn: boolean; reason?: string } {
  if (!props.activity) {
    return { canCheckIn: false, reason: '未选择活动' }
  }
  if (props.activity.status === 'cancelled') {
    return { canCheckIn: false, reason: '活动已取消' }
  }
  if (props.activity.status === 'ended') {
    return { canCheckIn: false, reason: '活动已结束' }
  }
  if (!props.activity.checkInEnabled) {
    return { canCheckIn: false, reason: '该活动未开启签到功能' }
  }
  const now = dayjs()
  if (props.activity.checkInStartTime && now.isBefore(dayjs(props.activity.checkInStartTime))) {
    return { canCheckIn: false, reason: `签到尚未开始，签到开始时间：${props.activity.checkInStartTime}` }
  }
  return { canCheckIn: true }
}

function handleCheckIn(registration: Registration): void {
  const checkInValidation = canActivityCheckIn()
  if (!checkInValidation.canCheckIn) {
    ElMessage.warning(checkInValidation.reason || '无法签到')
    return
  }
  if (registration.status === RS.CHECKED_IN) {
    ElMessage.warning('该学生已签到')
    return
  }
  if (registration.status === RS.REJECTED) {
    ElMessage.warning('该报名已取消，无法签到')
    return
  }
  if (registration.status === RS.LEAVE) {
    ElMessage.warning('该学生已请假，无法签到')
    return
  }
  registrationStore.updateRegistration(registration.id, {
    status: RS.CHECKED_IN,
    checkInMethod: registration.checkInMethod || CIM.MANUAL,
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

function handleLeave(registration: Registration): void {
  if (registration.status === RS.CHECKED_IN) {
    ElMessage.warning('该学生已签到，无法请假')
    return
  }
  if (registration.status === RS.REJECTED) {
    ElMessage.warning('该报名已取消')
    return
  }
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

function handleExport(): void {
  if (!props.activity) return
  const headers = ['学号', '姓名', '班级', '联系电话', '报名时间', '状态', '签到时间']
  const rows = registrations.value.map((r) => [
    r.studentId,
    r.studentName,
    r.studentClass,
    r.phone,
    r.registeredAt,
    registrationStatusLabels[r.status],
    r.checkedInAt || '-'
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.activity.title}_报名名单.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  operationLogStore.recordOperation(
    OperationType.EXPORT_LIST,
    props.activity.id,
    props.activity.title,
    `导出了活动"${props.activity.title}"的报名名单`
  )
  ElMessage.success('导出成功')
}

function handleClose(): void {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      currentPage.value = 1
    }
  }
)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="activity ? `报名管理 - ${activity.title}` : '报名管理'"
    width="1000px"
    @close="handleClose"
  >
    <template v-if="activity">
      <div class="stat-row mb-4">
        <div class="stat-item">
          <div class="stat-num">{{ statistics.total }}</div>
          <div class="stat-label">总报名数</div>
        </div>
        <div class="stat-item">
          <div class="stat-num text-green-500">{{ statistics.checkedIn }}</div>
          <div class="stat-label">已签到</div>
        </div>
        <div class="stat-item">
          <div class="stat-num text-blue-500">{{ statistics.registered }}</div>
          <div class="stat-label">待签到</div>
        </div>
        <div class="stat-item">
          <div class="stat-num text-red-500">{{ statistics.leave }}</div>
          <div class="stat-label">已请假</div>
        </div>
        <div class="stat-item">
          <div class="stat-num text-gray-500">{{ statistics.rejected }}</div>
          <div class="stat-label">已取消</div>
        </div>
        <div class="stat-item">
          <div class="stat-num text-orange-500">
            {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
          </div>
          <div class="stat-label">报名情况</div>
        </div>
      </div>

      <div class="mb-3">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出名单
        </el-button>
        <span class="ml-3 text-gray-500 text-sm">
          活动时间：{{ activity.startTime }} ~ {{ activity.endTime }} | 地点：{{ activity.location }}
        </span>
      </div>

      <el-table :data="paginatedRegistrations" stripe border>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentId" label="学号" width="140" />
        <el-table-column prop="studentName" label="姓名" width="100" />
        <el-table-column prop="studentClass" label="班级" width="140" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="registeredAt" label="报名时间" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="getStatusClass(row.status)">
              {{ registrationStatusLabels[row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="checkedInAt" label="签到时间" width="160">
          <template #default="{ row }">
            {{ row.checkedInAt || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
              v-if="row.status === 'checked_in' || row.status === 'leave'"
              type="primary"
              link
              @click="handleResetStatus(row)"
            >
              重置
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="registrations.length"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.stat-row {
  display: flex;
  gap: 20px;
}
.stat-item {
  background: #f5f7fa;
  padding: 16px 24px;
  border-radius: 8px;
  text-align: center;
  flex: 1;
}
.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 13px;
  color: #909399;
}
.text-green-500 {
  color: #67c23a;
}
.text-blue-500 {
  color: #409eff;
}
.text-red-500 {
  color: #f56c6c;
}
.text-orange-500 {
  color: #e6a23c;
}
.ml-3 {
  margin-left: 12px;
}
.text-gray-500 {
  color: #909399;
}
.text-sm {
  font-size: 13px;
}
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>
