import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, registerApi, getUserInfoApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const userRole = ref(localStorage.getItem('userRole') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isSupplier = computed(() => userRole.value === 'supplier')
  const isBuyer = computed(() => userRole.value === 'buyer')

  const login = async (loginForm) => {
    const res = await loginApi(loginForm)
    if (res.code === 200) {
      token.value = res.data.token
      userRole.value = res.data.role
      userInfo.value = res.data.userInfo
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userRole', res.data.role)
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo))
    }
    return res
  }

  const register = async (registerForm) => {
    const res = await registerApi(registerForm)
    return res
  }

  const logout = () => {
    token.value = ''
    userRole.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
  }

  const getUserInfo = async () => {
    if (!userInfo.value && token.value) {
      const stored = localStorage.getItem('userInfo')
      if (stored) {
        userInfo.value = JSON.parse(stored)
      } else {
        const res = await getUserInfoApi()
        if (res.code === 200) {
          userInfo.value = res.data
        }
      }
    }
    return userInfo.value
  }

  return {
    userInfo,
    token,
    userRole,
    isLoggedIn,
    isSupplier,
    isBuyer,
    login,
    register,
    logout,
    getUserInfo
  }
})
