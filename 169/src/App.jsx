import React, { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout, Spin, FloatButton } from 'antd'
import AppHeader from './components/Layout/Header'
import AppFooter from './components/Layout/Footer'
import NewUserModal from './components/Common/NewUserModal'
import ProtectedRoute from './components/Common/ProtectedRoute'
import routes from './router'

const { Content } = Layout

const App = () => {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [showNewUserModal, setShowNewUserModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [location.pathname])

  useEffect(() => {
    const visited = localStorage.getItem('visited')
    if (!visited) {
      const timer = setTimeout(() => {
        setShowNewUserModal(true)
        localStorage.setItem('visited', 'true')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <Layout className="app-layout">
      {!isAuthPage && <AppHeader />}
      <Content className="app-content">
        {loading ? (
          <div className="page-loading">
            <Spin size="large" />
          </div>
        ) : (
          <Routes>
            {routes.map((route) => {
              if (route.protected) {
                return (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      <ProtectedRoute role={route.role}>
                        <route.element />
                      </ProtectedRoute>
                    }
                  />
                )
              }
              return (
                <Route key={route.path} path={route.path} element={<route.element />} />
              )
            })}
          </Routes>
        )}
      </Content>
      {!isAuthPage && <AppFooter />}
      <NewUserModal open={showNewUserModal} onClose={() => setShowNewUserModal(false)} />
      <FloatButton.BackTop />
    </Layout>
  )
}

export default App
