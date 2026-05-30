import { useSelector, useDispatch } from 'react-redux'
import { login, logout, register, updateUser } from '@/store/slices/userSlice'
import { message } from 'antd'

export const useAuth = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.currentUser)
  const users = useSelector((state) => state.user.users)

  const handleLogin = (phone, password, role = 'user') => {
    if (!phone || !password) {
      message.error('请输入手机号和密码')
      return false
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      message.error('请输入正确的手机号')
      return false
    }

    const user = users.find((u) => u.phone === phone && u.password === password)
    if (user) {
      dispatch(login(user))
      message.success('登录成功')
      return true
    } else {
      message.error('手机号或密码错误')
      return false
    }
  }

  const handleRegister = (userInfo) => {
    const { phone, password, confirmPassword, name } = userInfo

    if (!phone || !password || !name) {
      message.error('请填写完整信息')
      return false
    }

    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      message.error('请输入正确的手机号')
      return false
    }

    if (password.length < 6) {
      message.error('密码长度不能少于6位')
      return false
    }

    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致')
      return false
    }

    const exists = users.find((u) => u.phone === phone)
    if (exists) {
      message.error('该手机号已注册')
      return false
    }

    const newUser = {
      id: Date.now(),
      phone,
      password,
      name,
      role: 'user',
      avatar: 'https://img.icons8.com/color/96/user-male-circle.png',
      createTime: new Date().toISOString()
    }

    dispatch(register(newUser))
    dispatch(login(newUser))
    message.success('注册成功')
    return true
  }

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
  }

  const handleUpdateUser = (info) => {
    dispatch(updateUser(info))
    message.success('更新成功')
  }

  const isAuthenticated = !!currentUser
  const isUser = currentUser?.role === 'user'
  const isTechnician = currentUser?.role === 'technician'

  return {
    currentUser,
    isAuthenticated,
    isUser,
    isTechnician,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateUser
  }
}
