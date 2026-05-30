import React, { useState, useEffect } from 'react'
import {
  Layout,
  Menu,
  Card,
  Table,
  Tag,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Statistic,
  Input,
  DatePicker,
  Space,
  Modal,
  Form,
  message,
  Select,
  Popconfirm,
  Tooltip,
  Descriptions,
} from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'
import EmptyState from '../../components/Common/EmptyState'
import Loading from '../../components/Common/Loading'
import {
  addDesignerWork,
  setOrdersFilter,
  deleteOrder,
  updateOrderStatus,
  selectFilteredOrders,
  fetchOrders,
} from '../../store/userSlice'

const { Content, Sider } = Layout
const { Title, Paragraph, Text } = Typography
const { RangePicker } = DatePicker
const { TextArea } = Input
const { Option } = Select

const orderStatusMap = {
  pending: { text: '待处理', color: 'orange' },
  shipping: { text: '配送中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  cancelled: { text: '已取消', color: 'red' },
}

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'shipping', label: '配送中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const Profile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { currentUser, designerWorks, ordersLoading, ordersFilter, orders } = useSelector(
    (state) => state.user
  )
  const filteredOrders = useSelector(selectFilteredOrders)
  const [workModalVisible, setWorkModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchOrders())
    }
  }, [dispatch, currentUser])

  if (!currentUser) {
    return (
      <div className="page-container">
        <EmptyState
          description="请先登录"
          actionText="去登录"
          onAction={() => navigate('/login')}
        />
      </div>
    )
  }

  const handleSearch = (value) => {
    dispatch(setOrdersFilter({ searchText: value }))
  }

  const handleStatusChange = (value) => {
    dispatch(setOrdersFilter({ status: value }))
  }

  const handleDateChange = (dates) => {
    dispatch(setOrdersFilter({ dateRange: dates }))
  }

  const handleResetFilter = () => {
    dispatch(
      setOrdersFilter({
        searchText: '',
        status: 'all',
        dateRange: null,
      })
    )
    message.info('筛选条件已重置')
  }

  const handleViewDetail = (record) => {
    setSelectedOrder(record)
    setDetailModalVisible(true)
  }

  const handleDeleteOrder = (orderId) => {
    setIsLoading(true)
    setTimeout(() => {
      dispatch(deleteOrder(orderId))
      message.success('订单已删除')
      setIsLoading(false)
    }, 500)
  }

  const handleCancelOrder = (orderId) => {
    setIsLoading(true)
    setTimeout(() => {
      dispatch(updateOrderStatus({ orderId, status: 'cancelled' }))
      message.success('订单已取消')
      setIsLoading(false)
    }, 500)
  }

  const handleAddWork = async (values) => {
    setIsLoading(true)
    setTimeout(() => {
      const newWork = {
        id: Date.now(),
        designerId: currentUser.id,
        name: values.name,
        description: values.description,
        image:
          'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
        status: 'pending',
        createTime: new Date().toLocaleDateString('zh-CN'),
      }
      dispatch(addDesignerWork(newWork))
      setWorkModalVisible(false)
      form.resetFields()
      message.success('作品提交成功！')
      setIsLoading(false)
    }, 800)
  }

  const designerWorksFiltered = designerWorks.filter(
    (work) => work.designerId === currentUser.id
  )

  const orderColumns = [
    {
      title: '订单信息',
      key: 'product',
      ellipsis: true,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img
            src={record.productImage}
            alt=""
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              {record.productName}
            </div>
            <div style={{ color: '#999', fontSize: '12px' }}>
              订单号：{record.id}
            </div>
            {record.customContent && (
              <Tooltip
                title={
                  typeof record.customContent === 'string'
                    ? record.customContent
                    : record.customContent.text
                }
              >
                <div
                  style={{
                    color: '#1890ff',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                  }}
                >
                  定制：
                  {typeof record.customContent === 'string'
                    ? record.customContent
                    : record.customContent.text}
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '规格参数',
      key: 'params',
      width: '180px',
      ellipsis: true,
      render: (_, record) => (
        <Tooltip title={Object.values(record.params).join(' / ')}>
          <span style={{ color: '#666', fontSize: '12px' }}>
            {Object.values(record.params).join(' / ')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '80px',
      align: 'center',
    },
    {
      title: '金额',
      key: 'price',
      width: '120px',
      render: (_, record) => (
        <div>
          <div style={{ color: '#ff4d4f', fontWeight: '500' }}>
            ¥{record.totalPrice}
          </div>
          <div style={{ color: '#999', fontSize: '12px' }}>
            单价 ¥{record.price}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '100px',
      render: (status) => {
        const statusInfo =
          orderStatusMap[status] || { text: status, color: 'default' }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '170px',
    },
    {
      title: '操作',
      key: 'action',
      width: '180px',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/product/${record.productId}`)}
          >
            再次购买
          </Button>
          {record.status === 'pending' && (
            <Popconfirm
              title="确定取消该订单吗？"
              onConfirm={() => handleCancelOrder(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger loading={isLoading}>
                取消订单
              </Button>
            </Popconfirm>
          )}
          {record.status === 'cancelled' && (
            <Popconfirm
              title="确定删除该订单吗？"
              onConfirm={() => handleDeleteOrder(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={isLoading}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const workColumns = [
    {
      title: '作品信息',
      key: 'work',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <img
            src={record.image}
            alt=""
            style={{
              width: '80px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
          <div>
            <div style={{ fontWeight: '500' }}>{record.name}</div>
            <div style={{ color: '#999', fontSize: '12px' }}>
              {record.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '100px',
      render: (status) => {
        const colorMap = {
          pending: 'orange',
          approved: 'green',
          rejected: 'red',
        }
        const textMap = {
          pending: '审核中',
          approved: '已通过',
          rejected: '已拒绝',
        }
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '150px',
    },
  ]

  const menuItems = [
    {
      key: '',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: '我的订单',
      onClick: () => navigate('/profile/orders'),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '定制记录',
      onClick: () => navigate('/profile/history'),
    },
    ...(currentUser.role === 'designer'
      ? [
          {
            key: 'works',
            icon: <FileTextOutlined />,
            label: '我的作品',
            onClick: () => navigate('/profile/works'),
          },
        ]
      : []),
  ]

  const getActiveKey = () => {
    const path = location.pathname.split('/').pop()
    return path === 'profile' ? '' : path
  }

  const getCustomContentText = (customContent) => {
    if (!customContent) return '-'
    if (typeof customContent === 'string') return customContent
    return customContent.text
  }

  const getCustomContentStyle = (customContent) => {
    if (!customContent || typeof customContent === 'string') return null
    return {
      fontFamily: customContent.fontFamily,
      color: customContent.fontColor,
      fontSize: `${customContent.fontSize}px`,
      fontWeight: customContent.isBold ? 'bold' : 'normal',
    }
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Layout>
        <Sider
          width={220}
          style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
        >
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Avatar size={64} src={currentUser.avatar} icon={<UserOutlined />} />
            <Title level={5} style={{ marginTop: '12px', marginBottom: '4px' }}>
              {currentUser.name}
            </Title>
            <Tag color={currentUser.role === 'designer' ? 'blue' : 'green'}>
              {currentUser.role === 'designer' ? '文创设计师' : '普通用户'}
            </Tag>
            <Paragraph
              style={{
                color: '#999',
                marginTop: '8px',
                marginBottom: 0,
                fontSize: '12px',
              }}
            >
              {currentUser.campus}
            </Paragraph>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getActiveKey()]}
            items={menuItems}
            style={{ height: '100%', borderRight: 'none' }}
          />
        </Sider>
        <Layout style={{ padding: '24px', background: '#f5f5f5' }}>
          <Routes>
            <Route
              path=""
              element={
                <div>
                  <Card title="个人信息">
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title="累计订单"
                          value={orders.length}
                          prefix={<ShoppingOutlined />}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title="待处理"
                          value={orders.filter((o) => o.status === 'pending').length}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title="已完成"
                          value={
                            orders.filter((o) => o.status === 'completed').length
                          }
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Statistic
                          title="累计消费"
                          value={orders.reduce((sum, o) => sum + o.totalPrice, 0)}
                          prefix="¥"
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Col>
                    </Row>
                    <Card
                      size="small"
                      style={{ marginTop: '24px' }}
                      title="基本信息"
                    >
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="用户名">
                          {currentUser.username}
                        </Descriptions.Item>
                        <Descriptions.Item label="用户角色">
                          <Tag color={currentUser.role === 'designer' ? 'blue' : 'green'}>
                            {currentUser.role === 'designer' ? '文创设计师' : '普通用户'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="所属校园">
                          {currentUser.campus}
                        </Descriptions.Item>
                        <Descriptions.Item label="注册时间">
                          2024-01-01
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Card>
                </div>
              }
            />
            <Route
              path="orders"
              element={
                <Card
                  title="我的订单"
                  extra={
                    <Space>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={handleResetFilter}
                      >
                        重置筛选
                      </Button>
                    </Space>
                  }
                >
                  <Card
                    size="small"
                    style={{ marginBottom: '16px', background: '#fafafa' }}
                  >
                    <Space wrap size="middle">
                      <Input
                        placeholder="搜索商品名称或订单号"
                        prefix={<SearchOutlined />}
                        value={ordersFilter.searchText}
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ width: '250px' }}
                        allowClear
                      />
                      <Select
                        value={ordersFilter.status}
                        onChange={handleStatusChange}
                        style={{ width: '150px' }}
                        suffixIcon={<FilterOutlined />}
                      >
                        {statusOptions.map((opt) => (
                          <Option key={opt.value} value={opt.value}>
                            {opt.label}
                          </Option>
                        ))}
                      </Select>
                      <RangePicker
                        value={ordersFilter.dateRange}
                        onChange={handleDateChange}
                        placeholder={['开始日期', '结束日期']}
                      />
                    </Space>
                  </Card>

                  {ordersLoading ? (
                    <Loading text="加载订单中..." />
                  ) : filteredOrders.length > 0 ? (
                    <Table
                      columns={orderColumns}
                      dataSource={filteredOrders}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条订单`,
                      }}
                      scroll={{ x: 1000 }}
                    />
                  ) : (
                    <EmptyState
                      description={
                        ordersFilter.searchText ||
                        ordersFilter.status !== 'all' ||
                        ordersFilter.dateRange
                          ? '没有找到符合条件的订单'
                          : '暂无订单'
                      }
                      actionText={
                        ordersFilter.searchText ||
                        ordersFilter.status !== 'all' ||
                        ordersFilter.dateRange
                          ? '重置筛选'
                          : '去逛逛'
                      }
                      onAction={() =>
                        ordersFilter.searchText ||
                        ordersFilter.status !== 'all' ||
                        ordersFilter.dateRange
                          ? handleResetFilter()
                          : navigate('/')
                      }
                    />
                  )}
                </Card>
              }
            />
            <Route
              path="history"
              element={
                <Card title="定制记录">
                  {ordersLoading ? (
                    <Loading text="加载中..." />
                  ) : orders.filter(
                      (o) =>
                        o.customContent &&
                        (typeof o.customContent === 'string'
                          ? o.customContent
                          : o.customContent.text)
                    ).length > 0 ? (
                    <Table
                      columns={orderColumns}
                      dataSource={orders.filter(
                        (o) =>
                          o.customContent &&
                          (typeof o.customContent === 'string'
                            ? o.customContent
                            : o.customContent.text)
                      )}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1000 }}
                    />
                  ) : (
                    <EmptyState
                      description="暂无定制记录"
                      actionText="去定制"
                      onAction={() => navigate('/')}
                    />
                  )}
                </Card>
              }
            />
            {currentUser.role === 'designer' && (
              <Route
                path="works"
                element={
                  <Card
                    title="我的作品"
                    extra={
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setWorkModalVisible(true)}
                      >
                        提交作品
                      </Button>
                    }
                  >
                    {designerWorksFiltered.length > 0 ? (
                      <Table
                        columns={workColumns}
                        dataSource={designerWorksFiltered}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                      />
                    ) : (
                      <EmptyState
                        description="暂无作品"
                        actionText="提交第一个作品"
                        onAction={() => setWorkModalVisible(true)}
                      />
                    )}
                  </Card>
                }
              />
            )}
          </Routes>
        </Layout>
      </Layout>

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="buy"
            type="primary"
            onClick={() => {
              navigate(`/product/${selectedOrder?.productId}`)
              setDetailModalVisible(false)
            }}
          >
            再次购买
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <img
                src={selectedOrder.productImage}
                alt=""
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {selectedOrder.productName}
                </Title>
                <Tag color={orderStatusMap[selectedOrder.status]?.color}>
                  {orderStatusMap[selectedOrder.status]?.text}
                </Tag>
              </div>
            </div>

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="订单号">
                {selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {selectedOrder.createTime}
              </Descriptions.Item>
              <Descriptions.Item label="规格参数">
                {Object.entries(selectedOrder.params)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' | ')}
              </Descriptions.Item>
              <Descriptions.Item label="数量">
                {selectedOrder.quantity} 件
              </Descriptions.Item>
              <Descriptions.Item label="定制内容">
                {selectedOrder.customContent ? (
                  <div>
                    <div
                      style={getCustomContentStyle(selectedOrder.customContent)}
                    >
                      {getCustomContentText(selectedOrder.customContent)}
                    </div>
                    {typeof selectedOrder.customContent !== 'string' && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <br />
                        字体：{selectedOrder.customContent.fontFamily} | 颜色：
                        {selectedOrder.customContent.fontColor} | 字号：
                        {selectedOrder.customContent.fontSize}px |
                        {selectedOrder.customContent.isBold ? ' 加粗' : ''}
                      </Text>
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="单价">
                ¥{selectedOrder.price}
              </Descriptions.Item>
              <Descriptions.Item label="总价" labelStyle={{ fontWeight: 'bold' }}>
                <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
                  ¥{selectedOrder.totalPrice}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title="提交新作品"
        open={workModalVisible}
        onCancel={() => setWorkModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddWork}>
          <Form.Item
            name="name"
            label="作品名称"
            rules={[
              { required: true, message: '请输入作品名称' },
              { min: 2, message: '作品名称至少2个字符' },
              { max: 50, message: '作品名称最多50个字符' },
            ]}
          >
            <Input placeholder="请输入作品名称" size="large" />
          </Form.Item>
          <Form.Item
            name="description"
            label="作品描述"
            rules={[
              { required: true, message: '请输入作品描述' },
              { min: 10, message: '作品描述至少10个字符' },
              { max: 500, message: '作品描述最多500个字符' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述您的作品设计理念、特色等"
              showCount
              maxLength={500}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
            >
              提交审核
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default Profile
