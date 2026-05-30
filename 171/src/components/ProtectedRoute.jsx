import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Spin, Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, loading } = useSelector((state) => state.user)

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <Spin size="large" tip="加载中..." />
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="page-container">
        <Result
          status="warning"
          title="请先登录"
          subTitle="您需要登录后才能访问此页面"
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login', { state: { from: location.pathname } })}>
              去登录
            </Button>,
            <Button key="home" onClick={() => navigate('/')}>
              返回首页
            </Button>,
          ]}
        />
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const redirectPath = currentUser.role === 'cleaner' ? '/cleaner' : '/user'
    return (
      <div className="page-container">
        <Result
          status="403"
          title="无权限访问"
          subTitle={`您当前是${currentUser.role === 'cleaner' ? '保洁师' : '普通用户'}账号，无法访问此页面`}
          extra={
            <Button type="primary" onClick={() => navigate(redirectPath)}>
              返回{currentUser.role === 'cleaner' ? '保洁师中心' : '个人中心'}
            </Button>
          }
        />
      </div>
    )
  }

  return children
}

export default ProtectedRoute
