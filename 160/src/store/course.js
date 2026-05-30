import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockCourses, mockCategories, mockBanners } from '@/mock/data'

export const useCourseStore = defineStore('course', () => {
  const courses = ref([...mockCourses])
  const categories = ref([...mockCategories])
  const banners = ref([...mockBanners])
  const loading = ref(false)

  const getCourseById = (id) => {
    return courses.value.find(c => c.id === parseInt(id))
  }

  const getCoursesByCategory = (categoryId) => {
    if (!categoryId) return courses.value
    return courses.value.filter(c => c.categoryId === parseInt(categoryId))
  }

  const getHotCourses = (limit = 8) => {
    return [...courses.value]
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, limit)
  }

  const getNewCourses = (limit = 8) => {
    return [...courses.value]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, limit)
  }

  const filterCourses = (filters) => {
    let result = [...courses.value]

    if (filters.categoryId) {
      result = result.filter(c => c.categoryId === parseInt(filters.categoryId))
    }

    if (filters.difficulty) {
      result = result.filter(c => c.difficulty === filters.difficulty)
    }

    if (filters.priceType) {
      if (filters.priceType === 'free') {
        result = result.filter(c => c.price === 0)
      } else if (filters.priceType === 'paid') {
        result = result.filter(c => c.price > 0)
      }
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'popular':
          result.sort((a, b) => b.studentCount - a.studentCount)
          break
        case 'newest':
          result.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          break
        case 'price-asc':
          result.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          result.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          result.sort((a, b) => b.rating - a.rating)
          break
      }
    }

    return result
  }

  const getLessonsByCourseId = (courseId) => {
    const course = getCourseById(courseId)
    return course ? course.lessons : []
  }

  const getReviewsByCourseId = (courseId) => {
    const course = getCourseById(courseId)
    return course ? course.reviews : []
  }

  return {
    courses,
    categories,
    banners,
    loading,
    getCourseById,
    getCoursesByCategory,
    getHotCourses,
    getNewCourses,
    filterCourses,
    getLessonsByCourseId,
    getReviewsByCourseId
  }
})
