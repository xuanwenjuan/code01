import React, { useMemo } from 'react'
import { Row, Col, Carousel, Button, Statistic } from 'antd'
import { ArrowRightOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import HeritageCard from '../components/HeritageCard'

const Home = () => {
  const navigate = useNavigate()
  const { heritages, categories, topics } = useSelector(state => state.heritage)

  const endangeredHeritages = useMemo(() => 
    heritages.filter(h => h.isEndangered).slice(0, 4)
  , [heritages])

  const hotHeritages = useMemo(() => 
    [...heritages].sort((a, b) => b.views - a.views).slice(0, 8)
  , [heritages])

  const totalStats = useMemo(() => ({
    total: heritages.length,
    worldLevel: heritages.filter(h => h.level === '世界级').length,
    categories: categories.length - 1,
    endangered: heritages.filter(h => h.isEndangered).length
  }), [heritages, categories])

  return (
    <div>
      <div className="hero-banner">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">传承千年文化 · 守护非遗瑰宝</h1>
            <p className="hero-subtitle">
              非遗文化遗产数字化展示平台，汇聚全国优秀非物质文化遗产资源，
              让千年文明在数字时代焕发新生。
            </p>
            <Button type="primary" size="large" onClick={() => navigate('/category')}>
              开始探索 <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ background: 'white', borderRadius: 12, padding: 32, marginBottom: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Row gutter={[32, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="非遗项目总数" value={totalStats.total} suffix="项" valueStyle={{ color: '#d4380d' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="世界级非遗" value={totalStats.worldLevel} suffix="项" valueStyle={{ color: '#1890ff' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="非遗分类" value={totalStats.categories} suffix="类" valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="濒危非遗" value={totalStats.endangered} suffix="项" valueStyle={{ color: '#fa8c16' }} />
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div className="section-title">非遗品类分类</div>
          <Row gutter={[16, 16]}>
            {categories.filter(c => c.id !== 'all').map(category => (
              <Col xs={12} sm={8} md={6} key={category.id}>
                <div
                  onClick={() => navigate(`/category?type=${category.id}`)}
                  style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 12,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>
                    {category.id === 'folk-literature' && '📚'}
                    {category.id === 'traditional-music' && '🎵'}
                    {category.id === 'traditional-dance' && '💃'}
                    {category.id === 'traditional-theater' && '🎭'}
                    {category.id === 'folk-arts' && '🎨'}
                    {category.id === 'traditional-craft' && '🔧'}
                    {category.id === 'traditional-medicine' && '💊'}
                    {category.id === 'folk-custom' && '🎊'}
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{category.name}</div>
                  <div style={{ color: '#999', fontSize: 13 }}>{category.count} 项</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {endangeredHeritages.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div className="section-title">
              濒危非遗
              <Button type="link" onClick={() => navigate('/category?filter=endangered')}>
                查看更多 <ArrowRightOutlined />
              </Button>
            </div>
            <Row gutter={[24, 24]}>
              {endangeredHeritages.map(heritage => (
                <Col xs={24} sm={12} lg={6} key={heritage.id}>
                  <HeritageCard heritage={heritage} />
                </Col>
              ))}
            </Row>
          </div>
        )}

        <div style={{ marginBottom: 48 }}>
          <div className="section-title">
            热门非遗
            <Button type="link" onClick={() => navigate('/category')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            {hotHeritages.slice(0, 4).map(heritage => (
              <Col xs={24} sm={12} lg={6} key={heritage.id}>
                <HeritageCard heritage={heritage} />
              </Col>
            ))}
          </Row>
        </div>

        {topics.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div className="section-title">非遗系列专题</div>
            <Row gutter={[24, 24]}>
              {topics.map(topic => (
                <Col xs={24} md={12} key={topic.id}>
                  <div className="topic-card" onClick={() => navigate(`/topic/${topic.id}`)}>
                    <img src={topic.cover} alt={topic.title} />
                    <div className="topic-overlay">
                      <div className="topic-title">{topic.title}</div>
                      <div className="topic-desc">{topic.description}</div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}

        <div style={{ marginBottom: 48 }}>
          <div className="section-title">精彩推荐</div>
          <Carousel autoplay dotPosition="bottom" style={{ borderRadius: 12, overflow: 'hidden' }}>
            {hotHeritages.slice(0, 4).map(heritage => (
              <div key={heritage.id}>
                <div
                  style={{
                    height: 400,
                    background: `linear-gradient(135deg, rgba(26,26,46,0.7), rgba(15,52,96,0.7)), url(${heritage.cover})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 48,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/heritage/${heritage.id}`)}
                >
                  <div style={{ color: 'white' }}>
                    <h2 style={{ color: 'white', fontSize: 28, marginBottom: 12 }}>{heritage.name}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 12, maxWidth: 600 }}>
                      {heritage.description}
                    </p>
                    <div style={{ display: 'flex', gap: 24 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <EnvironmentOutlined /> {heritage.origin}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarOutlined /> {heritage.heritageTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  )
}

export default Home
