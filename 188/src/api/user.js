import { mockUsers } from '@/mock/data'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const loginApi = async (loginForm) => {
  await delay(500)
  const user = mockUsers.find(
    u => u.username === loginForm.username && u.password === loginForm.password
  )
  if (user) {
    const { password, ...userInfo } = user
    return {
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_token_' + Date.now(),
        role: user.role,
        userInfo
      }
    }
  }
  return {
    code: 401,
    message: '用户名或密码错误',
    data: null
  }
}

export const registerApi = async (registerForm) => {
  await delay(500)
  const exists = mockUsers.find(u => u.username === registerForm.username)
  if (exists) {
    return {
      code: 400,
      message: '用户名已存在',
      data: null
    }
  }
  const newUser = {
    id: mockUsers.length + 1,
    username: registerForm.username,
    password: registerForm.password,
    role: registerForm.role,
    name: registerForm.name,
    phone: registerForm.phone,
    email: registerForm.email,
    company: registerForm.company,
    address: registerForm.address,
    avatar: '',
    createTime: new Date().toISOString().split('T')[0]
  }
  mockUsers.push(newUser)
  return {
    code: 200,
    message: '注册成功',
    data: null
  }
}

export const getUserInfoApi = async () => {
  await delay(200)
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    return {
      code: 200,
      message: 'success',
      data: JSON.parse(stored)
    }
  }
  return {
    code: 401,
    message: '未登录',
    data: null
  }
}
