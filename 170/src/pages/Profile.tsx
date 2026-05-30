import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Modal,
  Form,
  Input,
  Radio,
  message,
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  EditOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../store';
import { updateUser } from '../store/modules/user';
import { mockCoupons } from '../mock';
import { formatPrice } from '../utils';
import EmptyState from '../components/common/EmptyState';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isTechnician, isUser } = useAuth();
  const dispatch = useAppDispatch();
  const { orders, favorites, coupons } = useAppSelector((state) => state.user);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  if (!user) {
    return <EmptyState description="请先登录" actionText="去登录" actionPath="/login" />;
  }

  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingCartOutlined />,
      title: '我的订单',
      count: orders.length,
      onClick: () => navigate('/orders'),
    },
    ...(isUser
      ? [
          {
            key: 'favorites',
            icon: <HeartOutlined />,
            title: '我的收藏',
            count: favorites.length,
            onClick: () => navigate('/favorites'),
          },
          {
            key: 'address',
            icon: <EnvironmentOutlined />,
            title: '地址管理',
            count: user.address?.length || 0,
            onClick: () => navigate('/address'),
          },
        ]
      : []),
    {
      key: 'coupons',
      icon: <GiftOutlined />,
      title: '我的优惠券',
      count: coupons.filter((c) => !c.used).length,
      onClick: () => {},
    },
  ];

  const handleEditProfile = async () => {
    try {
      const values = await form.validateFields();
      dispatch(updateUser(values));
      setEditModalVisible(false);
      message.success('个人信息更新成功');
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '您确定要退出登录吗？',
      onOk: () => {
        logout();
        navigate('/');
      },
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={24} align="middle">
          <Col span={4}>
            <Avatar src={user.avatar} size={100} icon={<UserOutlined />} />
          </Col>
          <Col span={14}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', marginRight: '12px' }}>
                {user.nickname}
              </span>
              <span
                style={{
                  background: isTechnician ? '#722ed1' : '#1890ff',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {isTechnician ? '美甲师' : '普通用户'}
              </span>
            </div>
            <div style={{ color: '#999', marginBottom: '8px' }}>
              手机号：{user.phone}
            </div>
            {user.gender && (
              <div style={{ color: '#999' }}>
                性别：{user.gender === 'male' ? '男' : '女'}
              </div>
            )}
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button icon={<EditOutlined />} onClick={() => setEditModalVisible(true)}>
              编辑资料
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="预约订单"
              value={orders.length}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        {isUser && (
          <>
            <Col span={8}>
              <Card>
                <Statistic
                  title="收藏服务"
                  value={favorites.length}
                  prefix={<HeartOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="可用优惠券"
                  value={coupons.filter((c) => !c.used).length}
                  prefix={<GiftOutlined />}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      <Card title="常用功能" style={{ marginBottom: '24px' }}>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={menuItems}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                style={{ textAlign: 'center', cursor: 'pointer' }}
                onClick={item.onClick}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px', color: '#ff85c0' }}>
                  {item.icon}
                </div>
                <div>{item.title}</div>
                {item.count > 0 && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    {item.count}
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="我的优惠券">
        {coupons.length > 0 ? (
          <Row gutter={[16, 16]}>
            {coupons.map((coupon) => (
              <Col span={8} key={coupon.id}>
                <Card
                  style={{
                    background: coupon.used ? '#f5f5f5' : 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                    color: coupon.used ? '#999' : '#fff',
                    border: 'none',
                    opacity: coupon.used ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
                        ¥{coupon.discount}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        满{coupon.minAmount}可用
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {coupon.name}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {coupon.used ? '已使用' : `有效期至 ${coupon.expireTime}`}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState description="暂无优惠券" />
        )}
      </Card>

      <Modal
        title="编辑个人信息"
        open={editModalVisible}
        onOk={handleEditProfile}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            nickname: user.nickname,
            phone: user.phone,
            gender: user.gender,
          }}
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }]}
          >
            <Input placeholder="请输入手机号" disabled />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Radio.Group>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
