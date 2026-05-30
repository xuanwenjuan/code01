import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login, register, logout, loadUserFromStorage, clearError } from '@/store/slices/userSlice'

export function useAuth() {
  const dispatch = useDispatch()
  const { currentUser, error, loading } = useSelector((state) => state.user)

  const isAuthenticated = useMemo(() => !!currentUser, [currentUser])
  const userRole = useMemo(() => currentUser?.role, [currentUser])

  const handleLogin = (values) => {
    dispatch(login(values))
  }

  const handleRegister = (values) => {
    dispatch(register(values))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const loadUser = () => {
    dispatch(loadUserFromStorage())
  }

  const clearUserError = () => {
    dispatch(clearError())
  }

  return {
    currentUser,
    isAuthenticated,
    userRole,
    error,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loadUser,
    clearError: clearUserError,
  }
}
