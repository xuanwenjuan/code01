import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/data/mockData'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!currentUser.value)
  const isBlogger = computed(() => currentUser.value?.role === 'blogger')

  const login = async (username, password) => {
    loading.value = true
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          const { password: _, ...userInfo } = user
          currentUser.value = userInfo
          localStorage.setItem('user', JSON.stringify(userInfo))
          resolve(userInfo)
        } else {
          reject(new Error('用户名或密码错误'))
        }
        loading.value = false
      }, 800)
    })
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('user')
  }

  const checkLogin = () => {
    const saved = localStorage.getItem('user')
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  }

  return {
    currentUser,
    loading,
    isLoggedIn,
    isBlogger,
    login,
    logout,
    checkLogin
  }
})
