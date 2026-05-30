import { useSelector, useDispatch } from 'react-redux'
import { login, register, logout, updateUser } from '@/store/slices/userSlice'
import { message } from 'antd'

export const useAuth = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector(state => state.user.currentUser)

  const handleLogin = async (values) => {
    try {
      dispatch(login(values))
      message.success('登录成功')
      return true
    } catch (error) {
      message.error(error.message || '登录失败')
      return false
    }
  }

  const handleRegister = async (values) => {
    try {
      dispatch(register(values))
      message.success('注册成功')
      return true
    } catch (error) {
      message.error('注册失败')
      return false
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    message.success('已退出登录')
  }

  const handleUpdateUser = (values) => {
    dispatch(updateUser(values))
    message.success('更新成功')
  }

  const isLoggedIn = !!currentUser
  const isMom = currentUser?.role === 'mom'
  const isNanny = currentUser?.role === 'nanny'

  return {
    currentUser,
    isLoggedIn,
    isMom,
    isNanny,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateUser
  }
}
