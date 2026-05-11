import { defineStore } from 'pinia'
import type { Course, FilterOptions } from '@/types'
import courseApi from '@/api/course'
import { addOperationLog } from '@/stores/log'

interface CourseState {
  courses: Course[]
  total: number
  page: number
  pageSize: number
  loading: boolean
}

export const useCourseStore = defineStore('course', {
  state: (): CourseState => ({
    courses: [],
    total: 0,
    page: 1,
    pageSize: 10,
    loading: false,
  }),
  actions: {
    async fetchCourses(page = 1, pageSize = 10, filters: FilterOptions = {}) {
      this.loading = true
      this.page = page
      this.pageSize = pageSize
      try {
        const response = await courseApi.getCourses({ page, pageSize, ...filters })
        this.courses = response.data
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
    async fetchUpcomingCourses() {
      this.loading = true
      try {
        const response = await courseApi.getUpcomingCourses()
        this.courses = response
        this.total = response.length
      } finally {
        this.loading = false
      }
    },
    async createCourse(course: Omit<Course, 'id' | 'currentParticipants'>) {
      this.loading = true
      try {
        const response = await courseApi.createCourse(course)
        addOperationLog({
          operationType: '新增课程',
          operationModule: '课程管理',
          targetType: '课程',
          targetId: response.id,
          targetName: response.name,
          details: `新增课程：${response.name}，教练：${response.coachName}`,
        })
        await this.fetchCourses(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async updateCourse(id: string, course: Partial<Course>) {
      this.loading = true
      try {
        const response = await courseApi.updateCourse(id, course)
        addOperationLog({
          operationType: '更新课程',
          operationModule: '课程管理',
          targetType: '课程',
          targetId: id,
          targetName: course.name || '',
          details: `更新课程信息`,
        })
        await this.fetchCourses(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
    async cancelCourse(id: string, name: string) {
      this.loading = true
      try {
        const response = await courseApi.cancelCourse(id)
        addOperationLog({
          operationType: '取消课程',
          operationModule: '课程管理',
          targetType: '课程',
          targetId: id,
          targetName: name,
          details: `取消课程：${name}`,
        })
        await this.fetchCourses(this.page, this.pageSize)
        return response
      } finally {
        this.loading = false
      }
    },
  },
})
