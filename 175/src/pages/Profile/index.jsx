import { useSelector, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Avatar,
  Row,
  Col,
  Descriptions,
  Button,
  Statistic,
  List,
  Tag
} from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'
import { useCity } from '@/hooks/useCity'
import { selectOrdersByUser } from '@/store/slices/orderSlice'

function Profile() {
  const navigate = useNavigate()
  const { userInfo, logout, isUser, isMaster } = useAuth()
  const { currentCity } = useCity()
  
  const userOrders = useSelector((state) => 
    isUser ? selectOrdersByUser(state, userInfo?.id) : []
  )
  const masterOrders = useSelector((state) => 
    isMaster ? state.order.orders : []
  )

  const menuItems = useMemo(() => [
    isUser && {
      icon: <ShoppingOutlined />,
      title: '我的订单',
      desc: `共 ${userOrders.length} 个订单`,
      onClick: () => navigate('/orders')
    },
    isMaster && {
      icon: <ToolOutlined />,
      title: '师傅订单',
      desc: `共 ${masterOrders.length} 个订单`,
      onClick: () => navigate('/master/orders')
    }
  ].filter(Boolean), [isUser, isMaster, userOrders.length, masterOrders.length, navigate])

  const statistics = useMemo(() => isUser
    ? [
        { title: '已完成订单', value: userOrders.filter((o) => o.status === 2).length },
        { title: '进行中订单', value: userOrders.filter((o) => o.status === 1).length },
        { title: '待评价', value: userOrders.filter((o) => o.status === 2 && !o.feedback).length }
      ]
    : [
        { title: '已接单', value: masterOrders.filter((o) => o.status === 1).length },
        { title: '已完成', value: masterOrders.filter((o) => o.status === 2).length },
        { title: '总收入', value: '¥' + masterOrders.filter((o) => o.status === 2).reduce((sum, o) => sum + o.price, 0) }
      ], [isUser, userOrders, masterOrders])

  return (
    <div className="container">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="mb-24">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Avatar size={80} src={userInfo?.avatar} icon={<UserOutlined />} />
              <h2 style={{ marginTop: 16, marginBottom: 4 }}>{userInfo?.name}</h2>
              <Tag color={userInfo?.role === 'user' ? 'blue' : 'green'}>
                {userInfo?.role === 'user' ? '普通用户' : '疏通师傅'}
              </Tag>
              <div style={{ color: '#999', marginTop: 8 }}>
                当前城市：{currentCity}
              </div>
            </div>
            <List
              dataSource={menuItems}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '16px', borderRadius: 8 }}
                  onClick={item.onClick}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <div style={{ fontSize: 24, marginRight: 16, color: '#1890ff' }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ color: '#999', fontSize: 12 }}>{item.desc}</div>
                    </div>
                    <div style={{ color: '#ccc' }}>{'>'}</div>
                  </div>
                </List.Item>
              )}
            />
            <Button
              type="primary"
              danger
              block
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ marginTop: 16 }}
            >
              退出登录
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="基本信息" className="mb-24">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="用户名">{userInfo?.username}</Descriptions.Item>
              <Descriptions.Item label="姓名">{userInfo?.name}</Descriptions.Item>
              <Descriptions.Item label="手机号">{userInfo?.phone}</Descriptions.Item>
              <Descriptions.Item label="用户类型">
                <Tag color={userInfo?.role === 'user' ? 'blue' : 'green'}>
                  {userInfo?.role === 'user' ? '普通用户' : '疏通师傅'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="数据概览">
            <Row gutter={[16, 16]}>
              {statistics.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                  <Card>
                    <Statistic title={stat.title} value={stat.value} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
