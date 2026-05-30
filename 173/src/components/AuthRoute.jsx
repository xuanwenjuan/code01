import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spin, Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const AuthRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, role, loading } = useSelector(state => state.user)
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div style={{ padding: '100px 0' }}>
        <Result
          status="403"
          title="403"
          subTitle={`抱歉，您没有权限访问该页面。当前登录身份为${role === 'user' ? '普通用户' : '开锁师傅'}。`}
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  return children
}

export default AuthRoute
