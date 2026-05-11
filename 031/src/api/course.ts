import request from './request'
import type { Course, FilterOptions, PaginatedResponse } from '@/types'

interface GetCoursesParams extends FilterOptions {
  page: number
  pageSize: number
}

const courseApi = {
  getCourses: (params: GetCoursesParams): Promise<PaginatedResponse<Course>> => {
    return request.get('/courses', { params })
  },
  getUpcomingCourses: (): Promise<Course[]> => {
    return request.get('/courses/upcoming')
  },
  createCourse: (course: Omit<Course, 'id' | 'currentParticipants'>): Promise<Course> => {
    return request.post('/courses', course)
  },
  updateCourse: (id: string, course: Partial<Course>): Promise<Course> => {
    return request.put(`/courses/${id}`, course)
  },
  cancelCourse: (id: string): Promise<Course> => {
    return request.put(`/courses/${id}/cancel`)
  },
}

export default courseApi
