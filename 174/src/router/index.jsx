import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthRoute from './AuthRoute'
import AppLayout from '@/components/Layout'
import Home from '@/pages/Home'
import ServiceDetail from '@/pages/ServiceDetail'
import Login from '@/pages/Login'
import UserCenter from '@/pages/UserCenter'
import MyOrders from '@/pages/UserCenter/MyOrders'
import MyReviews from '@/pages/UserCenter/MyReviews'
import WorkerCenter from '@/pages/WorkerCenter'
import WorkerOrders from '@/pages/WorkerCenter/WorkerOrders'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="service/:id" element={<ServiceDetail />} />
        
        <Route path="user" element={
          <AuthRoute allowedRoles={['user']}>
            <UserCenter />
          </AuthRoute>
        }>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="reviews" element={<MyReviews />} />
        </Route>
        
        <Route path="worker" element={
          <AuthRoute allowedRoles={['worker']}>
            <WorkerCenter />
          </AuthRoute>
        }>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<WorkerOrders />} />
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
