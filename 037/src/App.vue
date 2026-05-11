<template>
  <div class="app-container">
    <Aside />
    <div class="main-content">
      <router-view />
    </div>
    <CourseFormDialog
      v-model="showCourseDialog"
      :course="editingCourse"
      @confirm="handleCourseConfirm"
    />
    <CheckInDialog
      v-model="showCheckInDialog"
      :course-id="checkInCourseId"
      @confirm="handleCheckInConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import type { Course, CourseFormData, CheckInFormData } from '@/types'
import { useCourseStore } from '@/stores/course'
import Aside from '@/components/Aside.vue'
import CourseFormDialog from '@/components/CourseFormDialog.vue'
import CheckInDialog from '@/components/CheckInDialog.vue'

const courseStore = useCourseStore()

const showCourseDialog = ref(false)
const editingCourse = ref<Course | undefined>(undefined)

const showCheckInDialog = ref(false)
const checkInCourseId = ref<string>('')

const handleOpenAddDialog = (): void => {
  editingCourse.value = undefined
  showCourseDialog.value = true
}

const handleOpenEditDialog = (course: Course): void => {
  editingCourse.value = course
  showCourseDialog.value = true
}

const handleCourseConfirm = (data: CourseFormData): void => {
  if (editingCourse.value) {
    courseStore.updateCourse(editingCourse.value.id, data)
  } else {
    courseStore.addCourse(data)
  }
}

const handleOpenCheckInDialog = (courseOrId?: Course | string): void => {
  if (courseOrId) {
    checkInCourseId.value = typeof courseOrId === 'string' ? courseOrId : courseOrId.id
  }
  showCheckInDialog.value = true
}

const handleCheckInConfirm = (data: CheckInFormData): void => {
  courseStore.checkIn(data)
}

provide('openAddDialog', handleOpenAddDialog)
provide('openEditDialog', handleOpenEditDialog)
provide('openCheckInDialog', handleOpenCheckInDialog)
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--app-bg);
}

.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 24px;
  overflow-x: hidden;
  transition: margin-left 0.3s;
  
  @media (max-width: 1024px) {
    margin-left: 60px;
    padding: 16px;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 12px;
  }
}
</style>
