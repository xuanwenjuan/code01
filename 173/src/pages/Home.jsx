import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Card, Button, Tag, Rate, Avatar, Space, Select } from 'antd'
import { EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { fetchServices, fetchMasters, setCity } from '../store/actions/serviceActions'
import PageContainer from '../components/common/PageContainer'
import { cities } from '../mock'
import './Home.less'

const { Option } = Select

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { services, masters, loading, currentCity } = useSelector(state => state.services)

  useEffect(() => {
    dispatch(fetchServices())
    dispatch(fetchMasters())
  }, [dispatch])

  const handleCityChange = (city) => {
    dispatch(setCity(city))
  }

  return (
    <PageContainer loading={loading}>
      <div className="home-page">
        <div className="location-bar">
          <Space>
            <EnvironmentOutlined style={{ color: '#1890ff' }} />
            <span>当前城市：</span>
            <Select
              value={currentCity}
              onChange={handleCityChange}
              style={{ width: 150 }}
              showSearch
              optionFilterProp="children"
            >
              {cities.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Space>
          <div className="hotline">
            <PhoneOutlined /> 24小时服务热线：<strong>400-888-8888</strong>
          </div>
        </div>

        <div className="banner">
          <div className="banner-content">
            <h1>专业开锁服务</h1>
            <p>24小时上门 · 持证上岗 · 安全可靠</p>
            <Button type="primary" size="large" onClick={() => navigate('/')}>
              立即预约
            </Button>
          </div>
        </div>

        <div className="services-section">
          <h2 className="section-title">开锁服务</h2>
          <Row gutter={[24, 24]}>
            {services.map(service => (
              <Col xs={24} sm={12} md={8} key={service.id}>
                <Card
                  hoverable
                  className="service-card"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.name}</h3>
                  <p className="service-desc">{service.description}</p>
                  <div className="service-footer">
                    <span className="price">¥{service.price}起</span>
                    <Button type="link">查看详情 →</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="masters-section">
          <h2 className="section-title">推荐师傅</h2>
          <Row gutter={[24, 24]}>
            {masters.map(master => (
              <Col xs={24} sm={12} md={6} key={master.id}>
                <Card className="master-card">
                  <div className="master-header">
                    <Avatar src={master.avatar} size={64} />
                    <div className="master-info">
                      <h3>{master.name}</h3>
                      <Rate disabled value={master.rating} />
                      <span className="rating-text">{master.rating}分</span>
                    </div>
                  </div>
                  <div className="master-stats">
                    <div>
                      <strong>{master.experience}年</strong>
                      <span>从业经验</span>
                    </div>
                    <div>
                      <strong>{master.orders}单</strong>
                      <span>累计服务</span>
                    </div>
                  </div>
                  <div className="master-skills">
                    {master.skills.map((skill, index) => (
                      <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                  </div>
                  <p className="master-area">
                    <EnvironmentOutlined /> 服务区域：{master.area}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="features-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div className="feature-item">
                <div className="feature-icon">⏰</div>
                <h3>24小时服务</h3>
                <p>全天候待命，随叫随到</p>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="feature-item">
                <div className="feature-icon">🛡️</div>
                <h3>安全可靠</h3>
                <p>持证上岗，备案登记</p>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="feature-item">
                <div className="feature-icon">💰</div>
                <h3>明码标价</h3>
                <p>价格透明，无隐形消费</p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </PageContainer>
  )
}

export default Home
