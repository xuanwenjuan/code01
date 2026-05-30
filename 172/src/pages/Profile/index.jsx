import { Card, Avatar, Typography, Row, Col, Statistic, Button, List, Tag } from 'antd';
import { UserOutlined, ShoppingOutlined, HeartOutlined, SettingOutlined, GiftOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn } = useAuth();
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrderCount(orders.length);
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const menuItems = [
    {
      icon: <ShoppingOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: '我的订单',
      description: '查看全部订单',
      onClick: () => navigate('/orders'),
    },
    {
      icon: <HeartOutlined style={{ fontSize: 24, color: '#eb2f96' }} />,
      title: '我的收藏',
      description: '查看收藏的商品',
      onClick: () => navigate('/favorites'),
    },
    {
      icon: <SettingOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      title: '账户设置',
      description: '修改个人信息',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        个人中心
      </Title>

      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar size={80} src={currentUser.avatar} icon={<UserOutlined />} />
          </Col>
          <Col flex="auto">
            <Title level={4} style={{ margin: '0 0 8px' }}>
              {currentUser.name}
            </Title>
            <Text type="secondary">用户名：{currentUser.username}</Text>
            <div style={{ marginTop: 8 }}>
              {currentUser.role === 'admin' ? (
                <Tag color="purple">管理员</Tag>
              ) : (
                <Tag color="blue">普通用户</Tag>
              )}
            </div>
          </Col>
          <Col>
            <Button type="primary" onClick={() => navigate('/')}>
              去购物
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="订单数量"
              value={orderCount}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="收藏商品"
              value={0}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="可用优惠券"
              value={3}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="快捷入口" style={{ borderRadius: 8 }}>
        <List
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item
              onClick={item.onClick}
              style={{ cursor: 'pointer', padding: '16px 0' }}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Profile;
