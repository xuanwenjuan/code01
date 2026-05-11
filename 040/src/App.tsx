import React, { useState, useEffect, useCallback } from 'react'
import { Layout, Menu, Typography, Space, Button, Badge, Drawer, Tooltip } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
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
import { RESPONSIVE_BREAKPOINTS } from './constants'
import './App.css'

dayjs.locale('zh-cn')

const { Header, Sider, Content } = Layout
const { Title } = Typography

type MenuKey = 'dashboard' | 'devices' | 'energy' | 'logs'

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLarge: boolean
  isFullscreen: boolean
}

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [activeKey, setActiveKey] = useState<MenuKey>('dashboard')
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLarge: false,
    isFullscreen: false,
  })
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'))
  const { statistics, alerts, updateStatistics } = useDataStore()

  const activeAlerts = alerts.filter((a) => a.status === 'active').length

  const handleResize = useCallback(() => {
    const width = window.innerWidth
    setResponsiveState({
      isMobile: width < RESPONSIVE_BREAKPOINTS.tablet,
      isTablet: width >= RESPONSIVE_BREAKPOINTS.tablet && width < RESPONSIVE_BREAKPOINTS.desktop,
      isDesktop: width >= RESPONSIVE_BREAKPOINTS.desktop,
      isLarge: width >= RESPONSIVE_BREAKPOINTS.large,
      isFullscreen: document.fullscreenElement !== null,
    })

    if (width < RESPONSIVE_BREAKPOINTS.desktop) {
      setCollapsed(true)
    }
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setResponsiveState((prev) => ({
        ...prev,
        isFullscreen: document.fullscreenElement !== null,
      }))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    updateStatistics()
  }, [updateStatistics])

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
            <EnergyMonitor />
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

  const activeMenuItem = menuItems.find((item) => item?.key === activeKey)
  const menuLabel = activeMenuItem?.label as string

  const siderContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: collapsed ? '0 8px' : '0 16px',
        }}
      >
        <Space>
          <SafetyOutlined
            style={{
              fontSize: collapsed ? 28 : 24,
              color: '#1890ff',
            }}
          />
          {!collapsed && (
            <Title
              level={5}
              style={{ margin: 0, color: '#fff', whiteSpace: 'nowrap' }}
            >
              智慧园区能源监控
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
        style={{ flex: 1, borderRight: 0, marginTop: 8 }}
        inlineIndent={16}
      />
      {!collapsed && (
        <div
          style={{
            padding: 16,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12,
          }}
        >
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <span>能源监控平台 v1.0</span>
            <span>{currentTime}</span>
          </Space>
        </div>
      )}
    </div>
  )

  const shouldCollapse = collapsed || responsiveState.isMobile

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          colorBgLayout: '#f0f2f5',
        },
        components: {
          Layout: {
            siderBg: '#001529',
            headerBg: '#ffffff',
          },
          Card: {
            headerBg: '#fafafa',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {!responsiveState.isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={shouldCollapse}
            breakpoint="lg"
            onBreakpoint={(broken) => {
              if (broken) setCollapsed(true)
            }}
            width={responsiveState.isLarge ? 240 : 220}
            collapsedWidth={64}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {siderContent}
          </Sider>
        )}

        {responsiveState.isMobile && (
          <Drawer
            title={
              <Space>
                <SafetyOutlined style={{ color: '#1890ff' }} />
                <span>智慧园区能源监控</span>
              </Space>
            }
            placement="left"
            closable
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={260}
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
        )}

        <Layout
          style={{
            transition: 'all 0.3s ease',
            marginLeft: responsiveState.isMobile ? 0 : undefined,
          }}
        >
          <Header
            style={{
              padding: responsiveState.isMobile ? '0 8px' : '0 16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              height: responsiveState.isMobile ? 48 : 64,
            }}
          >
            <Space>
              {!responsiveState.isMobile && (
                <Button
                  type="text"
                  icon={shouldCollapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!shouldCollapse)}
                  style={{
                    fontSize: '16px',
                    width: 48,
                    height: responsiveState.isMobile ? 48 : 64,
                  }}
                />
              )}
              {responsiveState.isMobile && (
                <Button
                  type="text"
                  icon={<MenuFoldOutlined />}
                  onClick={() => setMobileMenuVisible(true)}
                  style={{ fontSize: '16px' }}
                />
              )}
              <Title
                level={responsiveState.isMobile ? 5 : 4}
                style={{
                  margin: 0,
                  display: responsiveState.isMobile ? 'none' : 'block',
                }}
              >
                {menuLabel}
              </Title>
            </Space>

            <Space size={responsiveState.isMobile ? 4 : 8}>
              {!responsiveState.isMobile && (
                <Tooltip title={currentTime}>
                  <Button
                    type="text"
                    style={{
                      color: '#666',
                      fontSize: 14,
                      fontFamily: 'monospace',
                    }}
                  >
                    {currentTime}
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="刷新数据">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                />
              </Tooltip>

              <Tooltip title="全屏显示">
                <Button
                  type="text"
                  icon={
                    responsiveState.isFullscreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )
                  }
                  onClick={toggleFullscreen}
                />
              </Tooltip>

              <Tooltip title="告警通知">
                <Badge
                  count={activeAlerts}
                  offset={[-2, 2]}
                  color={activeAlerts > 0 ? '#ff4d4f' : '#52c41a'}
                >
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    onClick={() => setActiveKey('energy')}
                  />
                </Badge>
              </Tooltip>
            </Space>
          </Header>

          <Content
            style={{
              margin: responsiveState.isMobile ? 8 : 16,
              padding: responsiveState.isMobile ? 8 : 16,
              minHeight: 280,
              background: '#f5f5f5',
              overflow: 'auto',
              borderRadius: 4,
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
