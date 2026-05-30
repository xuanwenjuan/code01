import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import MortiseDetail from '@/pages/MortiseDetail'
import Profile from '@/pages/Profile'
import Admin from '@/pages/Admin'
import NotFound from '@/pages/NotFound'

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="mortise/:id" element={<MortiseDetail />} />
        <Route path="profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="admin" element={
          <PrivateRoute requireAdmin={true}>
            <Admin />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
