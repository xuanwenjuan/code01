<template>
  <el-dialog
    v-model="visible"
    title="学习打卡"
    width="600px"
    destroy-on-close
    @close="handleClose"
  >
    <div v-if="selectedCourse" class="course-preview">
      <el-divider>当前课程</el-divider>
      <div class="course-info-row">
        <div class="course-info-item">
          <span class="label">课程名称:</span>
          <span class="value">{{ selectedCourse.name }}</span>
        </div>
        <div class="course-info-item">
          <span class="label">讲师:</span>
          <span class="value">{{ selectedCourse.instructor }}</span>
        </div>
      </div>
      <div class="course-info-row">
        <div class="course-info-item">
          <span class="label">学习进度:</span>
          <span class="value">
            {{ selectedCourse.studiedHours }}/{{ selectedCourse.totalHours }}h
            <el-tag
              :type="progressTagType(selectedCourse.progressPercentage)"
              size="small"
              style="margin-left: 8px;"
            >
              {{ selectedCourse.progressPercentage }}%
            </el-tag>
          </span>
        </div>
        <div class="course-info-item">
          <span class="label">预计完成:</span>
          <span class="value">{{ estimatedDaysText }}</span>
        </div>
      </div>
      <el-progress
        :percentage="selectedCourse.progressPercentage"
        :status="selectedCourse.progressPercentage === 100 ? 'success' : undefined"
        :stroke-width="8"
      />
      
      <el-divider v-if="recentCheckIns.length > 0">最近打卡</el-divider>
      <div v-if="recentCheckIns.length > 0" class="recent-checkins">
        <div
          v-for="record in recentCheckIns"
          :key="record.id"
          class="checkin-item"
        >
          <el-icon class="checkin-icon"><Clock /></el-icon>
          <span class="checkin-date">{{ record.date }}</span>
          <el-tag type="success" size="small">+{{ record.hours }}h</el-tag>
        </div>
      </div>
    </div>
    
    <el-divider>打卡信息</el-divider>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="dialog-content"
    >
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="formData.courseId"
          placeholder="请选择课程"
          style="width: 100%;"
          @change="handleCourseChange"
        >
          <el-option
            v-for="course in availableCourses"
            :key="course.id"
            :label="course.name"
            :value="course.id"
            :disabled="course.status === LearningStatus.COMPLETED"
          >
            <div class="option-content">
              <span class="option-name">{{ course.name }}</span>
              <span class="option-meta">
                <el-tag
                  v-if="course.status === LearningStatus.COMPLETED"
                  size="small"
                  type="success"
                  effect="light"
                >
                  已完成
                </el-tag>
                <span v-else class="option-progress">
                  {{ course.studiedHours }}/{{ course.totalHours }}h ({{ course.progressPercentage }}%)
                </span>
              </span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="打卡日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="选择打卡日期"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
          style="width: 100%;"
        />
      </el-form-item>
      
      <el-form-item label="学习时长" prop="hours">
        <el-input-number
          v-model="formData.hours"
          :min="0.5"
          :max="maxHoursPerDay"
          :step="0.5"
          placeholder="学习时长"
        />
        <span style="margin-left: 8px; color: #909399; font-size: 12px;">小时</span>
        <el-tag
          v-if="selectedCourse && formData.hours > selectedCourse.planHoursPerDay"
          type="success"
          size="small"
          style="margin-left: 8px;"
        >
          超出计划 +{{ (formData.hours - (selectedCourse?.planHoursPerDay ?? 0)).toFixed(1) }}h
        </el-tag>
      </el-form-item>
      
      <el-form-item label="预计剩余">
        <span v-if="selectedCourse" class="remaining-hours">
          打卡后预计还需 {{ remainingAfterCheckIn }} 小时，约 {{ remainingDaysAfterCheckIn }} 天完成
        </span>
        <span v-else class="remaining-hours text-gray">请先选择课程</span>
      </el-form-item>
      
      <el-form-item label="学习心得" prop="note">
        <el-input
          v-model="note"
          type="textarea"
          :rows="3"
          placeholder="今日学习收获（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        <el-icon><SuccessFilled /></el-icon>
        确认打卡
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, type PropType } from 'vue'
import { useCourseStore } from '@/stores/course'
import type { CheckInFormData, Course } from '@/types'
import { LearningStatus, LearningStatusMap } from '@/types'
import { today, getDaysDiff } from '@/utils'
import type { ElDatePickerProps } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  courseId: {
    type: String as PropType<string>,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: CheckInFormData): void
}>()

const courseStore = useCourseStore()
const maxHoursPerDay = 12

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const availableCourses = computed(() => 
  courseStore.courses.filter(c => c.status !== LearningStatus.COMPLETED)
)

const selectedCourse = computed<Course | undefined>(() => {
  if (!formData.value.courseId) return undefined
  return courseStore.getCourseById(formData.value.courseId)
})

const recentCheckIns = computed(() => {
  if (!selectedCourse.value) return []
  return selectedCourse.value.checkInHistory.slice(0, 5)
})

const estimatedDaysText = computed(() => {
  if (!selectedCourse.value) return '-'
  if (selectedCourse.value.status === LearningStatus.COMPLETED) return '已完成'
  if (selectedCourse.value.planHoursPerDay <= 0) return '未设置计划'
  
  const remaining = selectedCourse.value.totalHours - selectedCourse.value.studiedHours
  const days = Math.ceil(remaining / selectedCourse.value.planHoursPerDay)
  return `${days} 天`
})

const remainingAfterCheckIn = computed(() => {
  if (!selectedCourse.value) return 0
  const remaining = selectedCourse.value.totalHours - 
    (selectedCourse.value.studiedHours + (formData.value.hours || 0))
  return Math.max(0, remaining)
})

const remainingDaysAfterCheckIn = computed(() => {
  if (!selectedCourse.value || selectedCourse.value.planHoursPerDay <= 0) return '∞'
  if (remainingAfterCheckIn.value <= 0) return 0
  return Math.ceil(remainingAfterCheckIn.value / selectedCourse.value.planHoursPerDay)
})

const formRef = ref<InstanceType<typeof import('element-plus').ElForm>>()
const submitting = ref(false)
const note = ref('')

const defaultFormData = (): CheckInFormData => ({
  courseId: props.courseId || '',
  date: today(),
  hours: 1
})

const formData = ref<CheckInFormData>(defaultFormData())

const formRules = {
  courseId: [
    { required: true, message: '请选择课程', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择打卡日期', trigger: 'change' }
  ],
  hours: [
    { required: true, message: '请输入学习时长', trigger: 'blur' }
  ]
}

const progressTagType = (percentage: number): 'success' | 'warning' | 'info' => {
  if (percentage >= 80) return 'success'
  if (percentage >= 30) return 'warning'
  return 'info'
}

const disabledDate: ElDatePickerProps['disabledDate'] = (time: Date) => {
  const todayDate = new Date()
  todayDate.setHours(23, 59, 59, 999)
  return time.getTime() > todayDate.getTime()
}

const handleCourseChange = (courseId: string): void => {
  const course = courseStore.getCourseById(courseId)
  if (course) {
    formData.value.hours = Math.min(course.planHoursPerDay, maxHoursPerDay)
  }
}

watch(() => props.courseId, (newId) => {
  if (newId) {
    formData.value.courseId = newId
    handleCourseChange(newId)
  }
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    const initialCourseId = props.courseId || (availableCourses.value[0]?.id ?? '')
    formData.value = {
      courseId: initialCourseId,
      date: today(),
      hours: 1
    }
    if (initialCourseId) {
      handleCourseChange(initialCourseId)
    }
    note.value = ''
  }
})

const handleClose = (): void => {
  visible.value = false
  setTimeout(() => {
    formRef.value?.resetFields()
    formData.value = defaultFormData()
    note.value = ''
  }, 300)
}

const handleSubmit = async (): Promise<void> => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  if (selectedCourse.value) {
    const remaining = selectedCourse.value.totalHours - selectedCourse.value.studiedHours
    if (formData.value.hours > remaining) {
      formData.value.hours = remaining
    }
  }
  
  submitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (note.value.trim()) {
      courseStore.addNote(formData.value.courseId, note.value.trim())
    }
    
    emit('confirm', { ...formData.value })
    handleClose()
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.course-preview {
  .course-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .course-info-item {
      display: flex;
      align-items: center;
      
      .label {
        color: #909399;
        margin-right: 8px;
        font-size: 13px;
      }
      
      .value {
        font-weight: 500;
        color: #303133;
      }
    }
  }
  
  .remaining-hours {
    color: #409eff;
    font-weight: 500;
    
    &.text-gray {
      color: #909399;
      font-weight: normal;
    }
  }
}

.recent-checkins {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  
  .checkin-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
    
    .checkin-icon {
      color: #67c23a;
    }
    
    .checkin-date {
      color: #606266;
    }
  }
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  .option-name {
    font-weight: 500;
  }
  
  .option-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .option-progress {
    color: #909399;
    font-size: 12px;
  }
}
</style>
