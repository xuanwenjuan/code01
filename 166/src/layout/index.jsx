import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout as AntLayout } from 'antd'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CommunitySelector from '@/components/CommunitySelector'
import './index.scss'

const { Content } = AntLayout

const Layout = () => {
  return (
    <AntLayout className="site-layout">
      <Header />
      <CommunitySelector />
      <Content className="site-content">
        <Outlet />
      </Content>
      <Footer />
    </AntLayout>
  )
}

export default Layout
