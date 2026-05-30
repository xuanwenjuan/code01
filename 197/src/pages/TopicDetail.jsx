import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Row, Col, Button, Empty } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import HeritageCard from '../components/HeritageCard'

const TopicDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { topics, heritages } = useSelector(state => state.heritage)

  const topic = topics.find(t => t.id === parseInt(id))

  if (!topic) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <Empty description="未找到该专题" />
      </div>
    )
  }

  const topicHeritages = heritages.filter(h => topic.heritageIds.includes(h.id))

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        background: `linear-gradient(135deg, rgba(26,26,46,0.85), rgba(15,52,96,0.85)), url(${topic.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '60px 0'
      }}>
        <div className="container">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 24, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
          >
            返回
          </Button>
          <h1 style={{ color: 'white', fontSize: 36, marginBottom: 16 }}>{topic.title}</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 600 }}>
            {topic.description}
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <div className="section-title">
          专题包含的非遗项目
          <span style={{ fontSize: 14, color: '#999', fontWeight: 'normal' }}>
            共 {topicHeritages.length} 项
          </span>
        </div>

        {topicHeritages.length > 0 ? (
          <Row gutter={[24, 24]}>
            {topicHeritages.map(heritage => (
              <Col xs={24} sm={12} lg={6} key={heritage.id}>
                <HeritageCard heritage={heritage} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="该专题暂无非遗项目" style={{ marginTop: 60 }} />
        )}
      </div>
    </div>
  )
}

export default TopicDetail
