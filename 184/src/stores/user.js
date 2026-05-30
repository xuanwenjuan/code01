import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { users } from '@/mock/data'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isBuyer = computed(() => currentUser.value?.role === 'buyer')
  const isSupplier = computed(() => currentUser.value?.role === 'supplier')

  function login(username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.username === username && u.password === password)
        if (user) {
          currentUser.value = { ...user }
          token.value = `token_${user.id}_${Date.now()}`
          localStorage.setItem('token', token.value)
          localStorage.setItem('user', JSON.stringify(user))
          resolve(user)
        } else {
          reject(new Error('用户名或密码错误'))
        }
      }, 500)
    })
  }

  function logout() {
    currentUser.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function checkAuth() {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    if (savedUser && savedToken) {
      currentUser.value = JSON.parse(savedUser)
      token.value = savedToken
      return true
    }
    return false
  }

  function updateProfile(data) {
    if (currentUser.value) {
      currentUser.value = { ...currentUser.value, ...data }
      localStorage.setItem('user', JSON.stringify(currentUser.value))
    }
  }

  function updatePassword(newPassword) {
    if (currentUser.value) {
      currentUser.value.password = newPassword
      localStorage.setItem('user', JSON.stringify(currentUser.value))
    }
  }

  return {
    currentUser,
    token,
    isLoggedIn,
    isBuyer,
    isSupplier,
    login,
    logout,
    checkAuth,
    updateProfile,
    updatePassword
  }
})
