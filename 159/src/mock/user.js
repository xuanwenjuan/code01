import { delay } from '@/utils/request'

const users = [
  {
    id: 1,
    username: 'admin',
    password: '123456',
    name: '张小明',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    email: 'admin@company.com',
    phone: '13800138000',
    department: '技术部',
    position: '技术总监',
    role: 'admin',
    entryDate: '2020-01-15'
  },
  {
    id: 2,
    username: 'zhangsan',
    password: '123456',
    name: '张三',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    email: 'zhangsan@company.com',
    phone: '13800138001',
    department: '技术部',
    position: '前端开发工程师',
    role: 'user',
    entryDate: '2021-03-20'
  }
]

export const mockLogin = async (credentials) => {
  await delay(800)
  const user = users.find(
    u => u.username === credentials.username && u.password === credentials.password
  )
  if (!user) {
    throw new Error('用户名或密码错误')
  }
  const { password, ...userInfo } = user
  return {
    token: 'mock_token_' + Date.now(),
    userInfo
  }
}

export const mockUserInfo = async () => {
  await delay(300)
  return users[0]
}

export const mockUpdateUserInfo = async (info) => {
  await delay(500)
  return { success: true, message: '更新成功' }
}

export const mockUpdatePassword = async (data) => {
  await delay(500)
  if (data.oldPassword !== '123456') {
    throw new Error('原密码错误')
  }
  return { success: true, message: '密码修改成功' }
}
