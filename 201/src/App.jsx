import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import MainLayout from '@/layouts/MainLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Loading from '@/components/common/Loading'
import ProtectedRoute from '@/components/common/ProtectedRoute'

const Home = lazy(() => import('@/pages/Home'))
const PigmentDetail = lazy(() => import('@/pages/PigmentDetail'))
const Login = lazy(() => import('@/pages/Login'))
const Profile = lazy(() => import('@/pages/Profile'))
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminPigments = lazy(() => import('@/pages/admin/Pigments'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const { Content } = Layout

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="pigment/:id" element={<PigmentDetail />} />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="pigments" element={<AdminPigments />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
