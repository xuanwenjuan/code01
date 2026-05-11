<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Activity, Registration, CheckInMethod } from '@/types'
import { RegistrationStatus as RS, CheckInMethod as CIM, OperationType as OT } from '@/types'
import { useRegistrationStore } from '@/stores/registration'
import { useOperationLogStore } from '@/stores/operationLog'
import dayjs from 'dayjs'

const props = defineProps<{
  visible: boolean
  activity: Activity | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success', registration: Registration): void
}>()

const registrationStore = useRegistrationStore()
const operationLogStore = useOperationLogStore()

const inputValue = ref('')
const isScanning = ref(false)
const scanResult = ref<Registration | null>(null)
const scanHistory = ref<Array<{ studentName: string; time: string; success: boolean }>>([])

const registrations = computed(() => {
  if (!props.activity) return []
  return registrationStore.getRegistrationsByActivity(props.activity.id)
})

let scanInterval: ReturnType<typeof setInterval> | null = null

function simulateScan(): void {
  if (!props.activity || registrations.value.length === 0) {
    ElMessage.warning('当前活动暂无报名记录')
    return
  }

  const unCheckedIn = registrations.value.filter((r) => r.status === RS.REGISTERED)
  if (unCheckedIn.length === 0) {
    ElMessage.success('所有学生已完成签到')
    return
  }

  const randomIndex = Math.floor(Math.random() * unCheckedIn.length)
  const randomRegistration = unCheckedIn[randomIndex]

  inputValue.value = randomRegistration.studentId
  handleCheckIn()
}

function startAutoScan(): void {
  if (isScanning.value) return
  isScanning.value = true
  ElMessage.info('自动扫码签到已开启')

  scanInterval = setInterval(() => {
    if (isScanning.value) {
      simulateScan()
    }
  }, 3000)
}

function stopAutoScan(): void {
  isScanning.value = false
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
  ElMessage.info('自动扫码签到已停止')
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

function handleCheckIn(): void {
  if (!inputValue.value.trim()) {
    ElMessage.warning('请输入或扫描学号')
    return
  }

  const checkInValidation = canActivityCheckIn()
  if (!checkInValidation.canCheckIn) {
    ElMessage.warning(checkInValidation.reason || '无法签到')
    return
  }

  if (!props.activity) {
    ElMessage.error('未选择活动')
    return
  }

  const registration = registrations.value.find(
    (r) => r.studentId === inputValue.value.trim()
  )

  if (!registration) {
    ElMessage.error(`未找到学号为"${inputValue.value}"的报名记录`)
    scanHistory.value.unshift({
      studentName: inputValue.value,
      time: dayjs().format('HH:mm:ss'),
      success: false
    })
    return
  }

  if (registration.status === RS.CHECKED_IN) {
    ElMessage.warning(`"${registration.studentName}"已签到`)
    scanHistory.value.unshift({
      studentName: registration.studentName,
      time: dayjs().format('HH:mm:ss'),
      success: false
    })
    return
  }

  if (registration.status === RS.LEAVE) {
    ElMessage.warning(`"${registration.studentName}"已请假，无法签到`)
    scanHistory.value.unshift({
      studentName: registration.studentName,
      time: dayjs().format('HH:mm:ss'),
      success: false
    })
    return
  }

  if (registration.status === RS.REJECTED) {
    ElMessage.warning(`"${registration.studentName}"的报名已取消，无法签到`)
    scanHistory.value.unshift({
      studentName: registration.studentName,
      time: dayjs().format('HH:mm:ss'),
      success: false
    })
    return
  }

  registrationStore.updateRegistration(registration.id, {
    status: RS.CHECKED_IN,
    checkInMethod: CIM.SCAN_CODE,
    checkedInAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  })

  operationLogStore.recordOperation(
    OT.SCAN_CHECK_IN,
    registration.id,
    registration.studentName,
    `扫码签到：学生"${registration.studentName}"在活动"${props.activity.title}"签到成功`
  )

  scanResult.value = registration
  scanHistory.value.unshift({
    studentName: registration.studentName,
    time: dayjs().format('HH:mm:ss'),
    success: true
  })

  ElMessage.success(`"${registration.studentName}"签到成功`)
  emit('success', registration)
  inputValue.value = ''
}

function handleClose(): void {
  stopAutoScan()
  scanResult.value = null
  inputValue.value = ''
  emit('update:visible', false)
}

function handleManualInput(): void {
  handleCheckIn()
}

onUnmounted(() => {
  stopAutoScan()
})

const statistics = computed(() => {
  const total = registrations.value.length
  const checkedIn = registrations.value.filter((r) => r.status === RS.CHECKED_IN).length
  return { total, checkedIn, remaining: total - checkedIn }
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="扫码签到"
    width="900px"
    @close="handleClose"
  >
    <template v-if="activity">
      <div class="scan-container">
        <div class="scan-left">
          <div class="activity-info mb-4">
            <h3 class="text-lg font-semibold mb-2">{{ activity.title }}</h3>
            <div class="text-sm text-gray-500 space-y-1">
              <div class="flex items-center gap-2">
                <el-icon><Location /></el-icon>
                <span>{{ activity.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <el-icon><Clock /></el-icon>
                <span>{{ activity.startTime }} ~ {{ activity.endTime }}</span>
              </div>
            </div>
          </div>

          <div class="stats-row mb-4">
            <div class="stat-item">
              <div class="stat-num text-blue-500">{{ statistics.total }}</div>
              <div class="stat-label">应到人数</div>
            </div>
            <div class="stat-item">
              <div class="stat-num text-green-500">{{ statistics.checkedIn }}</div>
              <div class="stat-label">已签到</div>
            </div>
            <div class="stat-item">
              <div class="stat-num text-orange-500">{{ statistics.remaining }}</div>
              <div class="stat-label">待签到</div>
            </div>
          </div>

          <div class="scan-input-section">
            <div class="mb-3">
              <el-input
                v-model="inputValue"
                placeholder="请输入学号或使用扫码设备"
                size="large"
                @keyup.enter="handleManualInput"
              >
                <template #append>
                  <el-button type="primary" @click="handleCheckIn">
                    <el-icon><Search /></el-icon>
                    签到
                  </el-button>
                </template>
              </el-input>
            </div>

            <div class="flex gap-3">
              <el-button
                :type="isScanning ? 'danger' : 'success'"
                @click="isScanning ? stopAutoScan() : startAutoScan()"
                class="flex-1"
              >
                <el-icon>
                  <component :is="isScanning ? 'VideoPause' : 'VideoCamera'" />
                </el-icon>
                {{ isScanning ? '停止自动扫码' : '开启自动扫码（模拟）' }}
              </el-button>
              <el-button @click="simulateScan">
                <el-icon><Camera /></el-icon>
                模拟扫码
              </el-button>
            </div>
          </div>

          <div v-if="scanResult" class="scan-result mt-4">
            <el-result icon="success" title="签到成功">
              <template #sub-title>
                <div class="text-center">
                  <div class="text-xl font-semibold">{{ scanResult.studentName }}</div>
                  <div class="text-gray-500">
                    {{ scanResult.studentClass }} | {{ scanResult.studentId }}
                  </div>
                </div>
              </template>
            </el-result>
          </div>
        </div>

        <div class="scan-right">
          <h4 class="font-semibold mb-3 flex items-center gap-2">
            <el-icon><Document /></el-icon>
            签到记录
          </h4>
          <div class="history-list">
            <div
              v-for="(item, index) in scanHistory.slice(0, 10)"
              :key="index"
              class="history-item"
              :class="{ 'success': item.success, 'failed': !item.success }"
            >
              <el-icon :size="16">
                <CircleCheck v-if="item.success" />
                <CircleClose v-else />
              </el-icon>
              <span class="flex-1">{{ item.studentName }}</span>
              <span class="text-xs text-gray-400">{{ item.time }}</span>
            </div>
            <div v-if="scanHistory.length === 0" class="empty-history">
              暂无签到记录
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.scan-container {
  display: flex;
  gap: 24px;
}

.scan-left {
  flex: 1;
}

.scan-right {
  width: 280px;
  border-left: 1px solid #ebeef5;
  padding-left: 24px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.text-lg {
  font-size: 18px;
}

.text-sm {
  font-size: 14px;
}

.text-gray-500 {
  color: #909399;
}

.text-gray-400 {
  color: #c0c4cc;
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

.text-xl {
  font-size: 20px;
}

.font-semibold {
  font-weight: 600;
}

.space-y-1 > * + * {
  margin-top: 4px;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.scan-input-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.scan-result {
  background: #f0f9eb;
  border: 1px solid #67c23a40;
  border-radius: 8px;
  padding: 16px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.history-item.success {
  background: #f0f9eb;
  color: #67c23a;
}

.history-item.failed {
  background: #fef0f0;
  color: #f56c6c;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #c0c4cc;
}
</style>
