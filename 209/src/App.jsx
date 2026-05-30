import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Techniques from './pages/Techniques'
import Creation from './pages/Creation'
import KilnCulture from './pages/KilnCulture'
import AdminDashboard from './pages/admin/Dashboard'
import AdminWorks from './pages/admin/Works'
import AdminUsers from './pages/admin/Users'
import AdminTechniques from './pages/admin/Techniques'

function App() {
  const { user } = useSelector(state => state.auth)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="techniques" element={<Techniques />} />
        <Route path="creation" element={<Creation />} />
        <Route path="kiln-culture" element={<KilnCulture />} />
      </Route>

      {user?.role === 'admin' && (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="works" element={<AdminWorks />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="techniques" element={<AdminTechniques />} />
        </Route>
      )}

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default App
