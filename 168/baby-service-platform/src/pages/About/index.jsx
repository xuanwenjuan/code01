import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { TeamOutlined, CalendarOutlined, StarOutlined, CustomerServiceOutlined } from '@ant-design/icons'

const About = () => {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>关于我们</h1>
          <p>专业的同城母婴服务预约平台</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow" style={{ marginBottom: 24 }}>
          <h2 className="section-title">平台介绍</h2>
          <p style={{ color: '#666', lineHeight: 2, fontSize: 15 }}>
            母婴服务平台是国内领先的同城母婴服务预约平台，致力于为妈妈和宝宝提供专业、安全、便捷的母婴服务。
            我们严选每一位母婴服务人员，确保服务质量，让每一位妈妈都能享受到专业的月子护理、育儿早教、产后修复等服务。
          </p>
          <p style={{ color: '#666', lineHeight: 2, fontSize: 15 }}>
            平台拥有丰富的母婴服务资源，涵盖月嫂、育儿嫂、催乳、早教、产后修复、小儿推拿等多个服务品类。
            我们秉承"用心服务，关爱母婴"的理念，为千万家庭提供优质的母婴服务体验。
          </p>
        </Card>

        <Card className="card-shadow" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="服务城市"
                  value={50}
                  suffix="+"
                  prefix={<TeamOutlined style={{ color: '#ff6b9d' }} />}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="认证母婴师"
                  value={10000}
                  suffix="+"
                  prefix={<CalendarOutlined style={{ color: '#ff6b9d' }} />}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="服务家庭"
                  value={100}
                  suffix="万+"
                  prefix={<StarOutlined style={{ color: '#ff6b9d' }} />}
                />
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="好评率"
                  value={98}
                  suffix="%"
                  prefix={<CustomerServiceOutlined style={{ color: '#ff6b9d' }} />}
                />
              </div>
            </Col>
          </Row>
        </Card>

        <Card className="card-shadow" style={{ marginBottom: 24 }}>
          <h2 className="section-title">我们的优势</h2>
          <Row gutter={[16, 16]}>
            {[
              { title: '严格筛选', desc: '所有服务人员均经过身份认证、背景调查、技能考核三重筛选' },
              { title: '专业培训', desc: '定期组织专业培训，确保服务人员技能水平持续提升' },
              { title: '安全保障', desc: '全程保险保障，服务过程可追溯，让您安心无忧' },
              { title: '价格透明', desc: '明码标价，无隐形消费，让您消费明明白白' },
              { title: '售后无忧', desc: '7x24小时客服支持，有任何问题随时为您解决' },
              { title: '个性化匹配', desc: '根据您的需求，智能匹配最适合的服务人员' }
            ].map((item, index) => (
              <Col xs={24} md={8} key={index}>
                <Card size="small" className="hover-scale">
                  <h3 style={{ fontSize: 16, marginBottom: 8, color: '#ff6b9d' }}>{item.title}</h3>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: 0 }}>{item.desc}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card className="card-shadow">
          <h2 className="section-title">联系我们</h2>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div style={{ padding: '20px 0' }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>客服热线</h3>
                <p style={{ fontSize: 24, color: '#ff6b9d', fontWeight: 700, marginBottom: 8 }}>400-123-4567</p>
                <p style={{ color: '#666' }}>服务时间：9:00 - 21:00</p>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '20px 0' }}>
                <h3 style={{ fontSize: 16, marginBottom: 16 }}>商务合作</h3>
                <p style={{ color: '#666', marginBottom: 8 }}>邮箱：business@baby.com</p>
                <p style={{ color: '#666', marginBottom: 8 }}>地址：北京市朝阳区xxx大厦</p>
                <p style={{ color: '#666' }}>邮编：100000</p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}

export default About
