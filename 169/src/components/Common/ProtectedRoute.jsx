import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { message } from 'antd'

const ProtectedRoute = ({ children, role }) => {
  const location = useLocation()
  const currentUser = useSelector((state) => state.user.currentUser)

  if (!currentUser) {
    message.warning('请先登录')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && currentUser.role !== role && currentUser.role !== 'admin') {
    message.error('您没有权限访问该页面')
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
