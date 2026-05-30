import { defineStore } from 'pinia'
import type {
  Coach,
  Course,
  Member,
  PurchaseRecord,
  Booking,
  Schedule,
  BookingForm,
  BookingStatus,
  CourseStatus
} from '@/types'

interface AppStoreState {
  coaches: Coach[]
  courses: Course[]
  members: Member[]
  purchaseRecords: PurchaseRecord[]
  bookings: Booking[]
  schedules: Schedule[]
  pagination: {
    coach: { page: number; pageSize: number }
    course: { page: number; pageSize: number }
    member: { page: number; pageSize: number }
    booking: { page: number; pageSize: number }
  }
  loading: {
    global: boolean
    coachList: boolean
    courseList: boolean
    memberList: boolean
    bookingList: boolean
  }
}

export const useAppStore = defineStore('app', {
  state: (): AppStoreState => ({
    coaches: [],
    courses: [],
    members: [],
    purchaseRecords: [],
    bookings: [],
    schedules: [],
    pagination: {
      coach: { page: 1, pageSize: 10 },
      course: { page: 1, pageSize: 10 },
      member: { page: 1, pageSize: 10 },
      booking: { page: 1, pageSize: 10 }
    },
    loading: {
      global: false,
      coachList: false,
      courseList: false,
      memberList: false,
      bookingList: false
    }
  }),

  getters: {
    // 获取上架课程
    onlineCourses: (state): Course[] => {
      return state.courses.filter(course => course.status === 'online')
    },

    // 获取在职教练
    activeCoaches: (state): Coach[] => {
      return state.coaches.filter(coach => coach.status === 'active')
    },

    // 获取已约课程（用于时段冲突检查）
    getBookingsByCoachAndDate: (state) => {
      return (coachId: string, date: string): Booking[] => {
        return state.bookings.filter(
          booking => booking.coachId === coachId && 
                     booking.date === date && 
                     booking.status === 'booked'
        )
      }
    },

    // 分页数据获取
    getPaginatedCoaches: (state) => (page: number, pageSize: number): Coach[] => {
      const start = (page - 1) * pageSize
      return state.coaches.slice(start, start + pageSize)
    },

    getPaginatedCourses: (state) => (page: number, pageSize: number): Course[] => {
      const start = (page - 1) * pageSize
      return state.courses.slice(start, start + pageSize)
    },

    getPaginatedMembers: (state) => (page: number, pageSize: number): Member[] => {
      const start = (page - 1) * pageSize
      return state.members.slice(start, start + pageSize)
    },

    getPaginatedBookings: (state) => (page: number, pageSize: number): Booking[] => {
      const start = (page - 1) * pageSize
      return state.bookings.slice(start, start + pageSize)
    }
  },

  actions: {
    // ==================== 教练相关操作 ====================
    setCoaches(coaches: Coach[]): void {
      this.coaches = coaches
    },

    addCoach(coach: Coach): void {
      this.coaches.unshift(coach)
    },

    updateCoach(coach: Coach): void {
      const index = this.coaches.findIndex(c => c.id === coach.id)
      if (index !== -1) {
        this.coaches[index] = coach
      }
    },

    deleteCoach(id: string): void {
      this.coaches = this.coaches.filter(c => c.id !== id)
    },

    // ==================== 课程相关操作 ====================
    setCourses(courses: Course[]): void {
      this.courses = courses
    },

    addCourse(course: Course): void {
      this.courses.unshift(course)
    },

    updateCourse(course: Course): void {
      const index = this.courses.findIndex(c => c.id === course.id)
      if (index !== -1) {
        this.courses[index] = course
      }
    },

    deleteCourse(id: string): void {
      this.courses = this.courses.filter(c => c.id !== id)
    },

    // 课程上下架 - 实时状态刷新
    toggleCourseStatus(id: string): CourseStatus {
      const index = this.courses.findIndex(c => c.id === id)
      if (index !== -1) {
        const newStatus = this.courses[index].status === 'online' ? 'offline' : 'online'
        this.courses[index].status = newStatus
        return newStatus
      }
      return 'offline'
    },

    // ==================== 会员相关操作 ====================
    setMembers(members: Member[]): void {
      this.members = members
    },

    // ==================== 购课记录相关操作 ====================
    setPurchaseRecords(records: PurchaseRecord[]): void {
      this.purchaseRecords = records
    },

    addPurchaseRecord(record: PurchaseRecord): void {
      this.purchaseRecords.unshift(record)
    },

    // ==================== 约课记录相关操作 ====================
    setBookings(bookings: Booking[]): void {
      this.bookings = bookings
    },

    addBooking(booking: Booking): void {
      this.bookings.unshift(booking)
    },

    updateBooking(booking: Booking): void {
      const index = this.bookings.findIndex(b => b.id === booking.id)
      if (index !== -1) {
        this.bookings[index] = booking
      }
    },

    updateBookingStatus(id: string, status: BookingStatus): void {
      const index = this.bookings.findIndex(b => b.id === id)
      if (index !== -1) {
        this.bookings[index].status = status
      }
    },

    // 检查约课时段冲突
    checkBookingConflict(formData: BookingForm): boolean {
      const existingBookings = this.bookings.filter(
        booking => booking.coachId === formData.coachId &&
                   booking.date === formData.date &&
                   booking.timeSlot === formData.timeSlot &&
                   booking.status === 'booked'
      )
      return existingBookings.length > 0
    },

    // ==================== 排班相关操作 ====================
    setSchedules(schedules: Schedule[]): void {
      this.schedules = schedules
    },

    // ==================== 分页相关操作 ====================
    setCoachPagination(page: number, pageSize: number): void {
      this.pagination.coach = { page, pageSize }
    },

    setCoursePagination(page: number, pageSize: number): void {
      this.pagination.course = { page, pageSize }
    },

    setMemberPagination(page: number, pageSize: number): void {
      this.pagination.member = { page, pageSize }
    },

    setBookingPagination(page: number, pageSize: number): void {
      this.pagination.booking = { page, pageSize }
    },

    // ==================== 加载状态相关操作 ====================
    setLoading(key: string, value: boolean): void {
      if (key in this.loading) {
        (this.loading as Record<string, boolean>)[key] = value
      }
    },

    setGlobalLoading(value: boolean): void {
      this.loading.global = value
    },

    // ==================== 批量操作 ====================
    async loadInitialData(): Promise<void> {
      this.setGlobalLoading(true)
      try {
        // 模拟 API 延迟
        await new Promise(resolve => setTimeout(resolve, 500))
      } finally {
        this.setGlobalLoading(false)
      }
    }
  },

  persist: true
})
