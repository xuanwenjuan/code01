import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login/index.jsx'
import Layout from './components/Layout/index.jsx'
import Dashboard from './pages/Dashboard/index.jsx'
import OrderDispatch from './pages/OrderDispatch/index.jsx'
import OrderManagement from './pages/OrderManagement/index.jsx'

const PrivateRoute = ({ children, requiredRole }) => {
  const { isLoggedIn, userInfo } = useSelector(state => state.auth)
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && userInfo?.role !== requiredRole && userInfo?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dispatch" element={<OrderDispatch />} />
          <Route path="orders" element={<OrderManagement />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
