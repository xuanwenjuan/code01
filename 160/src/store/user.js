import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUser, mockOrders, mockFavorites, mockLearningRecords } from '@/mock/data'

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  ORDERS: 'user_orders',
  FAVORITES: 'user_favorites',
  LEARNING_RECORDS: 'user_learning_records'
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem(STORAGE_KEYS.TOKEN) || '')
  const orders = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'))
  const favorites = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]'))
  const learningRecords = ref(JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_RECORDS) || '[]'))

  const isLoggedIn = computed(() => !!token.value)

  const persistOrders = () => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders.value))
  }

  const persistFavorites = () => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites.value))
  }

  const persistLearningRecords = () => {
    localStorage.setItem(STORAGE_KEYS.LEARNING_RECORDS, JSON.stringify(learningRecords.value))
  }

  const login = (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === '123456') {
          userInfo.value = mockUser
          token.value = 'mock-token-' + Date.now()
          localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
          localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(mockUser))
          
          if (orders.value.length === 0) {
            orders.value = [...mockOrders]
            persistOrders()
          }
          if (favorites.value.length === 0) {
            favorites.value = [...mockFavorites]
            persistFavorites()
          }
          if (learningRecords.value.length === 0) {
            learningRecords.value = [...mockLearningRecords]
            persistLearningRecords()
          }
          
          resolve({ success: true, user: mockUser })
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  const register = (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...mockUser,
          ...userData,
          id: Date.now()
        }
        userInfo.value = newUser
        token.value = 'mock-token-' + Date.now()
        localStorage.setItem(STORAGE_KEYS.TOKEN, token.value)
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(newUser))
        orders.value = []
        favorites.value = []
        learningRecords.value = []
        persistOrders()
        persistFavorites()
        persistLearningRecords()
        resolve({ success: true, user: newUser })
      }, 500)
    })
  }

  const logout = () => {
    userInfo.value = null
    token.value = ''
    orders.value = []
    favorites.value = []
    learningRecords.value = []
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
    localStorage.removeItem(STORAGE_KEYS.ORDERS)
    localStorage.removeItem(STORAGE_KEYS.FAVORITES)
    localStorage.removeItem(STORAGE_KEYS.LEARNING_RECORDS)
  }

  const checkAuth = () => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER_INFO)
    if (token.value && savedUser) {
      userInfo.value = JSON.parse(savedUser)
      return true
    }
    return false
  }

  const updateUserInfo = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        userInfo.value = { ...userInfo.value, ...data }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
        resolve({ success: true })
      }, 500)
    })
  }

  const changePassword = (oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (oldPassword === '123456') {
          resolve({ success: true })
        } else {
          reject(new Error('原密码错误'))
        }
      }, 500)
    })
  }

  const toggleFavorite = (courseId) => {
    const index = favorites.value.findIndex(f => f.courseId === courseId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      persistFavorites()
      return false
    } else {
      favorites.value.unshift({
        id: Date.now(),
        courseId,
        addTime: new Date().toISOString()
      })
      persistFavorites()
      return true
    }
  }

  const isFavorite = (courseId) => {
    return favorites.value.some(f => f.courseId === courseId)
  }

  const buyCourse = (course) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const order = {
          id: Date.now(),
          courseId: course.id,
          courseName: course.name,
          courseCover: course.cover,
          price: course.price,
          status: 'paid',
          createTime: new Date().toISOString(),
          payTime: new Date().toISOString()
        }
        orders.value.unshift(order)
        persistOrders()
        resolve({ success: true, order })
      }, 500)
    })
  }

  const hasPurchased = (courseId) => {
    return orders.value.some(o => o.courseId === courseId && o.status === 'paid')
  }

  const updateLearningProgress = (courseId, lessonId, progress) => {
    const record = learningRecords.value.find(r => r.courseId === courseId)
    if (record) {
      record.progress = progress
      record.lastLessonId = lessonId
      record.lastStudyTime = new Date().toISOString()
    } else {
      learningRecords.value.unshift({
        id: Date.now(),
        courseId,
        progress,
        lastLessonId: lessonId,
        lastStudyTime: new Date().toISOString()
      })
    }
    persistLearningRecords()
  }

  return {
    userInfo,
    token,
    orders,
    favorites,
    learningRecords,
    isLoggedIn,
    login,
    register,
    logout,
    checkAuth,
    updateUserInfo,
    changePassword,
    toggleFavorite,
    isFavorite,
    buyCourse,
    hasPurchased,
    updateLearningProgress
  }
})
