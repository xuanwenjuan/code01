import { useState, useEffect } from 'react'
import { Layout, Menu, theme, Card, Button, Drawer } from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { SupplierManagement } from './components/SupplierManagement'
import { MaterialManagement } from './components/MaterialManagement'
import { InquiryOrderManagement } from './components/InquiryOrderManagement'
import { DeliveryManagement } from './components/DeliveryManagement'

const { Header, Sider, Content } = Layout

type MenuKey = 'suppliers' | 'materials' | 'inquiry' | 'delivery'

interface MenuItem {
  key: MenuKey
  icon: React.ReactNode
  label: string
  component: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    key: 'suppliers',
    icon: <UserOutlined />,
    label: '供应商资质管理',
    component: <SupplierManagement />,
  },
  {
    key: 'materials',
    icon: <AppstoreOutlined />,
    label: '零部件物料管理',
    component: <MaterialManagement />,
  },
  {
    key: 'inquiry',
    icon: <ShoppingCartOutlined />,
    label: '采购询价订单管理',
    component: <InquiryOrderManagement />,
  },
  {
    key: 'delivery',
    icon: <FileTextOutlined />,
    label: '供货履约对账管理',
    component: <DeliveryManagement />,
  },
]

const App = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedKey, setSelectedKey] = useState<MenuKey>('suppliers')
  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const currentPage = menuItems.find((item) => item.key === selectedKey)

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key as MenuKey)
    if (isMobile) {
      setDrawerOpen(false)
    }
  }

  const sidebarContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: collapsed ? 14 : 18,
          fontWeight: 'bold',
        }}
      >
        {collapsed ? '精密' : '精密机械管理'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[selectedKey]}
        mode="inline"
        items={menuItems}
        onClick={handleMenuClick}
        style={{ flex: 1 }}
      />
    </div>
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
          {sidebarContent}
        </Sider>
      )}

      <Drawer
        title="精密机械管理"
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={240}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setDrawerOpen(true)}
              />
            )}
            <h2 style={{ margin: 0, fontSize: isMobile ? 16 : 20 }}>{currentPage?.label}</h2>
          </div>
        </Header>
        <Content
          style={{
            margin: isMobile ? '8px' : '16px',
            padding: isMobile ? 12 : 20,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <Card bordered={false} style={{ boxShadow: 'none' }} bodyStyle={{ padding: isMobile ? 8 : 16 }}>
            {currentPage?.component}
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
