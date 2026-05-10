<template>
  <el-dialog
    :model-value="visible"
    title="排班设置"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <div class="schedule-info" v-if="doctor">
      <div class="doctor-info">
        <span class="label">医生：</span>
        <span class="value">{{ doctor.name }}</span>
        <el-tag :type="doctor.status === 'on_duty' ? 'success' : 'info'" size="small" class="ml-2">
          {{ doctor.status === 'on_duty' ? '在岗' : doctor.status === 'off_duty' ? '离岗' : '休假' }}
        </el-tag>
      </div>
      <div class="dept-info">
        <span class="label">科室：</span>
        <span class="value">{{ departmentName }}</span>
        <span class="label ml-4">职称：</span>
        <span class="value">{{ doctor.title }}</span>
      </div>
    </div>
    
    <div class="schedule-table">
      <el-table :data="weekDays" border style="width: 100%">
        <el-table-column label="星期" prop="name" width="100" />
        <el-table-column label="上午">
          <template #default="{ row }">
            <div class="slot-row">
              <el-checkbox v-model="row.morning.checked" @change="handleSlotChange(row, 'morning')">
                排班
              </el-checkbox>
              <div class="slot-config" v-if="row.morning.checked">
                <el-input-number
                  v-model="row.morning.maxPatients"
                  :min="5"
                  :max="50"
                  size="small"
                  placeholder="号源数"
                />
                <span class="unit">人</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="下午">
          <template #default="{ row }">
            <div class="slot-row">
              <el-checkbox v-model="row.afternoon.checked" @change="handleSlotChange(row, 'afternoon')">
                排班
              </el-checkbox>
              <div class="slot-config" v-if="row.afternoon.checked">
                <el-input-number
                  v-model="row.afternoon.maxPatients"
                  :min="5"
                  :max="40"
                  size="small"
                  placeholder="号源数"
                />
                <span class="unit">人</span>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="quick-actions">
      <el-button size="small" @click="selectAllWeekdays">工作日全选</el-button>
      <el-button size="small" @click="clearAll">清空</el-button>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        保存排班
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { Doctor, Schedule, WeekDay, TimeSlot } from '@/types'
import { useSystemStore } from '@/stores/system'

interface ScheduleSlot {
  checked: boolean
  maxPatients: number
}

interface WeekDayRow {
  day: WeekDay
  name: string
  morning: ScheduleSlot
  afternoon: ScheduleSlot
}

interface Props {
  visible: boolean
  doctor: Doctor | null
}

const props = withDefaults(defineProps<Props>(), {
  doctor: null
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'submit'): void
}>()

const systemStore = useSystemStore()
const loading = ref(false)

const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const weekDays = reactive<WeekDayRow[]>(
  weekDayNames.map((name, index) => ({
    day: (index + 1) as WeekDay,
    name,
    morning: { checked: false, maxPatients: 20 },
    afternoon: { checked: false, maxPatients: 15 }
  }))
)

const departmentName = computed(() => {
  if (!props.doctor) return ''
  return systemStore.getDepartmentById(props.doctor.departmentId)?.name || ''
})

watch(
  () => props.visible,
  async (val) => {
    if (val && props.doctor) {
      const schedules = await systemStore.getDoctorSchedules(props.doctor.id)
      resetWeekDays()
      schedules.forEach((schedule: Schedule) => {
        const dayRow = weekDays.find(d => d.day === schedule.weekDay)
        if (dayRow) {
          if (schedule.timeSlot === 'morning') {
            dayRow.morning = {
              checked: schedule.status === 'available',
              maxPatients: schedule.maxPatients
            }
          } else {
            dayRow.afternoon = {
              checked: schedule.status === 'available',
              maxPatients: schedule.maxPatients
            }
          }
        }
      })
    }
  }
)

function resetWeekDays() {
  weekDays.forEach(row => {
    row.morning = { checked: false, maxPatients: 20 }
    row.afternoon = { checked: false, maxPatients: 15 }
  })
}

function handleSlotChange(_row: WeekDayRow, _slot: TimeSlot) {
}

function selectAllWeekdays() {
  for (let i = 0; i < 5; i++) {
    weekDays[i].morning = { checked: true, maxPatients: 20 }
    weekDays[i].afternoon = { checked: true, maxPatients: 15 }
  }
}

function clearAll() {
  resetWeekDays()
}

function generateSchedules(): Schedule[] {
  const schedules: Schedule[] = []
  if (!props.doctor) return schedules

  weekDays.forEach(row => {
    if (row.morning.checked) {
      schedules.push({
        doctorId: props.doctor!.id,
        departmentId: props.doctor!.departmentId,
        weekDay: row.day,
        timeSlot: 'morning',
        maxPatients: row.morning.maxPatients,
        status: 'available'
      })
    }
    if (row.afternoon.checked) {
      schedules.push({
        doctorId: props.doctor!.id,
        departmentId: props.doctor!.departmentId,
        weekDay: row.day,
        timeSlot: 'afternoon',
        maxPatients: row.afternoon.maxPatients,
        status: 'available'
      })
    }
  })

  return schedules
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!props.doctor) return

  loading.value = true
  try {
    const schedules = generateSchedules()
    await systemStore.updateDoctorSchedules(props.doctor.id, schedules)
    emit('submit')
    emit('update:visible', false)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.schedule-info {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;

  .doctor-info, .dept-info {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .label {
    color: #909399;
  }

  .value {
    color: #303133;
    font-weight: 500;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .ml-4 {
    margin-left: 16px;
  }
}

.schedule-table {
  margin-bottom: 16px;
}

.slot-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;

  .slot-config {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 8px;

    .unit {
      color: #909399;
      font-size: 12px;
    }
  }
}

.quick-actions {
  margin-bottom: 16px;
}

.ml-4 {
  margin-left: 16px;
}
</style>
