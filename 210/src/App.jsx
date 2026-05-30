import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { initUserFromStorage } from '@/store/slices/userSlice'
import MainLayout from '@/components/layout/MainLayout'
import Login from '@/pages/Login'
import Home from '@/pages/Home'
import Courses from '@/pages/Courses'
import CourseDetail from '@/pages/CourseDetail'
import MyCourses from '@/pages/learning/MyCourses'
import Statistics from '@/pages/learning/Statistics'
import Certificates from '@/pages/learning/Certificates'
import Dashboard from '@/pages/admin/Dashboard'
import CourseManagement from '@/pages/admin/CourseManagement'
import UserManagement from '@/pages/admin/UserManagement'
import LearningManagement from '@/pages/admin/LearningManagement'
import PageLoading from '@/components/common/PageLoading'

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { currentUser, loading } = useSelector((state) => state.user)

  if (loading) {
    return <PageLoading />
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && currentUser.role !== 'admin') {
    return <Navigate to="/home" replace />
  }

  return children
}

const App = () => {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)

  useEffect(() => {
    dispatch(initUserFromStorage())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/learning/my-courses" element={<MyCourses />} />
        <Route path="/learning/statistics" element={<Statistics />} />
        <Route path="/learning/certificates" element={<Certificates />} />
      </Route>

      <Route
        element={
          <PrivateRoute requireAdmin>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/courses" element={<CourseManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>

      <Route
        path="/"
        element={
          currentUser ? (
            <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/home'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
