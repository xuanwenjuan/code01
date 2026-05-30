import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const userList = ref(users)

  const isLoggedIn = computed(() => !!currentUser.value)
  const isBuyer = computed(() => currentUser.value?.role === 'buyer')
  const isSupplier = computed(() => currentUser.value?.role === 'supplier')

  const login = (username, password) => {
    const user = userList.value.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      currentUser.value = { ...user }
      localStorage.setItem('currentUser', JSON.stringify(user))
      return true
    }
    return false
  }

  const register = (userData) => {
    const exists = userList.value.find(u => u.username === userData.username)
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: userList.value.length + 1,
      ...userData,
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
    userList.value.push(newUser)
    return { success: true, message: '注册成功' }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const initUser = () => {
    const saved = localStorage.getItem('currentUser')
    if (saved) {
      currentUser.value = JSON.parse(saved)
    }
  }

  const updateUser = (userData) => {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...userData }
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
  }

  return {
    currentUser,
    userList,
    isLoggedIn,
    isBuyer,
    isSupplier,
    login,
    register,
    logout,
    initUser,
    updateUser
  }
})
