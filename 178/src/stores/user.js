import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '@/mock/users'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
  const isLoggedIn = ref(!!localStorage.getItem('user'))
  const users = ref(mockUsers)

  const userRole = computed(() => user.value.role || 'guest')

  const login = (username, password) => {
    const foundUser = users.value.find(
      u => u.username === username && u.password === password
    )
    
    if (foundUser) {
      const userData = {
        id: foundUser.id,
        username: foundUser.username,
        nickname: foundUser.nickname,
        email: foundUser.email,
        phone: foundUser.phone,
        avatar: foundUser.avatar,
        role: foundUser.role,
        isLoggedIn: true
      }
      user.value = userData
      isLoggedIn.value = true
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true, message: '登录成功' }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const register = (userInfo) => {
    const exists = users.value.find(u => u.username === userInfo.username)
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }
    
    const newUser = {
      id: Date.now(),
      ...userInfo,
      role: 'user',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      createdAt: new Date().toISOString()
    }
    users.value.push(newUser)
    
    const userData = {
      id: newUser.id,
      username: newUser.username,
      nickname: newUser.nickname,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      role: newUser.role,
      isLoggedIn: true
    }
    user.value = userData
    isLoggedIn.value = true
    localStorage.setItem('user', JSON.stringify(userData))
    
    return { success: true, message: '注册成功' }
  }

  const logout = () => {
    user.value = {}
    isLoggedIn.value = false
    localStorage.removeItem('user')
  }

  const updateUserInfo = (info) => {
    user.value = { ...user.value, ...info }
    localStorage.setItem('user', JSON.stringify(user.value))
    return { success: true, message: '信息更新成功' }
  }

  return {
    user,
    isLoggedIn,
    users,
    userRole,
    login,
    register,
    logout,
    updateUserInfo
  }
})
