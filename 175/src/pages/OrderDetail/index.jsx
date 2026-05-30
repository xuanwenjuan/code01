import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Row,
  Col,
  Divider,
  Rate,
  message,
  Space,
  Modal,
  Steps
} from 'antd'
import {
  ArrowLeftOutlined,
  MessageOutlined,
  PhoneOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import { selectOrderById, cancelOrder } from '@/store/slices/orderSlice'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/components/Loading'

const statusMap = {
  0: { text: '待接单', color: 'orange' },
  1: { text: '服务中', color: 'blue' },
  2: { text: '已完成', color: 'green' },
  3: { text: '已取消', color: 'red' }
}

const stepItems = [
  { title: '提交订单', status: 'finish' },
  { title: '师傅接单', status: 'process' },
  { title: '服务中', status: 'wait' },
  { title: '服务完成', status: 'wait' }
]

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, isMaster } = useAuth()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const order = useSelector((state) => selectOrderById(state, id))

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [id])

  useEffect(() => {
    if (!loading && order) {
      const canAccess = isMaster || order.userId === userInfo?.id || order.userPhone === userInfo?.phone
      if (!canAccess) {
        message.error('无权查看该订单')
        navigate('/orders', { replace: true })
      }
    }
  }, [loading, order, userInfo, isMaster, navigate])

  if (loading) return <Loading />

  if (!order) {
    return (
      <div className="container">
        <Card>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 16 }}
          >
            返回
          </Button>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <h3>订单不存在或已被删除</h3>
            <Button type="primary" onClick={() => navigate('/orders')} style={{ marginTop: 16 }}>
              返回订单列表
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const status = statusMap[order.status]

  const getCurrentStep = () => {
    if (order.status === 0) return 0
    if (order.status === 1) return 1
    if (order.status === 2) return 3
    if (order.status === 3) return 0
    return 0
  }

  const handleCancelOrder = () => {
    Modal.confirm({
      title: '确认取消订单',
      content: '确定要取消这个订单吗？取消后无法恢复。',
      okText: '确认取消',
      okType: 'danger',
      cancelText: '再想想',
      onOk: () => {
        setActionLoading(true)
        setTimeout(() => {
          dispatch(cancelOrder(parseInt(id)))
          message.success('订单已取消')
          setActionLoading(false)
        }, 500)
      }
    })
  }

  const getSteps = () => {
    if (order.status === 3) {
      return [{ title: '订单已取消', status: 'error' }]
    }
    const steps = [...stepItems]
    const current = getCurrentStep()
    return steps.map((step, index) => ({
      ...step,
      status: index < current ? 'finish' : index === current ? 'process' : 'wait'
    }))
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <Card>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 24 }}
        >
          返回
        </Button>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Tag color={status.color} style={{ fontSize: 18, padding: '4px 16px', marginBottom: 16 }}>
            {status.text}
          </Tag>
          <h2 style={{ margin: 0, marginBottom: 8 }}>{order.serviceName}</h2>
          <div style={{ color: '#999' }}>订单号：{order.orderNo}</div>
        </div>

        {order.status !== 3 && (
          <div style={{ marginBottom: 32, padding: '0 40px' }}>
            <Steps current={getCurrentStep()} items={getSteps()} />
          </div>
        )}

        <Divider />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginBottom: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff4d4f' }}>¥{order.price}</div>
            <div style={{ color: '#999' }}>订单金额</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {order.appointmentTime}
            </div>
            <div style={{ color: '#999' }}>预约时间</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {order.userName}
            </div>
            <div style={{ color: '#999' }}>联系人</div>
          </div>
        </div>

        <Divider />

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="服务信息" size="small" className="mb-24">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="服务名称">{order.serviceName}</Descriptions.Item>
                <Descriptions.Item label="预约时间">{order.appointmentTime}</Descriptions.Item>
                <Descriptions.Item label="服务地址">{order.address}</Descriptions.Item>
                <Descriptions.Item label="问题描述">{order.remark || '无'}</Descriptions.Item>
                {order.isEmergency && (
                  <Descriptions.Item label="服务类型">
                    <Tag color="red">紧急疏通</Tag>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="联系人信息" size="small" className="mb-24">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="联系人">{order.userName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{order.userPhone}</Descriptions.Item>
                {order.masterName && (
                  <Descriptions.Item label="服务师傅">{order.masterName}</Descriptions.Item>
                )}
                {order.masterPhone && (
                  <Descriptions.Item label="师傅电话">{order.masterPhone}</Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>
        </Row>

        <Card title="订单信息" size="small" className="mb-24">
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
            <Descriptions.Item label="下单时间">{order.createTime}</Descriptions.Item>
            <Descriptions.Item label="订单金额">
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{order.price}</span>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={status.color}>{status.text}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {order.feedback && (
          <Card title="服务评价" size="small" style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 8 }}>
              <Rate disabled value={order.feedback.rating} />
              <span style={{ marginLeft: 8 }}>{order.feedback.rating} 分</span>
            </div>
            <p style={{ margin: 0 }}>{order.feedback.content}</p>
            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
              评价时间：{order.feedback.createTime}
            </div>
          </Card>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Space>
            {order.status === 0 && (
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleCancelOrder}
                loading={actionLoading}
              >
                取消订单
              </Button>
            )}
            {order.status === 2 && !order.feedback && (
              <Button
                type="primary"
                icon={<MessageOutlined />}
                onClick={() => navigate(`/feedback/${order.id}`)}
              >
                去评价
              </Button>
            )}
            {order.masterPhone && (
              <Button
                icon={<PhoneOutlined />}
                onClick={() => message.info(`正在拨打 ${order.masterPhone}...`)}
              >
                联系师傅
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default OrderDetail
