import React from 'react'
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Typography } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'

const { Header, Sider, Content } = AntLayout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
  activeKey: string
  onMenuChange: (key: string) => void
}

const menuItems = [
  {
    key: 'categories',
    icon: <AppstoreOutlined />,
    label: '文创品类分类管理',
  },
  {
    key: 'products',
    icon: <ShoppingOutlined />,
    label: '商品SKU规格管理',
  },
  {
    key: 'after-sales',
    icon: <ShoppingCartOutlined />,
    label: '订单售后处理管理',
  },
  {
    key: 'members',
    icon: <UserOutlined />,
    label: '会员等级权益管理',
  },
]

const userItems = [
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
]

function Layout({ children, activeKey, onMenuChange }: LayoutProps) {
  const { collapsed, setCollapsed } = useAppStore()
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) {
        setCollapsed(true)
      }
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [setCollapsed])

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={220}
        collapsedWidth={isMobile ? 0 : 80}
        breakpoint="md"
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={collapsed ? 5 : 4} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {collapsed ? '文创' : '精品文创商城'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => onMenuChange(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: isMobile ? '0 12px' : '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 64 }}
          />
          <Dropdown menu={{ items: userItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={isMobile ? 'small' : 'default'} icon={<UserOutlined />} />
              {!isMobile && <span>管理员</span>}
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: isMobile ? '12px' : '24px', background: '#fff', padding: isMobile ? 16 : 24, borderRadius: 8 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
