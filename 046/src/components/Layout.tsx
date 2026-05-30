import { useState, useEffect } from 'react'
import { Layout, Menu, theme, Avatar, Dropdown, Space, Typography } from 'antd'
import {
  CoffeeOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import './Layout.less'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const menuItems = [
  {
    key: '/menu',
    icon: <CoffeeOutlined />,
    label: '饮品菜单管理'
  },
  {
    key: '/employee',
    icon: <TeamOutlined />,
    label: '员工人事管理'
  },
  {
    key: '/order',
    icon: <ShoppingCartOutlined />,
    label: '营业订单管理'
  },
  {
    key: '/inventory',
    icon: <InboxOutlined />,
    label: '原料库存管理'
  }
]

const userItems = [
  {
    key: '1',
    label: '个人中心'
  },
  {
    key: '2',
    label: '系统设置'
  },
  {
    key: '3',
    label: '退出登录',
    danger: true
  }
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="md"
        collapsedWidth="64"
        width="220"
        className="layout-sider"
      >
        <div className="sider-logo">
          <CoffeeOutlined />
          {!collapsed && <span className="logo-text">茶饮管理系统</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="layout-header" style={{ background: colorBgContainer }}>
          <Space>
            {collapsed ? (
              <MenuUnfoldOutlined className="trigger" onClick={() => setCollapsed(!collapsed)} />
            ) : (
              <MenuFoldOutlined className="trigger" onClick={() => setCollapsed(!collapsed)} />
            )}
            <Title level={4} style={{ margin: 0 }}>
              {menuItems.find((item) => item.key === location.pathname)?.label || '茶饮管理系统'}
            </Title>
          </Space>
          <Dropdown menu={{ items: userItems }} placement="bottomRight">
            <Space className="user-dropdown">
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="layout-content">{children}</Content>
      </Layout>
    </Layout>
  )
}
