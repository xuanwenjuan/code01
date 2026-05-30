import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const token = ref(localStorage.getItem('token') || '')
  
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  
  const login = (data) => {
    const mockUser = {
      id: 1,
      username: data.username,
      nickname: '宝妈小美',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20baby%20avatar%20cartoon%20style&image_size=square',
      phone: '138****8888',
      email: 'user@example.com',
      gender: 'female',
      birthday: '1995-06-15'
    }
    
    userInfo.value = mockUser
    token.value = 'mock-token-' + Date.now()
    
    localStorage.setItem('userInfo', JSON.stringify(mockUser))
    localStorage.setItem('token', token.value)
    
    return Promise.resolve(mockUser)
  }
  
  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
  }
  
  const updateUserInfo = (data) => {
    userInfo.value = { ...userInfo.value, ...data }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    return Promise.resolve(userInfo.value)
  }
  
  return {
    userInfo,
    token,
    isLoggedIn,
    login,
    logout,
    updateUserInfo
  }
})
