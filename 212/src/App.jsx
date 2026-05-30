import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from '@/pages/Login'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from '@/pages/Dashboard'
import Tracking from '@/pages/Tracking'
import Management from '@/pages/Management'
import { selectCurrentUser } from '@/store/slices/userSlice'

function App() {
  const user = useSelector(selectCurrentUser)

  const ProtectedRoute = ({ children, requiredRole = null }) => {
    if (!user) {
      return <Navigate to="/login" replace />
    }
    if (requiredRole && user.role !== requiredRole) {
      if (user.role === 'admin') {
        return children
      }
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tracking" element={<Tracking />} />
        <Route
          path="management"
          element={
            <ProtectedRoute requiredRole="tracker">
              <Management />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
