import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout, Result, Button } from 'antd'
import { useSelector } from 'react-redux'
import AppHeader from './components/Header'
import AppFooter from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import History from './pages/History'
import MyWorks from './pages/MyWorks'
import Notifications from './pages/Notifications'
import MaterialList from './pages/MaterialList'
import MaterialDetail from './pages/MaterialDetail'
import TutorialList from './pages/TutorialList'
import TutorialDetail from './pages/TutorialDetail'
import WorkList from './pages/WorkList'
import WorkDetail from './pages/WorkDetail'
import Admin from './pages/Admin'

const { Content } = Layout

const PrivateRoute = ({ children }) => {
  const currentUser = useSelector(state => state.user.currentUser)
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}

const AdminRoute = ({ children }) => {
  const currentUser = useSelector(state => state.user.currentUser)
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  if (currentUser.role !== 'admin') {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Content>
          <div className="container" style={{ padding: '60px 0' }}>
            <Result
              status="403"
              title="403"
              subTitle="抱歉，您没有权限访问该页面"
              extra={
                <Button type="primary" onClick={() => window.history.back()}>
                  返回上一页
                </Button>
              }
            />
          </div>
        </Content>
        <AppFooter />
      </Layout>
    )
  }
  return children
}

const App = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/materials" element={<MaterialList />} />
          <Route path="/material/:id" element={<MaterialDetail />} />
          <Route path="/tutorials" element={<TutorialList />} />
          <Route path="/tutorial/:id" element={<TutorialDetail />} />
          <Route path="/works" element={<WorkList />} />
          <Route path="/work/:id" element={<WorkDetail />} />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/favorites" element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          } />
          <Route path="/history" element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } />
          <Route path="/my-works" element={
            <PrivateRoute>
              <MyWorks />
            </PrivateRoute>
          } />
          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          
          <Route path="*" element={
            <div className="container" style={{ padding: '60px 0' }}>
              <Result
                status="404"
                title="404"
                subTitle="抱歉，您访问的页面不存在"
                extra={
                  <Button type="primary" href="/">
                    返回首页
                  </Button>
                }
              />
            </div>
          } />
        </Routes>
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default App
