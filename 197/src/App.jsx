import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Category from './pages/Category'
import Search from './pages/Search'
import HeritageDetail from './pages/HeritageDetail'
import TopicDetail from './pages/TopicDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

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
    <Layout className="page-container">
      <Header />
      <Content className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/search" element={<Search />} />
          <Route path="/heritage/:id" element={<HeritageDetail />} />
          <Route path="/topic/:id" element={<TopicDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  )
}

export default App
