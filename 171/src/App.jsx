import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout, Spin } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import UserCenter from './pages/UserCenter'
import CleanerCenter from './pages/CleanerCenter'
import NotFound from './pages/NotFound'
import { loadUserFromStorage } from '@/store/slices/userSlice'

const { Content } = Layout

function App() {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="正在加载..." />
      </div>
    )
  }

  return (
    <Layout className="app-layout">
      <AppHeader />
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cleaner/*"
            element={
              <ProtectedRoute allowedRoles={['cleaner']}>
                <CleanerCenter />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default App
