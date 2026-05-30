import { useState } from 'react'
import { Row, Col, Carousel, Button, Card, Tag, Input, Select, message, Avatar } from 'antd'
import { SearchOutlined, PhoneOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ServiceCard from '@/components/ServiceCard'
import EmptyState from '@/components/EmptyState'
import { masters } from '@/mock/data'

const { Search } = Input
const { Option } = Select

const categories = ['全部', '厨房', '卫生间', '主管道']

const bannerData = [
  {
    id: 1,
    title: '专业管道疏通服务',
    subtitle: '30分钟快速上门，不通不收费',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&h=400&fit=crop',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: '紧急疏通服务',
    subtitle: '24小时全天候服务，随时响应',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=400&fit=crop',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: '专业师傅团队',
    subtitle: '持证上岗，经验丰富，服务有保障',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=400&fit=crop',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
]

function Home() {
  const navigate = useNavigate()
  const { services } = useSelector((state) => state.service)
  const [activeCategory, setActiveCategory] = useState('全部')
  const [searchText, setSearchText] = useState('')

  const filteredServices = services.filter((s) => {
    const matchCategory = activeCategory === '全部' || s.category === activeCategory
    const matchSearch =
      !searchText ||
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.description.toLowerCase().includes(searchText.toLowerCase())
    return matchCategory && matchSearch
  })

  const handleEmergency = () => {
    message.info('紧急疏通热线：400-888-8888\n我们将在30分钟内安排师傅上门！')
  }

  return (
    <div>
      <Carousel autoplay effect="fade" style={{ marginBottom: 32 }}>
        {bannerData.map((banner) => (
          <div key={banner.id}>
            <div
              style={{
                height: 400,
                background: banner.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `url(${banner.image}) center/cover`,
                  opacity: 0.3
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: 48, marginBottom: 16, fontWeight: 'bold' }}>{banner.title}</h1>
                <p style={{ fontSize: 24, marginBottom: 32 }}>{banner.subtitle}</p>
                <Button type="primary" size="large" onClick={() => navigate('/home')}>
                  立即预约
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="container" style={{ marginBottom: 32 }}>
        <Card className="card-hover" style={{ marginBottom: 32 }}>
          <Row gutter={16} align="middle">
            <Col span={12}>
              <Search
                placeholder="搜索疏通服务..."
                allowClear
                size="large"
                icon={<SearchOutlined />}
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col span={8}>
              <Select
                defaultValue="全部"
                size="large"
                style={{ width: '100%' }}
                onChange={setActiveCategory}
              >
                {categories.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Button
                type="danger"
                size="large"
                icon={<ThunderboltOutlined />}
                block
                className="emergency-btn"
                onClick={handleEmergency}
              >
                紧急疏通
              </Button>
            </Col>
          </Row>
        </Card>

        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          {categories.map((cat) => (
            <Tag.CheckableTag
              key={cat}
              checked={activeCategory === cat}
              onChange={() => setActiveCategory(cat)}
              style={{ padding: '8px 16px', fontSize: 14 }}
            >
              {cat}
            </Tag.CheckableTag>
          ))}
        </div>

        <h2 style={{ marginBottom: 24 }}>热门服务</h2>
        {filteredServices.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredServices.map((service) => (
              <Col key={service.id} xs={24} sm={12} md={8}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState description="暂无符合条件的服务" />
        )}

        <div style={{ marginTop: 48 }}>
          <h2 style={{ marginBottom: 24 }}>专业师傅团队</h2>
          <Row gutter={[24, 24]}>
            {masters.map((master) => (
              <Col key={master.id} xs={24} sm={12} md={8}>
                <Card className="card-hover">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <Avatar
                      src={master.avatar}
                      size={64}
                      style={{ marginRight: 16 }}
                    />
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                        {master.name}
                        <Tag
                          color={master.status === 'online' ? 'green' : 'orange'}
                          style={{ marginLeft: 8 }}
                        >
                          {master.status === 'online' ? '在线' : '忙碌'}
                        </Tag>
                      </div>
                      <div style={{ color: '#666' }}>
                        从业{master.experience}年 · 已完成{master.orderCount}单
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    {master.skill.map((s, i) => (
                      <Tag key={i} color="blue">
                        {s}
                      </Tag>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>评分：⭐ {master.rating}</span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PhoneOutlined />}
                      disabled={master.status !== 'online'}
                    >
                      联系师傅
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Home
