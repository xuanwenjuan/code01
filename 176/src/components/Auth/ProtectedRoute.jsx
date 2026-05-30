import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { message } from 'antd'
import Loading from '../Common/Loading'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation()
  const { isLoggedIn, currentUser, loading } = useSelector((state) => state.user)

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading text="加载中..." />
      </div>
    )
  }

  if (!isLoggedIn) {
    message.warning('请先登录后再访问此页面')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    message.error('您没有权限访问此页面')
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
