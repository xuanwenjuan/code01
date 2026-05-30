import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { message } from 'antd'

const AuthRoute = ({ children, requiredRole = null }) => {
  const { isLoggedIn, isMom, isNanny } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    message.warning('请先登录')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'mom' && !isMom) {
    message.warning('该功能仅限宝妈用户使用')
    return <Navigate to="/" replace />
  }

  if (requiredRole === 'nanny' && !isNanny) {
    message.warning('该功能仅限母婴师用户使用')
    return <Navigate to="/" replace />
  }

  return children
}

export default AuthRoute
