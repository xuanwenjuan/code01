import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Spin } from 'antd'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import ServiceDetail from './pages/ServiceDetail'
import UserCenter from './pages/user/UserCenter'
import MyOrders from './pages/user/MyOrders'
import ContactRecords from './pages/user/ContactRecords'
import MasterCenter from './pages/master/MasterCenter'
import MasterOrders from './pages/master/MasterOrders'
import AuthRoute from './components/AuthRoute'
import NotFound from './pages/NotFound'
import { checkAuth } from './store/actions/userActions'

const App = () => {
  const dispatch = useDispatch()
  const { loading } = useSelector(state => state.user)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="service/:id" element={<ServiceDetail />} />
        <Route path="/user" element={
          <AuthRoute allowedRoles={['user']}>
            <UserCenter />
          </AuthRoute>
        }>
          <Route path="orders" element={<MyOrders />} />
          <Route path="contacts" element={<ContactRecords />} />
        </Route>
        <Route path="/master" element={
          <AuthRoute allowedRoles={['master']}>
            <MasterCenter />
          </AuthRoute>
        }>
          <Route path="orders" element={<MasterOrders />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
