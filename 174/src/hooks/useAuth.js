import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, logout, updateUser } from '@/store/slices/userSlice'
import { loginApi } from '@/mock/api'
import { message } from 'antd'

const useAuth = () => {
  const dispatch = useDispatch()
  const userInfo = useSelector(state => state.user.userInfo)
  
  const handleLogin = useCallback(async (username, password, role) => {
    const result = await loginApi(username, password, role)
    if (result.success) {
      dispatch(login(result.data))
      message.success('登录成功')
      return true
    } else {
      message.error(result.message || '登录失败')
      return false
    }
  }, [dispatch])
  
  const handleLogout = useCallback(() => {
    dispatch(logout())
    message.success('已退出登录')
  }, [dispatch])
  
  const updateProfile = useCallback((data) => {
    dispatch(updateUser(data))
    message.success('更新成功')
  }, [dispatch])
  
  return {
    userInfo,
    isLoggedIn: !!userInfo,
    login: handleLogin,
    logout: handleLogout,
    updateProfile
  }
}

export default useAuth
