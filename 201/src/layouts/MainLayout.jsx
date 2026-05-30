import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppHeader from '@/components/layout/AppHeader'
import AppFooter from '@/components/layout/AppFooter'

const { Content } = Layout

function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <AppHeader />
      <Content style={{ flex: 1 }}>
        <Outlet />
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default MainLayout
