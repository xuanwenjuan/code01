import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockLogin, mockUserInfo } from '@/mock/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('oa_token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('oa_userInfo') || 'null'))

  const isLogin = computed(() => !!token.value)

  const login = async (credentials) => {
    const res = await mockLogin(credentials)
    token.value = res.token
    userInfo.value = res.userInfo
    localStorage.setItem('oa_token', res.token)
    localStorage.setItem('oa_userInfo', JSON.stringify(res.userInfo))
    return res
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('oa_token')
    localStorage.removeItem('oa_userInfo')
  }

  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
    localStorage.setItem('oa_userInfo', JSON.stringify(userInfo.value))
  }

  return {
    token,
    userInfo,
    isLogin,
    login,
    logout,
    updateUserInfo
  }
})
