import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import Header from '@/components/Layout/Header'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import TutorialsList from '@/pages/Tutorials/List'
import TutorialDetail from '@/pages/Tutorials/Detail'
import WorksList from '@/pages/Works/List'
import WorkDetail from '@/pages/Works/Detail'
import Creation from '@/pages/Creation'
import Admin from '@/pages/Admin'
import Profile from '@/pages/Profile'

const { Content } = Layout

const App = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutorials" element={<TutorialsList />} />
          <Route path="/tutorials/:id" element={<TutorialDetail />} />
          <Route path="/works" element={<WorksList />} />
          <Route path="/works/:id" element={<WorkDetail />} />
          <Route path="/creation" element={<Creation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App
