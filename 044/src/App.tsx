import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  ShoppingOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import ProductManagement from './components/ProductManagement'
import OrderManagement from './components/OrderManagement'
import MarketingManagement from './components/MarketingManagement'
import ReviewManagement from './components/ReviewManagement'

const { Header, Sider, Content } = Layout

type MenuKey = 'products' | 'orders' | 'marketing' | 'reviews'

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeKey, setActiveKey] = useState<MenuKey>('products')
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const menuItems = [
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      label: '订单管理',
    },
    {
      key: 'marketing',
      icon: <TagOutlined />,
      label: '营销活动',
    },
    {
      key: 'reviews',
      icon: <MessageOutlined />,
      label: '评价管理',
    },
  ]

  const renderContent = () => {
    switch (activeKey) {
      case 'products':
        return <ProductManagement />
      case 'orders':
        return <OrderManagement />
      case 'marketing':
        return <MarketingManagement />
      case 'reviews':
        return <ReviewManagement />
      default:
        return <ProductManagement />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
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
          {collapsed ? '工作台' : '商家运营工作台'}
        </div>
        <Menu
          theme="dark"
          selectedKeys={[activeKey]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => setActiveKey(key as MenuKey)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
