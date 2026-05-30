import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/Header'
import AppFooter from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorState from './components/ErrorState'
import Home from './pages/Home'
import Skills from './pages/Skills'
import SkillDetail from './pages/SkillDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'

const { Content } = Layout

const App = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skill/:id" element={<SkillDetail />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/403" element={<ErrorState status="403" />} />
          <Route path="*" element={<ErrorState status="404" />} />
        </Routes>
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default App
