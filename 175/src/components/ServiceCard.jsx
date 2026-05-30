import { Card, Tag, Rate, Button } from 'antd'
import { ClockCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCurrentService } from '@/store/slices/serviceSlice'

const { Meta } = Card

function ServiceCard({ service }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(setCurrentService(service))
    navigate(`/service/${service.id}`)
  }

  return (
    <Card
      hoverable
      className="service-card card-hover"
      cover={<img alt={service.name} src={service.image} />}
      onClick={handleClick}
      actions={[
        <span key="rating">
          <Rate disabled value={service.rating} allowHalf style={{ fontSize: 12 }} />
          <span style={{ marginLeft: 4 }}>{service.rating}</span>
        </span>,
        <span key="orders">
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {service.orderCount}单
        </span>,
        <Button type="link" key="order" icon={<ShoppingCartOutlined />}>
          立即预约
        </Button>
      ]}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{service.name}</span>
            <Tag color="blue">{service.category}</Tag>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <div className="price-tag">
              ¥{service.price}
              <span style={{ fontSize: 14, color: '#999', marginLeft: 4 }}>/{service.unit}</span>
            </div>
            <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
              {service.features.map((f, i) => (
                <Tag key={i} color="green" style={{ marginBottom: 4 }}>
                  {f}
                </Tag>
              ))}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default ServiceCard
