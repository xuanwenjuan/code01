import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainLayout from '@/components/layout/MainLayout'
import Home from '@/pages/Home'
import ServiceList from '@/pages/ServiceList'
import ServiceDetail from '@/pages/ServiceDetail'
import Booking from '@/pages/Booking'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import MyOrders from '@/pages/MyOrders'
import MyPets from '@/pages/MyPets'
import MyFavorites from '@/pages/MyFavorites'
import OrderDetail from '@/pages/OrderDetail'
import NotFound from '@/pages/NotFound'

const PrivateRoute = ({ children, requireUserType = null }) => {
  const { isLoggedIn, userType } = useSelector((state) => state.user)
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  if (requireUserType && userType !== requireUserType) {
    return <Navigate to="/" replace />
  }
  
  return children
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<ServiceList />} />
          <Route path="service/:id" element={<ServiceDetail />} />
          <Route path="booking/:serviceId" element={
            <PrivateRoute>
              <Booking />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="orders" element={
            <PrivateRoute>
              <MyOrders />
            </PrivateRoute>
          } />
          <Route path="order/:id" element={
            <PrivateRoute>
              <OrderDetail />
            </PrivateRoute>
          } />
          <Route path="pets" element={
            <PrivateRoute>
              <MyPets />
            </PrivateRoute>
          } />
          <Route path="favorites" element={
            <PrivateRoute>
              <MyFavorites />
            </PrivateRoute>
          } />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
