import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card, Avatar, Button, List, Modal, Form, Input,
  message, Tabs, Tag, Table, Popconfirm, Row, Col
} from 'antd'
import {
  UserOutlined, SettingOutlined, HeartOutlined,
  EnvironmentOutlined, FileTextOutlined, EditOutlined,
  DeleteOutlined, PlusOutlined, CrownOutlined,
  ShoppingOutlined, GiftOutlined, WalletOutlined
} from '@ant-design/icons'
import { updateAddress, deleteAddress, setDefaultAddress, addAddress } from '@/store/orderSlice'
import { updateUserInfo } from '@/store/userSlice'
import { afterSales } from '@/mock'
import './index.scss'

const { TabPane } = Tabs
const { TextArea } = Input

const Profile = () => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector(state => state.user)
  const { addresses } = useSelector(state => state.order)
  const { items: favorites } = useSelector(state => state.favorite)
  const [activeTab, setActiveTab] = useState('profile')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [form] = Form.useForm()
  const [addressForm] = Form.useForm()

  const handleEditProfile = () => {
    form.setFieldsValue(userInfo)
    setEditModalVisible(true)
  }

  const handleSaveProfile = (values) => {
    dispatch(updateUserInfo(values))
    setEditModalVisible(false)
    message.success('个人信息已更新')
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    addressForm.resetFields()
    setAddressModalVisible(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    addressForm.setFieldsValue(address)
    setAddressModalVisible(true)
  }

  const handleSaveAddress = (values) => {
    if (editingAddress) {
      dispatch(updateAddress({ id: editingAddress.id, ...values }))
      message.success('地址已更新')
    } else {
      dispatch(addAddress(values))
      message.success('地址已添加')
    }
    setAddressModalVisible(false)
  }

  const handleDeleteAddress = (id) => {
    dispatch(deleteAddress(id))
    message.success('地址已删除')
  }

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id))
    message.success('已设为默认地址')
  }

  const menuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'address', icon: <EnvironmentOutlined />, label: '收货地址' },
    { key: 'favorites', icon: <HeartOutlined />, label: `我的收藏 (${favorites.length})` },
    { key: 'aftersales', icon: <FileTextOutlined />, label: '售后申请' },
    { key: 'settings', icon: <SettingOutlined />, label: '账号设置' }
  ]

  const addressColumns = [
    {
      title: '收货人',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          {text}
          {record.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>默认</Tag>}
          {record.tag && <Tag style={{ marginLeft: 4 }}>{record.tag}</Tag>}
        </div>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: (_, record) =>
        `${record.province}${record.city}${record.district}${record.detail}`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="action-buttons">
          {!record.isDefault && (
            <Button type="link" size="small" onClick={() => handleSetDefault(record.id)}>
              设为默认
            </Button>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditAddress(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该地址吗？"
            onConfirm={() => handleDeleteAddress(record.id)}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  const afterSalesColumns = [
    {
      title: '售后单号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => type === 'refund' ? '仅退款' : '退货退款'
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason'
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span className="price">¥{amount.toFixed(1)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status === 'completed' ? '已完成' : '处理中'}
        </Tag>
      )
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime'
    }
  ]

  return (
    <div className="profile-page">
      <Row gutter={[20, 20]}>
        <Col xs={24} md={6}>
          <Card className="user-card">
            <div className="user-info">
              <Avatar size={80} src={userInfo?.avatar} icon={<UserOutlined />} />
              <div className="user-detail">
                <h3 className="username">
                  {userInfo?.nickname}
                  <Tag color="gold" icon={<CrownOutlined />} style={{ marginLeft: 8 }}>
                    {userInfo?.level}
                  </Tag>
                </h3>
                <p className="phone">{userInfo?.phone}</p>
              </div>
            </div>
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-value">{userInfo?.points}</span>
                <span className="stat-label">积分</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">¥{userInfo?.balance?.toFixed(1)}</span>
                <span className="stat-label">余额</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userInfo?.coupons}</span>
                <span className="stat-label">优惠券</span>
              </div>
            </div>
            <div className="user-menu">
              {menuItems.map(item => (
                <div
                  key={item.key}
                  className={`menu-item ${activeTab === item.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Card className="content-card">
            {activeTab === 'profile' && (
              <div className="profile-content">
                <div className="section-header">
                  <h3>个人信息</h3>
                  <Button type="primary" icon={<EditOutlined />} onClick={handleEditProfile}>
                    编辑
                  </Button>
                </div>
                <List className="info-list">
                  <List.Item>
                    <span className="label">用户名</span>
                    <span className="value">{userInfo?.username}</span>
                  </List.Item>
                  <List.Item>
                    <span className="label">昵称</span>
                    <span className="value">{userInfo?.nickname}</span>
                  </List.Item>
                  <List.Item>
                    <span className="label">手机号</span>
                    <span className="value">{userInfo?.phone}</span>
                  </List.Item>
                  <List.Item>
                    <span className="label">注册时间</span>
                    <span className="value">{userInfo?.createTime}</span>
                  </List.Item>
                </List>

                <div className="quick-actions">
                  <div className="action-card">
                    <ShoppingOutlined className="action-icon" />
                    <p>我的订单</p>
                  </div>
                  <div className="action-card">
                    <GiftOutlined className="action-icon" />
                    <p>我的优惠券</p>
                  </div>
                  <div className="action-card">
                    <WalletOutlined className="action-icon" />
                    <p>我的钱包</p>
                  </div>
                  <div className="action-card">
                    <HeartOutlined className="action-icon" />
                    <p>我的收藏</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="address-content">
                <div className="section-header">
                  <h3>收货地址管理</h3>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddAddress}>
                    添加地址
                  </Button>
                </div>
                <Table
                  dataSource={addresses}
                  columns={addressColumns}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="favorites-content">
                <div className="section-header">
                  <h3>我的收藏</h3>
                </div>
                {favorites.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {favorites.map(item => (
                      <Col xs={12} sm={8} md={6} key={item.id}>
                        <div className="favorite-item">
                          <img src={item.image} alt={item.name} />
                          <p className="name">{item.name}</p>
                          <p className="price">¥{item.price.toFixed(1)}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="empty-state">暂无收藏商品</div>
                )}
              </div>
            )}

            {activeTab === 'aftersales' && (
              <div className="aftersales-content">
                <div className="section-header">
                  <h3>售后申请</h3>
                </div>
                <Table
                  dataSource={afterSales}
                  columns={afterSalesColumns}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="settings-content">
                <h3>账号设置</h3>
                <List>
                  <List.Item>
                    <span className="label">修改密码</span>
                    <Button type="link">去修改</Button>
                  </List.Item>
                  <List.Item>
                    <span className="label">绑定手机</span>
                    <span>{userInfo?.phone}</span>
                  </List.Item>
                  <List.Item>
                    <span className="label">隐私设置</span>
                    <Button type="link">去设置</Button>
                  </List.Item>
                </List>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="编辑个人信息"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item name="nickname" label="昵称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[
            { required: true },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={addressModalVisible}
        onCancel={() => setAddressModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={addressForm} layout="vertical" onFinish={handleSaveAddress}>
          <Form.Item name="name" label="收货人" rules={[{ required: true, message: '请输入收货人姓名' }]}>
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
          ]}>
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="province" label="省份" rules={[{ required: true, message: '请选择省份' }]}>
                <Input placeholder="省份" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]}>
                <Input placeholder="城市" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="区县" rules={[{ required: true, message: '请选择区县' }]}>
                <Input placeholder="区县" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="detail" label="详细地址" rules={[{ required: true, message: '请输入详细地址' }]}>
            <TextArea rows={3} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <input type="checkbox" /> 设为默认地址
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存地址</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
