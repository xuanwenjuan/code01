import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, logout, updateUserInfo, setLoginModalVisible } from '@/store/slices/userSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { userInfo, token, role, isLoginModalVisible } = useSelector(state => state.user)

  const handleLogin = useCallback((formValues) => {
    const mockUserInfo = {
      id: 1,
      username: formValues.username,
      nickname: '同城用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      phone: formValues.phone || '138****8000',
      email: 'user@example.com'
    }
    dispatch(login({
      userInfo: mockUserInfo,
      token: 'mock-token-' + Date.now(),
      role: formValues.role || 'user'
    }))
    return Promise.resolve()
  }, [dispatch])

  const handleLogout = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  const handleUpdateUserInfo = useCallback((data) => {
    dispatch(updateUserInfo(data))
  }, [dispatch])

  const openLoginModal = useCallback(() => {
    dispatch(setLoginModalVisible(true))
  }, [dispatch])

  const closeLoginModal = useCallback(() => {
    dispatch(setLoginModalVisible(false))
  }, [dispatch])

  return {
    userInfo,
    token,
    role,
    isLogin: !!token,
    isLoginModalVisible,
    login: handleLogin,
    logout: handleLogout,
    updateUserInfo: handleUpdateUserInfo,
    openLoginModal,
    closeLoginModal
  }
}
