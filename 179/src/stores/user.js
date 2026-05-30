import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const users = ref([...mockUsers])
  const loading = ref(false)

  const isLoggedIn = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || 'guest')
  const userInfo = computed(() => currentUser.value)

  const login = async (username, password) => {
    loading.value = true
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.value.find(
          u => u.username === username && u.password === password
        )
        if (user) {
          currentUser.value = { ...user }
          localStorage.setItem('currentUser', JSON.stringify(user))
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
        loading.value = false
      }, 500)
    })
  }

  const register = async (userData) => {
    loading.value = true
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = users.value.find(u => u.username === userData.username)
        if (exists) {
          reject(new Error('用户名已存在'))
          loading.value = false
          return
        }
        const newUser = {
          id: Date.now(),
          ...userData,
          role: userData.role || 'user',
          avatar: userData.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
          createdAt: new Date().toISOString()
        }
        users.value.push(newUser)
        currentUser.value = { ...newUser }
        localStorage.setItem('currentUser', JSON.stringify(newUser))
        resolve(newUser)
        loading.value = false
      }, 500)
    })
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const checkAuth = () => {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  }

  const updateUserInfo = (userData) => {
    if (!currentUser.value) return false
    
    const index = users.value.findIndex(u => u.id === currentUser.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...userData }
      currentUser.value = { ...users.value[index] }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return true
    }
    return false
  }

  const changePassword = (oldPassword, newPassword) => {
    if (!currentUser.value) {
      return { success: false, message: '请先登录' }
    }
    
    if (currentUser.value.password !== oldPassword) {
      return { success: false, message: '原密码错误' }
    }
    
    const index = users.value.findIndex(u => u.id === currentUser.value.id)
    if (index !== -1) {
      users.value[index].password = newPassword
      currentUser.value.password = newPassword
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return { success: true, message: '密码修改成功' }
    }
    return { success: false, message: '修改失败' }
  }

  return {
    currentUser,
    users,
    loading,
    isLoggedIn,
    userRole,
    userInfo,
    login,
    register,
    logout,
    checkAuth,
    updateUserInfo,
    changePassword
  }
})
