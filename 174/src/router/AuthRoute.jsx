import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { message } from 'antd'

const AuthRoute = ({ children, allowedRoles }) => {
  const location = useLocation()
  const { userInfo } = useSelector(state => state.user)
  
  useEffect(() => {
    if (!userInfo && location.pathname !== '/login') {
      message.warning('请先登录后再访问该页面')
    }
  }, [userInfo, location.pathname])
  
  if (!userInfo) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location, message: '请先登录后再访问该页面' }} 
        replace 
      />
    )
  }
  
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    const roleText = userInfo.role === 'worker' ? '师傅' : '普通用户'
    message.warning(`当前为${roleText}账号，无权限访问该页面`)
    
    if (userInfo.role === 'worker') {
      return <Navigate to="/worker/orders" replace />
    }
    return <Navigate to="/" replace />
  }
  
  return children
}

export default AuthRoute
