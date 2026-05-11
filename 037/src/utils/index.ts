import dayjs from 'dayjs'
import { ProgressStatus, LearningStatus } from '@/types'
import type { Course } from '@/types'

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  return dayjs(date).format(format)
}

export const calculateProgress = (studied: number, total: number): number => {
  if (!Number.isFinite(total) || total <= 0) return 0
  if (!Number.isFinite(studied) || studied < 0) return 0
  return Math.min(100, Math.round((studied / total) * 100))
}

export const calculateLearningStatus = (studiedHours: number, totalHours: number): LearningStatus => {
  if (!Number.isFinite(studiedHours) || studiedHours <= 0) {
    return LearningStatus.NOT_STARTED
  }
  if (studiedHours >= totalHours) {
    return LearningStatus.COMPLETED
  }
  return LearningStatus.LEARNING
}

export const calculateProgressStatus = (
  studiedHours: number,
  totalHours: number,
  planHoursPerDay: number,
  createdAt: string,
  status: LearningStatus,
  lastStudyDate: string | null
): ProgressStatus => {
  if (status === LearningStatus.NOT_STARTED) {
    return ProgressStatus.NORMAL
  }
  if (status === LearningStatus.COMPLETED) {
    return ProgressStatus.ADVANCED
  }
  
  if (!Number.isFinite(studiedHours) || studiedHours < 0) {
    return ProgressStatus.NORMAL
  }
  if (!Number.isFinite(planHoursPerDay) || planHoursPerDay <= 0) {
    return ProgressStatus.NORMAL
  }
  
  const daysSinceStart = dayjs().diff(dayjs(createdAt), 'day')
  if (daysSinceStart <= 1) {
    return ProgressStatus.NORMAL
  }
  
  const expectedProgress = daysSinceStart * planHoursPerDay
  const progressDiff = studiedHours - expectedProgress
  const threshold = Math.max(3, planHoursPerDay * 2)
  
  if (isLongTimeNoStudy(lastStudyDate, status)) {
    return ProgressStatus.LAGGING
  }
  
  if (progressDiff > threshold) {
    return ProgressStatus.ADVANCED
  } else if (progressDiff < -threshold) {
    return ProgressStatus.LAGGING
  }
  
  return ProgressStatus.NORMAL
}

export const isLongTimeNoStudy = (lastStudyDate: string | null, status: LearningStatus): boolean => {
  if (status !== LearningStatus.LEARNING || !lastStudyDate) {
    return false
  }
  const days = dayjs().diff(dayjs(lastStudyDate), 'day')
  return days >= 7
}

export const today = (): string => {
  return dayjs().format('YYYY-MM-DD')
}

export const getDaysDiff = (start: string, end: string): number => {
  return dayjs(end).diff(dayjs(start), 'day')
}

export const getCourseId = (courseOrId: Course | string): string => {
  return typeof courseOrId === 'string' ? courseOrId : courseOrId.id
}

export const updateCourseProgress = (course: Course, newStudiedHours: number): Course => {
  const safeStudiedHours = Math.max(0, Math.min(course.totalHours, newStudiedHours))
  const newStatus = calculateLearningStatus(safeStudiedHours, course.totalHours)
  const newProgressPercentage = calculateProgress(safeStudiedHours, course.totalHours)
  const newProgressStatus = calculateProgressStatus(
    safeStudiedHours,
    course.totalHours,
    course.planHoursPerDay,
    course.createdAt,
    newStatus,
    newStudiedHours > course.studiedHours ? today() : course.lastStudyDate
  )
  
  return {
    ...course,
    studiedHours: safeStudiedHours,
    status: newStatus,
    progressPercentage: newProgressPercentage,
    progressStatus: newProgressStatus,
    lastStudyDate: newStudiedHours > course.studiedHours ? today() : course.lastStudyDate,
    updatedAt: new Date().toISOString()
  }
}

export const recalculateAllCourseMetrics = (course: Course): Course => {
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
}

export const getRemainingHours = (course: Course): number => {
  return Math.max(0, course.totalHours - course.studiedHours)
}

export const getEstimatedDaysToComplete = (course: Course): number => {
  if (course.status === LearningStatus.COMPLETED) return 0
  if (course.planHoursPerDay <= 0) return Infinity
  
  const remaining = getRemainingHours(course)
  return Math.ceil(remaining / course.planHoursPerDay)
}

export const isCourseCompleted = (course: Course): boolean => {
  return course.status === LearningStatus.COMPLETED || 
         course.studiedHours >= course.totalHours
}

export const isCourseLearning = (course: Course): boolean => {
  return course.status === LearningStatus.LEARNING || 
         (course.studiedHours > 0 && course.studiedHours < course.totalHours)
}

export const isCourseNotStarted = (course: Course): boolean => {
  return course.status === LearningStatus.NOT_STARTED || course.studiedHours <= 0
}
