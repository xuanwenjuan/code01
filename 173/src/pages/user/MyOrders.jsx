import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  message,
  Select,
  Card,
  Row,
  Col,
  Descriptions,
  Badge
} from 'antd'
import {
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  AuditOutlined,
  SmileOutlined,
  StopOutlined
} from '@ant-design/icons'
import { fetchOrders, updateOrderStatus, addContactRecord } from '../../store/actions/orderActions'
import PageContainer from '../../components/common/PageContainer'
import './MyOrders.less'

const { Option } = Select

const orderStatusMap = {
  pending: { text: '待确认', color: 'orange', icon: <ClockCircleOutlined /> },
  confirmed: { text: '已确认', color: 'blue', icon: <CheckCircleOutlined /> },
  processing: { text: '服务中', color: 'processing', icon: <AuditOutlined /> },
  completed: { text: '已完成', color: 'success', icon: <SmileOutlined /> },
  cancelled: { text: '已取消', color: 'error', icon: <StopOutlined /> }
}

const MyOrders = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector(state => state.orders)
  const [statusFilter, setStatusFilter] = useState('all')
  const [contactModal, setContactModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const orderStats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const confirmed = orders.filter(o => o.status === 'confirmed').length
    const completed = orders.filter(o => o.status === 'completed').length
    const totalAmount = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0)
    return { total, pending, confirmed, completed, totalAmount }
  }, [orders])

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status === statusFilter)

  const handleCancelOrder = (order) => {
    Modal.confirm({
      title: '确认取消订单',
      content: `确定要取消 ${order.serviceName} 的预约吗？取消后将无法恢复。`,
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: async () => {
        const result = await dispatch(updateOrderStatus(order.id, 'cancelled'))
        if (result.success) {
          message.success('订单已取消')
        } else {
          message.error('取消失败，请重试')
        }
      }
    })
  }

  const handleContact = (order) => {
    setCurrentOrder(order)
    setContactModal(true)
  }

  const handleViewDetail = (order) => {
    setCurrentOrder(order)
    setDetailModal(true)
  }

  const handleConfirmContact = async (type) => {
    const record = {
      masterId: currentOrder.masterId,
      masterName: currentOrder.masterName,
      phone: '138****8888',
      contactTime: new Date().toLocaleString(),
      type,
      content: type === 'phone' ? '电话联系师傅' : '发送消息给师傅'
    }
    await dispatch(addContactRecord(record))
    message.success(type === 'phone' ? '正在拨打师傅电话...' : '消息已发送')
    setContactModal(false)
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id) => (
        <span style={{ fontFamily: 'monospace', color: '#1890ff' }}>{id}</span>
      )
    },
    {
      title: '服务项目',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 120,
      render: (name) => (
        <Tag color="blue" icon={<FileTextOutlined />}>{name}</Tag>
      )
    },
    {
      title: '预约信息',
      key: 'info',
      render: (_, record) => (
        <div>
          <p style={{ margin: 0 }}>
            <ClockCircleOutlined style={{ color: '#1890ff' }} /> {record.appointmentTime}
          </p>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: 12 }}>
            <EnvironmentOutlined /> {record.address}
          </p>
        </div>
      )
    },
    {
      title: '服务师傅',
      dataIndex: 'masterName',
      key: 'masterName',
      width: 100
    },
    {
      title: '金额',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => (
        <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 16 }}>¥{price}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusInfo = orderStatusMap[status]
        return (
          <Badge
            status={statusInfo.color}
            text={statusInfo.text}
          />
        )
      }
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
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
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(record)}
            >
              取消
            </Button>
          )}
          {(record.status === 'pending' || record.status === 'confirmed') && (
            <Button
              type="link"
              size="small"
              icon={<PhoneOutlined />}
              onClick={() => handleContact(record)}
            >
              联系
            </Button>
          )}
          {record.status === 'completed' && (
            <Button type="link" size="small" icon={<CheckCircleOutlined />}>
              评价
            </Button>
          )}
        </Space>
      )
    }
  ]

  const statsCards = [
    { title: '全部订单', value: orderStats.total, color: '#1890ff', icon: <FileTextOutlined /> },
    { title: '待确认', value: orderStats.pending, color: '#faad14', icon: <ClockCircleOutlined /> },
    { title: '进行中', value: orderStats.confirmed, color: '#52c41a', icon: <AuditOutlined /> },
    { title: '已完成', value: orderStats.completed, color: '#52c41a', icon: <SmileOutlined /> },
    { title: '累计消费', value: `¥${orderStats.totalAmount}`, color: '#f5222d', icon: <span>💰</span> }
  ]

  return (
    <PageContainer loading={loading} empty={!loading && filteredOrders.length === 0}>
      <div className="my-orders-page">
        <div className="stats-section">
          <Row gutter={[16, 16]}>
            {statsCards.map((stat, index) => (
              <Col xs={24} sm={12} md={8} lg={4.8} key={index}>
                <Card className="stat-card" bordered={false}>
                  <div className="stat-icon" style={{ background: stat.color + '20', color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <p className="stat-title">{stat.title}</p>
                    <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="page-header">
          <h2>我的预约订单</h2>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            size="large"
          >
            <Option value="all">全部订单</Option>
            <Option value="pending">待确认</Option>
            <Option value="confirmed">已确认</Option>
            <Option value="completed">已完成</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
        </div>

        <Card bordered={false} className="table-card">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`,
              showQuickJumper: true
            }}
          />
        </Card>

        <Modal
          title="订单详情"
          open={detailModal}
          onCancel={() => setDetailModal(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModal(false)}>
              关闭
            </Button>
          ]}
          width={600}
        >
          {currentOrder && (
            <div className="order-detail">
              <div className="detail-header">
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                  {currentOrder.id}
                </Tag>
                <Badge
                  status={orderStatusMap[currentOrder.status].color}
                  text={orderStatusMap[currentOrder.status].text}
                />
              </div>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="服务项目">{currentOrder.serviceName}</Descriptions.Item>
                <Descriptions.Item label="预约时间">{currentOrder.appointmentTime}</Descriptions.Item>
                <Descriptions.Item label="服务地址">{currentOrder.address}</Descriptions.Item>
                <Descriptions.Item label="联系人">{currentOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{currentOrder.phone}</Descriptions.Item>
                <Descriptions.Item label="服务师傅">{currentOrder.masterName}</Descriptions.Item>
                <Descriptions.Item label="订单金额">
                  <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: 16 }}>
                    ¥{currentOrder.price}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="备注">
                  {currentOrder.remark || '无'}
                </Descriptions.Item>
                <Descriptions.Item label="下单时间">{currentOrder.createTime}</Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>

        <Modal
          title="联系师傅"
          open={contactModal}
          onCancel={() => setContactModal(false)}
          footer={null}
          width={400}
        >
          {currentOrder && (
            <div className="contact-modal">
              <div className="contact-info">
                <p><strong>订单编号：</strong>{currentOrder.id}</p>
                <p><strong>服务师傅：</strong>{currentOrder.masterName}</p>
                <p><strong>服务项目：</strong>{currentOrder.serviceName}</p>
              </div>
              <Space style={{ width: '100%', justifyContent: 'center' }} size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => handleConfirmContact('phone')}
                >
                  拨打电话
                </Button>
                <Button
                  size="large"
                  icon={<PhoneOutlined />}
                  onClick={() => handleConfirmContact('message')}
                >
                  发送消息
                </Button>
              </Space>
            </div>
          )}
        </Modal>
      </div>
    </PageContainer>
  )
}

export default MyOrders
