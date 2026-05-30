import { Layout, Menu, Avatar, Button } from 'antd'
import { useSelector } from 'react-redux'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  UnorderedListOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Sider, Content } = Layout

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, role } = useSelector(state => state.user)

  const menuItems = role === 'worker'
    ? [
        { key: '/profile/orders', icon: <UnorderedListOutlined />, label: '我的订单' },
        { key: '/profile/settings', icon: <SettingOutlined />, label: '账户设置' }
      ]
    : [
        { key: '/profile/orders', icon: <UnorderedListOutlined />, label: '我的订单' },
        { key: '/profile/addresses', icon: <EnvironmentOutlined />, label: '常用地址' },
        { key: '/profile/favorites', icon: <HeartOutlined />, label: '我的收藏' },
        { key: '/profile/settings', icon: <SettingOutlined />, label: '账户设置' }
      ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
      <div className="container" style={{ display: 'flex', padding: '24px 20px', gap: 24 }}>
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRadius: 8,
            height: 'fit-content',
            position: 'sticky',
            top: 88
          }}
        >
          <div style={{ padding: 24, textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <Avatar size={64} src={userInfo?.avatar} icon={<UserOutlined />} />
            <h3 style={{ marginTop: 12, marginBottom: 4 }}>{userInfo?.nickname || '用户'}</h3>
            <p style={{ color: '#999', fontSize: 12, margin: 0 }}>
              {role === 'worker' ? '入驻师傅' : '普通用户'}
            </p>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', padding: '8px 0' }}
          />
        </Sider>
        <Content style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Content>
      </div>
    </Layout>
  )
}

export default Profile
