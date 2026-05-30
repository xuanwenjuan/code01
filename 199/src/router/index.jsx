import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Layout } from 'antd'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import IncenseList from '@/pages/IncenseList'
import IncenseDetail from '@/pages/IncenseDetail'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'

const { Content } = Layout

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const currentUser = useSelector(state => state.user.currentUser)
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <PrivateRoute requireAdmin>
          <Admin />
        </PrivateRoute>
      } />
      <Route
        path="*"
        element={
          <Layout className="app-layout">
            <Header />
            <Content className="app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/incense" element={<IncenseList />} />
                <Route path="/incense/:id" element={<IncenseDetail />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Content>
            <Footer />
          </Layout>
        }
      />
    </Routes>
  )
}

export default AppRoutes
