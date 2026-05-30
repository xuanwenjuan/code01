import { Row, Col, Typography, Card, Avatar, Descriptions, Tag, Button, Menu } from 'antd'
import {
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  EditOutlined,
  LogoutOutlined,
  BookOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/userSlice'

const { Title } = Typography

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, role, favorites, history } = useSelector(state => state.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile')
    },
    {
      key: '/profile/favorites',
      icon: <HeartOutlined />,
      label: `我的收藏 (${favorites.types.length + favorites.works.length})`,
      onClick: () => navigate('/profile/favorites')
    },
    {
      key: '/profile/history',
      icon: <HistoryOutlined />,
      label: `浏览记录 (${history.length})`,
      onClick: () => navigate('/profile/history')
    }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={6}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={100} src={currentUser?.avatar} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '16px', marginBottom: '8px' }}>
                {currentUser?.name}
              </Title>
              <Tag color={role === 'admin' ? 'red' : 'blue'}>
                {role === 'admin' ? '平台管理员' : '木活字印刷研究者'}
              </Tag>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{ border: 'none' }}
            />
            <Button
              danger
              block
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ marginTop: '16px' }}
            >
              退出登录
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Card title="个人信息">
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="用户名">{currentUser?.username}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{currentUser?.email}</Descriptions.Item>
              <Descriptions.Item label="手机号">{currentUser?.phone}</Descriptions.Item>
              <Descriptions.Item label="用户角色">
                <Tag color={role === 'admin' ? 'red' : 'blue'}>
                  {role === 'admin' ? '平台管理员' : '木活字印刷研究者'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">{currentUser?.createdAt}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <Button type="primary" icon={<EditOutlined />}>
                编辑资料
              </Button>
              <Button icon={<BookOutlined />} onClick={() => navigate('/types')}>
                浏览活字
              </Button>
            </div>
          </Card>

          <Card title="数据统计" style={{ marginTop: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
                    {favorites.types.length}
                  </div>
                  <div style={{ color: '#666', marginTop: '8px' }}>收藏活字</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
                    {favorites.works.length}
                  </div>
                  <div style={{ color: '#666', marginTop: '8px' }}>收藏作品</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fa8c16' }}>
                    {history.length}
                  </div>
                  <div style={{ color: '#666', marginTop: '8px' }}>浏览记录</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
