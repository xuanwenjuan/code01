import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Form,
  Input,
  Rate,
  Button,
  message,
  Descriptions
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { addFeedback } from '@/store/slices/orderSlice'

const { TextArea } = Input

function Feedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const { orders } = useSelector((state) => state.order)
  const order = orders.find((o) => o.id === parseInt(id))

  const handleSubmit = (values) => {
    dispatch(
      addFeedback({
        orderId: parseInt(id),
        feedback: {
          rating: values.rating,
          content: values.content,
          createTime: new Date().toLocaleString()
        }
      })
    )
    message.success('评价提交成功！')
    navigate('/orders')
  }

  if (!order) {
    return (
      <div className="container">
        <Card>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>订单不存在</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <Card>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          返回
        </Button>

        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>服务评价</h2>

        <Card size="small" style={{ marginBottom: 24 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="服务名称">{order.serviceName}</Descriptions.Item>
            <Descriptions.Item label="服务师傅">{order.masterName || '待分配'}</Descriptions.Item>
            <Descriptions.Item label="服务时间">{order.appointmentTime}</Descriptions.Item>
            <Descriptions.Item label="服务费用">
              <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{order.price}</span>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="rating"
            label="服务评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="content"
            label="评价内容"
            rules={[
              { required: true, message: '请输入评价内容' },
              { min: 5, message: '评价内容至少5个字符' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请描述您的服务体验..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" block htmlType="submit">
              提交评价
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Feedback
