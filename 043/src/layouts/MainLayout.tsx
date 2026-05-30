import { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Badge, Button, Drawer } from 'antd'
import {
  TeamOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import Organization from '@/modules/Organization'
import Chat from '@/modules/Chat'
import Approval from '@/modules/Approval'
import GlobalSearch from '@/modules/GlobalSearch'
import NotificationDropdown from '@/components/NotificationDropdown'
import styles from './MainLayout.module.css'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    currentUser,
    notifications,
    currentModule,
    setCurrentModule
  } = useAppStore()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const unreadCount = notifications.filter(n => n.status === 'unread').length

  const menuItems = [
    {
      key: 'organization',
      icon: <TeamOutlined />,
      label: '组织架构'
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: '即时通讯'
    },
    {
      key: 'approval',
      icon: <CheckCircleOutlined />,
      label: '审批管理'
    },
    {
      key: 'search',
      icon: <SearchOutlined />,
      label: '全局搜索'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    setCurrentModule(key)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'organization':
        return <Organization />
      case 'chat':
        return <Chat />
      case 'approval':
        return <Approval />
      case 'search':
        return <GlobalSearch />
      default:
        return <Organization />
    }
  }

  const siderContent = (
    <>
      <div className={styles.logo}>
        {collapsed ? 'OA' : '企业协同办公'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentModule]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 'none' }}
      />
    </>
  )

  return (
    <Layout className={styles.layout}>
      {isMobile ? (
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          style={{ padding: 0 }}
          bodyStyle={{ padding: 0, background: '#001529' }}
          width={200}
        >
          {siderContent}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={styles.sider}
          width={200}
        >
          {siderContent}
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200), transition: 'all 0.2s' }}>
        <Header className={styles.header}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed)}
            className={styles.collapseBtn}
          />
          <div className={styles.headerRight}>
            <NotificationDropdown>
              <Badge count={unreadCount} size="small">
                <BellOutlined className={styles.iconBtn} />
              </Badge>
            </NotificationDropdown>
            {currentUser && (
              <div className={styles.userInfo}>
                <Avatar src={currentUser.avatar} size="small" />
                <span className={styles.userName}>{currentUser.name}</span>
              </div>
            )}
          </div>
        </Header>
        <Content className={styles.content}>
          {renderModule()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
