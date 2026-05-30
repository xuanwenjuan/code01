import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import routes from './index'
import Loading from '@/components/Loading'

function findRoute(pathname, routes, parentPath = '') {
  for (const route of routes) {
    const fullPath = parentPath + route.path
    if (fullPath === pathname || (route.path === '*' && pathname === '/')) {
      return route
    }
    if (route.children) {
      const found = findRoute(pathname, route.children, fullPath.replace('/*', ''))
      if (found) return found
    }
  }
  return null
}

function AuthRoute({ children, userInfo }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const route = findRoute(location.pathname, routes)
    if (!route) {
      setIsChecking(false)
      return
    }

    const { requiresAuth, roles, title } = route.meta || {}

    if (title) {
      document.title = `${title} - 同城管道疏通`
    }

    if (requiresAuth && !userInfo) {
      message.warning('请先登录后再访问该页面')
      navigate('/login', { replace: true, state: { from: location.pathname } })
      setIsChecking(false)
      return
    }

    if (roles && userInfo && !roles.includes(userInfo.role)) {
      message.error('您没有权限访问该页面')
      navigate('/home', { replace: true })
      setIsChecking(false)
      return
    }

    setIsChecking(false)
  }, [location.pathname, userInfo, navigate])

  if (isChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading tip="正在验证权限..." />
      </div>
    )
  }

  return children
}

export default AuthRoute
