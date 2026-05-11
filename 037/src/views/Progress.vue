<template>
  <div class="progress-page">
    <div class="page-header">
      <h1 class="page-title">学习进度</h1>
      <div class="page-actions">
        <el-button type="primary" @click="openCheckInDialog()">
          <el-icon><Clock /></el-icon>
          快速打卡
        </el-button>
      </div>
    </div>
    
    <el-card>
      <el-table
        :data="progressList"
        stripe
        style="width: 100%;"
      >
        <el-table-column prop="name" label="课程名称" min-width="200">
          <template #default="{ row }">
            <div class="cell-course">
              <div class="course-name" :title="row.name">{{ row.name }}</div>
              <div class="course-meta">
                <el-tag size="small" type="primary">
                  {{ CourseCategoryMap[row.category] }}
                </el-tag>
                <el-tag
                  v-if="isWarning(row)"
                  size="small"
                  type="danger"
                  effect="light"
                >
                  长期未学习
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学习进度" min-width="220">
          <template #default="{ row }">
            <div class="cell-progress">
              <el-progress
                :percentage="calculateProgress(row.studiedHours, row.totalHours)"
                :status="progressStatus(row)"
                :stroke-width="10"
              />
              <div class="progress-info">
                <span>{{ row.studiedHours }}/{{ row.totalHours }} 小时</span>
                <span class="progress-status-tag">
                  {{ ProgressStatusMap[row.progressStatus] }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="学习状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ LearningStatusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="每日计划" width="120">
          <template #default="{ row }">
            {{ row.planHoursPerDay }} 小时
          </template>
        </el-table-column>
        
        <el-table-column label="最近学习" width="140">
          <template #default="{ row }">
            {{ row.lastStudyDate || '暂无' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== LearningStatus.COMPLETED"
              type="primary"
              size="small"
              @click="openCheckInDialog(row)"
            >
              打卡
            </el-button>
            <el-button
              size="small"
              @click="handleUpdateProgress(row)"
            >
              调整进度
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="handleAddNote(row)"
            >
              添加心得
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog
      v-model="showProgressDialog"
      title="调整学习进度"
      width="500px"
    >
      <el-form :model="progressForm" label-width="120px">
        <el-form-item label="课程名称">
          <el-input v-model="progressForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="已学课时">
          <el-input-number
            v-model="progressForm.hours"
            :min="0"
            :max="progressForm.totalHours"
            style="width: 100%;"
          />
          <span style="margin-left: 8px; color: #909399;">
            / {{ progressForm.totalHours }} 小时
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProgressDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateProgress">
          确认调整
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog
      v-model="showNoteDialog"
      title="添加学习心得"
      width="500px"
    >
      <el-form :model="noteForm" label-width="120px">
        <el-form-item label="课程名称">
          <el-input v-model="noteForm.courseName" disabled />
        </el-form-item>
        <el-form-item label="学习心得">
          <el-input
            v-model="noteForm.content"
            type="textarea"
            :rows="4"
            placeholder="记录您的学习心得..."
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNoteDialog = false">取消</el-button>
        <el-button type="primary" :loading="noteSubmitting" @click="confirmAddNote">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Course } from '@/types'
import {
  LearningStatus,
  LearningStatusMap,
  ProgressStatus,
  ProgressStatusMap,
  CourseCategoryMap
} from '@/types'
import { useCourseStore } from '@/stores/course'
import { useLogStore } from '@/stores/log'
import { calculateProgress, isLongTimeNoStudy } from '@/utils'

const courseStore = useCourseStore()
const logStore = useLogStore()

const openCheckInDialog = inject<(courseOrId?: Course | string) => void>('openCheckInDialog') as (courseOrId?: Course | string) => void

const progressList = computed(() => courseStore.courses)

const showProgressDialog = ref(false)
const progressForm = reactive({
  courseId: '',
  courseName: '',
  hours: 0,
  totalHours: 0
})

const showNoteDialog = ref(false)
const noteForm = reactive({
  courseId: '',
  courseName: '',
  content: ''
})
const noteSubmitting = ref(false)

const isWarning = (course: Course): boolean => {
  return isLongTimeNoStudy(course.lastStudyDate, course.status) ||
    logStore.isCourseWarning(course.id)
}

const statusType = (status: LearningStatus): string => {
  switch (status) {
    case LearningStatus.NOT_STARTED:
      return 'info'
    case LearningStatus.LEARNING:
      return 'warning'
    case LearningStatus.COMPLETED:
      return 'success'
    default:
      return 'info'
  }
}

const progressStatus = (course: Course): undefined | 'exception' | 'success' => {
  if (course.progressStatus === ProgressStatus.LAGGING) {
    return 'exception'
  }
  if (course.progressStatus === ProgressStatus.ADVANCED) {
    return 'success'
  }
  return undefined
}

const handleUpdateProgress = (course: Course): void => {
  progressForm.courseId = course.id
  progressForm.courseName = course.name
  progressForm.hours = course.studiedHours
  progressForm.totalHours = course.totalHours
  showProgressDialog.value = true
}

const confirmUpdateProgress = (): void => {
  courseStore.updateProgress(progressForm.courseId, progressForm.hours)
  ElMessage.success('进度已更新')
  showProgressDialog.value = false
}

const handleAddNote = (course: Course): void => {
  noteForm.courseId = course.id
  noteForm.courseName = course.name
  noteForm.content = ''
  showNoteDialog.value = true
}

const confirmAddNote = async (): Promise<void> => {
  if (!noteForm.content.trim()) {
    ElMessage.warning('请输入学习心得内容')
    return
  }
  
  noteSubmitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    courseStore.addNote(noteForm.courseId, noteForm.content.trim())
    ElMessage.success('学习心得已保存')
    showNoteDialog.value = false
  } finally {
    noteSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.cell-course {
  .course-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .course-meta {
    display: flex;
    gap: 8px;
  }
}

.cell-progress {
  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    
    .progress-status-tag {
      font-weight: 500;
    }
  }
}
</style>
