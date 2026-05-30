import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { loginStart, loginSuccess, loginFailure, logout, registerSuccess } from '@/store/slices/userSlice'
import { mockUsers } from '@/mock/data'

export function useAuth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userInfo, loading, error } = useSelector((state) => state.user)

  const login = async (username, password, role = 'user') => {
    dispatch(loginStart())
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (u) => u.username === username && u.password === password && u.role === role
        )
        if (user) {
          const { password: _, ...userData } = user
          dispatch(loginSuccess(userData))
          message.success('登录成功')
          resolve(userData)
        } else {
          const errorMsg = '用户名或密码错误'
          dispatch(loginFailure(errorMsg))
          message.error(errorMsg)
          reject(new Error(errorMsg))
        }
      }, 500)
    })
  }

  const register = async (userData) => {
    dispatch(loginStart())
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const existingUser = mockUsers.find((u) => u.username === userData.username)
        if (existingUser) {
          const errorMsg = '用户名已存在'
          dispatch(loginFailure(errorMsg))
          message.error(errorMsg)
          reject(new Error(errorMsg))
        } else {
          const newUser = {
            id: Date.now(),
            ...userData,
            role: userData.role || 'user',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
          }
          const { password: _, ...userInfo } = newUser
          dispatch(registerSuccess(userInfo))
          message.success('注册成功')
          resolve(userInfo)
        }
      }, 500)
    })
  }

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
    navigate('/home')
  }

  return {
    userInfo,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    isLoggedIn: !!userInfo,
    isUser: userInfo?.role === 'user',
    isMaster: userInfo?.role === 'master'
  }
}
