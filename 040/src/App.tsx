import React, { useState } from 'react'
import { Layout, Menu, Typography, Space, Button, Badge, Drawer } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import DeviceManagement from './pages/DeviceManagement'
import EnergyMonitor from './pages/EnergyMonitor'
import OperationLogs from './pages/OperationLogs'
import { StatisticsCards } from './components/StatisticsCards'
import { useDataStore } from './store/dataStore'
import './App.css'

dayjs.locale('zh-cn')

const { Header, Sider, Content } = Layout
const { Title } = Typography

type MenuKey = 'dashboard' | 'devices' | 'energy' | 'logs'

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [activeKey, setActiveKey] = useState<MenuKey>('dashboard')
  const { statistics, alerts } = useDataStore()

  const activeAlerts = alerts.filter(a => a.status === 'active').length

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '总览大屏',
    },
    {
      key: 'devices',
      icon: <AppstoreOutlined />,
      label: '设备管理',
    },
    {
      key: 'energy',
      icon: <ThunderboltOutlined />,
      label: '能耗监控',
    },
    {
      key: 'logs',
      icon: <FileTextOutlined />,
      label: '操作履历',
    },
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setActiveKey(e.key as MenuKey)
    setMobileMenuVisible(false)
  }

  const renderContent = () => {
    switch (activeKey) {
      case 'dashboard':
        return (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <StatisticsCards statistics={statistics} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <EnergyMonitor />
              </div>
            </div>
          </Space>
        )
      case 'devices':
        return <DeviceManagement />
      case 'energy':
        return <EnergyMonitor />
      case 'logs':
        return <OperationLogs />
      default:
        return <StatisticsCards statistics={statistics} />
    }
  }

  const siderContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
        }}
      >
        <Space>
          <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          {!collapsed && (
            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
              智慧园区
            </Title>
          )}
        </Space>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        selectedKeys={[activeKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ flex: 1, borderRight: 0 }}
      />
    </div>
  )

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            if (broken) setCollapsed(true)
          }}
          width={220}
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {siderContent}
        </Sider>

        <Drawer
          title="菜单"
          placement="left"
          closable={true}
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={220}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Drawer>

        <Layout>
          <Header
            style={{
              padding: '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Space>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {menuItems.find(item => item?.key === activeKey)?.label as string}
              </Title>
            </Space>

            <Space>
              <Badge count={activeAlerts} offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => setActiveKey('energy')}
                />
              </Badge>
              <Button
                type="text"
                icon={<AppstoreOutlined />}
                onClick={() => setMobileMenuVisible(true)}
                style={{ display: 'none' }}
              />
            </Space>
          </Header>

          <Content
            style={{
              margin: '16px',
              padding: '16px',
              minHeight: 280,
              background: '#f5f5f5',
              overflow: 'auto',
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
