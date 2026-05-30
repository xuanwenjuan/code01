import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Typography, Space, Input } from 'antd'
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWorks } from '@/store/slices/worksSlice'
import { fetchTutorials } from '@/store/slices/tutorialsSlice'
import { mockCategories } from '@/mock/data'
import WorkCard from '@/components/WorkCard'
import TutorialCard from '@/components/TutorialCard'
import StatusHandler from '@/components/StatusHandler'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchText, setSearchText] = useState('')
  const { filteredWorks, status: worksStatus, error: worksError } = useSelector(state => state.works)
  const { filteredTutorials, status: tutorialsStatus } = useSelector(state => state.tutorials)

  useEffect(() => {
    const filters = {}
    if (activeCategory !== 'all') {
      filters.category = activeCategory
    }
    if (searchText) {
      filters.search = searchText
    }
    dispatch(fetchWorks(filters))
    dispatch(fetchTutorials({ isRecommended: true }))
  }, [dispatch, activeCategory, searchText])

  const recommendedTutorials = filteredTutorials.filter(t => t.isRecommended).slice(0, 4)
  const hotWorks = [...filteredWorks].sort((a, b) => b.likes - a.likes).slice(0, 4)

  return (
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #389e0d 0%, #52c41a 100%)',
        padding: '60px 48px',
        marginBottom: 32,
        borderRadius: 12,
        color: 'white'
      }}>
        <Row align="middle">
          <Col span={14}>
            <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
              传承千年竹编技艺
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 24 }}>
              探索中国传统竹编艺术的魅力，从入门到精通，与万千竹编爱好者一起，
              学习、创作、分享，让古老技艺在现代绽放新光彩。
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/tutorials')}>
                开始学习
              </Button>
              <Button ghost size="large" onClick={() => navigate('/works')}>
                浏览作品
              </Button>
            </Space>
          </Col>
          <Col span={10}>
            <img 
              src="https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=500&h=300&fit=crop" 
              alt="竹编"
              style={{ borderRadius: 12, width: '100%' }}
            />
          </Col>
        </Row>
      </div>

      <div style={{ marginBottom: 32 }}>
        <Title level={3} style={{ marginBottom: 20 }}>
          竹编品类
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              className="card-hover"
              hoverable
              onClick={() => { setActiveCategory('all'); setSearchText('') }}
              style={{ 
                background: activeCategory === 'all' ? '#f6ffed' : 'white',
                borderColor: activeCategory === 'all' ? '#52c41a' : '#d9d9d9',
                textAlign: 'center',
                padding: '24px 0'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
              <div style={{ fontSize: 18, fontWeight: 500 }}>全部</div>
              <div style={{ color: '#888', fontSize: 14 }}>浏览所有竹编作品</div>
            </Card>
          </Col>
          {mockCategories.map(category => (
            <Col xs={24} sm={12} md={8} key={category.id}>
              <Card 
                className="card-hover"
                hoverable
                onClick={() => { setActiveCategory(category.id); setSearchText('') }}
                style={{ 
                  background: activeCategory === category.id ? '#f6ffed' : 'white',
                  borderColor: activeCategory === category.id ? '#52c41a' : '#d9d9d9',
                  textAlign: 'center',
                  padding: '24px 0'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{category.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>{category.name}</div>
                <div style={{ color: '#888', fontSize: 14 }}>{category.description}</div>
                <div style={{ color: '#52c41a', fontSize: 12, marginTop: 8 }}>{category.count} 件作品</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>热门作品</Title>
          <Button type="link" onClick={() => navigate('/works')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>
        <StatusHandler status={worksStatus} error={worksError} data={hotWorks}>
          <Row gutter={[16, 16]}>
            {hotWorks.map(work => (
              <Col xs={24} sm={12} lg={6} key={work.id}>
                <WorkCard work={work} />
              </Col>
            ))}
          </Row>
        </StatusHandler>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>推荐教程</Title>
          <Button type="link" onClick={() => navigate('/tutorials')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>
        <StatusHandler status={tutorialsStatus} data={recommendedTutorials}>
          <Row gutter={[16, 16]}>
            {recommendedTutorials.map(tutorial => (
              <Col xs={24} sm={12} lg={6} key={tutorial.id}>
                <TutorialCard tutorial={tutorial} />
              </Col>
            ))}
          </Row>
        </StatusHandler>
      </div>
    </div>
  )
}

export default Home
