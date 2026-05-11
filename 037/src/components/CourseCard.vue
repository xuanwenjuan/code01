<template>
  <el-card
    class="course-card"
    :class="{ 'warning-card': isWarning }"
  >
    <div class="course-header">
      <div class="course-info">
        <div class="course-name" :title="course.name">{{ course.name }}</div>
        <div class="course-meta">
          <el-tag type="primary" size="small" class="meta-tag">
            {{ CourseCategoryMap[course.category] }}
          </el-tag>
          <el-tag type="info" size="small" class="meta-tag">
            {{ PlatformTypeMap[course.platform] }}
          </el-tag>
          <el-tag :type="statusTagType" size="small" class="meta-tag">
            {{ LearningStatusMap[course.status] }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <div class="course-progress">
      <div class="progress-label">
        <span>进度: {{ course.studiedHours }}/{{ course.totalHours }}h ({{ progressPercentage }}%)</span>
        <span class="progress-status">
          <span class="status-dot" :class="progressStatusClass"></span>
          {{ ProgressStatusMap[course.progressStatus] }}
        </span>
      </div>
      <el-progress
        :percentage="progressPercentage"
        :status="progressBarStatus"
        :stroke-width="8"
        :show-text="false"
      />
    </div>
    
    <div style="margin-bottom: 12px; font-size: 13px; color: #606266;">
      <span>讲师: {{ course.instructor }}</span>
      <span v-if="course.lastStudyDate" style="margin-left: 16px;">
        最近学习: {{ course.lastStudyDate }}
      </span>
    </div>
    
    <div class="course-actions">
      <el-button
        v-if="course.status !== LearningStatus.COMPLETED"
        type="primary"
        size="small"
        @click.stop="$emit('checkIn', course)"
      >
        <el-icon><Clock /></el-icon>
        打卡
      </el-button>
      <el-button size="small" @click.stop="$emit('edit', course)">
        <el-icon><Edit /></el-icon>
        编辑
      </el-button>
      <el-button type="danger" size="small" @click.stop="handleDelete">
        <el-icon><Delete /></el-icon>
        删除
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Course } from '@/types'
import {
  CourseCategoryMap,
  PlatformTypeMap,
  LearningStatus,
  LearningStatusMap,
  ProgressStatus,
  ProgressStatusMap
} from '@/types'
import { calculateProgress, isLongTimeNoStudy } from '@/utils'
import { useCourseStore } from '@/stores/course'
import { useLogStore } from '@/stores/log'

const props = defineProps({
  course: {
    type: Object as PropType<Course>,
    required: true
  }
})

defineEmits<{
  (e: 'edit', course: Course): void
  (e: 'checkIn', course: Course): void
  (e: 'delete', course: Course): void
}>()

const courseStore = useCourseStore()
const logStore = useLogStore()

const progressPercentage = computed(() => 
  calculateProgress(props.course.studiedHours, props.course.totalHours)
)

const isWarning = computed(() => 
  isLongTimeNoStudy(props.course.lastStudyDate, props.course.status) ||
  logStore.isCourseWarning(props.course.id)
)

const statusTagType = computed(() => {
  switch (props.course.status) {
    case LearningStatus.NOT_STARTED:
      return 'info'
    case LearningStatus.LEARNING:
      return isWarning.value ? 'danger' : 'warning'
    case LearningStatus.COMPLETED:
      return 'success'
    default:
      return 'info'
  }
})

const progressStatusClass = computed(() => {
  switch (props.course.progressStatus) {
    case ProgressStatus.LAGGING:
      return 'lagging'
    case ProgressStatus.ADVANCED:
      return 'advanced'
    default:
      return 'normal'
  }
})

const progressBarStatus = computed(() => {
  if (props.course.progressStatus === ProgressStatus.LAGGING) {
    return 'exception'
  }
  if (props.course.progressStatus === ProgressStatus.ADVANCED) {
    return 'success'
  }
  return undefined
})

const handleDelete = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程"${props.course.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    courseStore.deleteCourse(props.course.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
</script>
