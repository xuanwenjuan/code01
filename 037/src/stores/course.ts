import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Course,
  CourseFormData,
  CourseFilterParams,
  CheckInFormData,
  LearningStatus,
  CourseStats,
  FilterResult
} from '@/types'
import { LearningStatus as LearningStatusEnum, ProgressStatus, OperationType } from '@/types'
import {
  generateId,
  calculateProgressStatus,
  calculateProgress,
  calculateLearningStatus,
  today,
  recalculateAllCourseMetrics,
  getCourseId,
  getRemainingHours,
  getEstimatedDaysToComplete
} from '@/utils'
import { mockCourses } from '@/mock'
import { useLogStore } from './log'

export const useCourseStore = defineStore('course', () => {
  const courses = ref<Course[]>([])
  
  const initializeCourses = (): void => {
    if (courses.value.length === 0) {
      courses.value = mockCourses.map(course => {
        const progressPercentage = calculateProgress(course.studiedHours, course.totalHours)
        const status = calculateLearningStatus(course.studiedHours, course.totalHours)
        const progressStatus = calculateProgressStatus(
          course.studiedHours,
          course.totalHours,
          course.planHoursPerDay,
          course.createdAt,
          status,
          course.lastStudyDate
        )
        
        return {
          ...course,
          progressPercentage,
          status,
          progressStatus
        }
      })
    } else {
      courses.value = courses.value.map(recalculateAllCourseMetrics)
    }
  }
  
  const courseStats = computed<CourseStats>(() => ({
    total: courses.value.length,
    completed: courses.value.filter(c => c.status === LearningStatusEnum.COMPLETED).length,
    learning: courses.value.filter(c => c.status === LearningStatusEnum.LEARNING).length,
    notStarted: courses.value.filter(c => c.status === LearningStatusEnum.NOT_STARTED).length,
    totalStudyHours: courses.value.reduce((sum, c) => sum + c.studiedHours, 0),
    lagging: courses.value.filter(c => c.progressStatus === ProgressStatus.LAGGING).length
  }))
  
  const totalCourses = computed(() => courseStats.value.total)
  const completedCourses = computed(() => courseStats.value.completed)
  const learningCourses = computed(() => courseStats.value.learning)
  const notStartedCourses = computed(() => courseStats.value.notStarted)
  const totalStudyHours = computed(() => courseStats.value.totalStudyHours)
  const laggingCourses = computed(() => courseStats.value.lagging)
  
  const getCourseById = (id: string): Course | undefined => {
    return courses.value.find(c => c.id === id)
  }
  
  const refreshCourseMetrics = (id: string): void => {
    const index = courses.value.findIndex(c => c.id === id)
    if (index !== -1) {
      courses.value[index] = recalculateAllCourseMetrics(courses.value[index])
    }
  }
  
  const refreshAllCourses = (): void => {
    courses.value = courses.value.map(recalculateAllCourseMetrics)
  }
  
  const addCourse = (data: CourseFormData): void => {
    const logStore = useLogStore()
    const now = new Date().toISOString()
    const studiedHours = data.studiedHours ?? 0
    const progressPercentage = calculateProgress(studiedHours, data.totalHours)
    const status = calculateLearningStatus(studiedHours, data.totalHours)
    
    const newCourse: Course = {
      id: generateId(),
      name: data.name,
      instructor: data.instructor,
      category: data.category,
      platform: data.platform,
      totalHours: data.totalHours,
      studiedHours,
      progressPercentage,
      status,
      progressStatus: calculateProgressStatus(
        studiedHours,
        data.totalHours,
        data.planHoursPerDay,
        now,
        status,
        studiedHours > 0 ? today() : null
      ),
      lastStudyDate: studiedHours > 0 ? today() : null,
      planHoursPerDay: data.planHoursPerDay,
      notes: [],
      checkInHistory: [],
      createdAt: now,
      updatedAt: now
    }
    
    courses.value.unshift(newCourse)
    
    logStore.addLog({
      type: OperationType.ADD_COURSE,
      courseId: newCourse.id,
      courseName: newCourse.name,
      description: `添加了新课程：${newCourse.name}`,
      detail: { course: newCourse }
    })
  }
  
  const updateCourse = (id: string, data: Partial<CourseFormData>): void => {
    const logStore = useLogStore()
    const course = getCourseById(id)
    if (!course) return
    
    const oldValues: Record<string, unknown> = {}
    const newValues: Record<string, unknown> = {}
    
    if (data.name !== undefined) {
      oldValues.name = course.name
      newValues.name = data.name
      course.name = data.name
    }
    if (data.instructor !== undefined) {
      oldValues.instructor = course.instructor
      newValues.instructor = data.instructor
      course.instructor = data.instructor
    }
    if (data.category !== undefined) {
      oldValues.category = course.category
      newValues.category = data.category
      course.category = data.category
    }
    if (data.platform !== undefined) {
      oldValues.platform = course.platform
      newValues.platform = data.platform
      course.platform = data.platform
    }
    if (data.totalHours !== undefined) {
      oldValues.totalHours = course.totalHours
      newValues.totalHours = data.totalHours
      course.totalHours = data.totalHours
    }
    if (data.studiedHours !== undefined) {
      oldValues.studiedHours = course.studiedHours
      newValues.studiedHours = data.studiedHours
      course.studiedHours = Math.min(course.totalHours, Math.max(0, data.studiedHours))
    }
    if (data.planHoursPerDay !== undefined) {
      oldValues.planHoursPerDay = course.planHoursPerDay
      newValues.planHoursPerDay = data.planHoursPerDay
      course.planHoursPerDay = data.planHoursPerDay
      logStore.addLog({
        type: OperationType.UPDATE_PLAN,
        courseId: course.id,
        courseName: course.name,
        description: `修改了课程"${course.name}"的学习计划，每日学习时长调整为 ${data.planHoursPerDay} 小时`,
        detail: { oldHours: oldValues.planHoursPerDay, newHours: data.planHoursPerDay }
      })
    }
    
    const updatedCourse = recalculateAllCourseMetrics(course)
    Object.assign(course, updatedCourse)
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.UPDATE_COURSE,
      courseId: course.id,
      courseName: course.name,
      description: `更新了课程"${course.name}"的信息`,
      detail: { oldValues, newValues }
    })
  }
  
  const deleteCourse = (id: string): void => {
    const logStore = useLogStore()
    const index = courses.value.findIndex(c => c.id === id)
    if (index === -1) return
    
    const course = courses.value[index]
    courses.value.splice(index, 1)
    
    logStore.addLog({
      type: OperationType.DELETE_COURSE,
      courseId: course.id,
      courseName: course.name,
      description: `删除了课程：${course.name}`,
      detail: { course }
    })
  }
  
  const updateStatus = (id: string, status: LearningStatus): void => {
    const logStore = useLogStore()
    const course = getCourseById(id)
    if (!course) return
    
    const oldStatus = course.status
    course.status = status
    
    const updatedCourse = recalculateAllCourseMetrics(course)
    Object.assign(course, updatedCourse)
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.UPDATE_STATUS,
      courseId: course.id,
      courseName: course.name,
      description: `将课程"${course.name}"的状态从"${oldStatus}"更新为"${status}"`,
      detail: { oldStatus, newStatus: status }
    })
  }
  
  const checkIn = (data: CheckInFormData): void => {
    const logStore = useLogStore()
    const course = getCourseById(data.courseId)
    if (!course) return
    
    const oldStudiedHours = course.studiedHours
    const oldStatus = course.status
    
    course.studiedHours = Math.min(
      course.totalHours,
      course.studiedHours + data.hours
    )
    course.lastStudyDate = data.date
    course.checkInHistory.unshift({
      id: generateId(),
      date: data.date,
      hours: data.hours
    })
    
    const updatedCourse = recalculateAllCourseMetrics(course)
    Object.assign(course, updatedCourse)
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.CHECK_IN,
      courseId: course.id,
      courseName: course.name,
      description: `完成了课程"${course.name}"的学习打卡，学习时长 ${data.hours} 小时`,
      detail: {
        date: data.date,
        hours: data.hours,
        oldStudiedHours,
        newStudiedHours: course.studiedHours,
        oldStatus,
        newStatus: course.status
      }
    })
    
    if (course.status === LearningStatusEnum.COMPLETED && oldStatus !== LearningStatusEnum.COMPLETED) {
      logStore.addLog({
        type: OperationType.UPDATE_STATUS,
        courseId: course.id,
        courseName: course.name,
        description: `课程"${course.name}"已完成，状态变更为已结业`,
        detail: { 
          oldStatus, 
          newStatus: course.status,
          completedAt: new Date().toISOString()
        }
      })
    }
  }
  
  const updateProgress = (id: string, hours: number): void => {
    const logStore = useLogStore()
    const course = getCourseById(id)
    if (!course) return
    
    const oldStudiedHours = course.studiedHours
    const oldStatus = course.status
    
    course.studiedHours = Math.min(course.totalHours, Math.max(0, hours))
    course.lastStudyDate = today()
    
    const updatedCourse = recalculateAllCourseMetrics(course)
    Object.assign(course, updatedCourse)
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.UPDATE_PROGRESS,
      courseId: course.id,
      courseName: course.name,
      description: `手动调整了课程"${course.name}"的已学课时，从 ${oldStudiedHours} 小时调整为 ${course.studiedHours} 小时`,
      detail: {
        oldStudiedHours,
        newStudiedHours: course.studiedHours,
        oldStatus,
        newStatus: course.status
      }
    })
    
    if (course.status === LearningStatusEnum.COMPLETED && oldStatus !== LearningStatusEnum.COMPLETED) {
      logStore.addLog({
        type: OperationType.UPDATE_STATUS,
        courseId: course.id,
        courseName: course.name,
        description: `课程"${course.name}"已完成，状态变更为已结业`,
        detail: { 
          oldStatus, 
          newStatus: course.status,
          completedAt: new Date().toISOString()
        }
      })
    }
  }
  
  const addNote = (id: string, content: string): void => {
    const logStore = useLogStore()
    const course = getCourseById(id)
    if (!course) return
    
    const note = {
      id: generateId(),
      content,
      createdAt: new Date().toISOString()
    }
    
    course.notes.unshift(note)
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.ADD_NOTE,
      courseId: course.id,
      courseName: course.name,
      description: `为课程"${course.name}"添加了学习心得`,
      detail: { note }
    })
  }
  
  const filterCourses = (params: CourseFilterParams): Course[] => {
    return courses.value.filter(course => {
      if (params.category && course.category !== params.category) {
        return false
      }
      if (params.platform && course.platform !== params.platform) {
        return false
      }
      if (params.status && course.status !== params.status) {
        return false
      }
      if (params.progressRange) {
        if (course.progressPercentage < params.progressRange[0] || 
            course.progressPercentage > params.progressRange[1]) {
          return false
        }
      }
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        const matchName = course.name.toLowerCase().includes(keyword)
        const matchInstructor = course.instructor.toLowerCase().includes(keyword)
        if (!matchName && !matchInstructor) {
          return false
        }
      }
      return true
    })
  }
  
  const filterCoursesWithStats = (params: CourseFilterParams): FilterResult<Course> => {
    const data = filterCourses(params)
    return {
      data,
      total: data.length
    }
  }
  
  const getCourseRemainingHours = (id: string): number => {
    const course = getCourseById(id)
    if (!course) return 0
    return getRemainingHours(course)
  }
  
  const getCourseEstimatedDays = (id: string): number => {
    const course = getCourseById(id)
    if (!course) return Infinity
    return getEstimatedDaysToComplete(course)
  }
  
  const markCourseComplete = (id: string): void => {
    const logStore = useLogStore()
    const course = getCourseById(id)
    if (!course) return
    
    const oldStatus = course.status
    const oldStudiedHours = course.studiedHours
    
    course.studiedHours = course.totalHours
    course.status = LearningStatusEnum.COMPLETED
    course.lastStudyDate = today()
    course.progressPercentage = 100
    course.progressStatus = ProgressStatus.ADVANCED
    course.updatedAt = new Date().toISOString()
    
    logStore.addLog({
      type: OperationType.UPDATE_PROGRESS,
      courseId: course.id,
      courseName: course.name,
      description: `手动将课程"${course.name}"标记为已完成，从 ${oldStudiedHours} 小时调整为 ${course.totalHours} 小时`,
      detail: {
        oldStudiedHours,
        newStudiedHours: course.totalHours,
        oldStatus,
        newStatus: course.status
      }
    })
    
    logStore.addLog({
      type: OperationType.UPDATE_STATUS,
      courseId: course.id,
      courseName: course.name,
      description: `课程"${course.name}"已标记为已结业`,
      detail: { 
        oldStatus, 
        newStatus: course.status,
        completedAt: new Date().toISOString()
      }
    })
  }
  
  const getCheckInHistory = (courseOrId: Course | string): Array<{
    id: string
    date: string
    hours: number
  }> => {
    const id = getCourseId(courseOrId)
    const course = getCourseById(id)
    return course?.checkInHistory ?? []
  }
  
  const getNotes = (courseOrId: Course | string): Array<{
    id: string
    content: string
    createdAt: string
  }> => {
    const id = getCourseId(courseOrId)
    const course = getCourseById(id)
    return course?.notes ?? []
  }
  
  return {
    courses,
    courseStats,
    totalCourses,
    completedCourses,
    learningCourses,
    notStartedCourses,
    totalStudyHours,
    laggingCourses,
    initializeCourses,
    getCourseById,
    refreshCourseMetrics,
    refreshAllCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    updateStatus,
    checkIn,
    updateProgress,
    addNote,
    filterCourses,
    filterCoursesWithStats,
    getCourseRemainingHours,
    getCourseEstimatedDays,
    markCourseComplete,
    getCheckInHistory,
    getNotes
  }
}, {
  persist: {
    key: 'course-store',
    paths: ['courses']
  }
})
