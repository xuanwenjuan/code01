import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Tag, Input, Space, Avatar, Carousel, FloatButton } from 'antd'
import { SearchOutlined, PlayCircleOutlined, HeartOutlined, EyeOutlined, RightOutlined, BulbOutlined } from '@ant-design/icons'
import { fetchMaterials, fetchWorks, fetchTutorials, fetchInheritors, fetchEcoKnowledge } from '../store/slices/dataSlice'
import { categories } from '../data/mockData'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import EcoKnowledgeModal from '../components/EcoKnowledgeModal'

const { Search } = Input
const { Meta } = Card

const Home = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { materials, works, tutorials, inheritors, ecoKnowledge, loading } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [ecoModalVisible, setEcoModalVisible] = useState(false)
  const [showEcoTip, setShowEcoTip] = useState(true)

  useEffect(() => {
    dispatch(fetchMaterials())
    dispatch(fetchWorks())
    dispatch(fetchTutorials())
    dispatch(fetchInheritors())
    dispatch(fetchEcoKnowledge())
  }, [dispatch])

  const filteredMaterials = materials.filter(m => {
    const matchCategory = selectedCategory === 'all' || m.category === selectedCategory
    const matchKeyword = !searchKeyword || 
      m.name.includes(searchKeyword) || 
      m.description.includes(searchKeyword)
    return matchCategory && matchKeyword
  })

  const classicWorks = works.filter(w => w.type === 'classic').slice(0, 4)
  const innovationWorks = works.filter(w => w.type === 'innovation').slice(0, 4)
  const recommendedTutorials = tutorials.slice(0, 3)

  const carouselImages = [
    {
      title: '草木染 · 传承千年的天然染色技艺',
      subtitle: '从大自然中汲取色彩，用双手创造艺术',
      image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1600&h=500&fit=crop'
    },
    {
      title: '探索自然的色彩奥秘',
      subtitle: '板蓝根、红花、紫草...每一种植物都是大自然的馈赠',
      image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=1600&h=500&fit=crop'
    },
    {
      title: '与传承人一起学习传统技艺',
      subtitle: '跟随非遗大师，感受草木染的独特魅力',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=500&fit=crop'
    }
  ]

  if (loading.materials || loading.works || loading.tutorials) {
    return <LoadingState />
  }

  return (
    <div>
      <Carousel autoplay effect="fade" style={{ marginBottom: 48 }}>
        {carouselImages.map((item, index) => (
          <div key={index}>
            <div style={{
              height: 400,
              background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${item.image}) center/cover`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <h1 style={{ color: 'white', fontSize: 42, marginBottom: 16, fontWeight: 700 }}>
                {item.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="container">
        <div style={{ marginBottom: 48 }}>
          <div className="section-title">染材品类筛选</div>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <Space size="middle" wrap>
                {categories.map(cat => (
                  <Tag.CheckableTag
                    key={cat.id}
                    checked={selectedCategory === cat.id}
                    onChange={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 20,
                      fontSize: 14,
                      borderColor: selectedCategory === cat.id ? '#2d5a27' : '#d9d9d9',
                      background: selectedCategory === cat.id ? '#2d5a27' : 'white',
                      color: selectedCategory === cat.id ? 'white' : '#333'
                    }}
                  >
                    {cat.name}
                  </Tag.CheckableTag>
                ))}
              </Space>
              <Search
                placeholder="搜索染材..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                style={{ width: 300 }}
              />
            </div>
            <Row gutter={[16, 16]}>
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map(material => (
                  <Col xs={24} sm={12} md={8} lg={6} key={material.id}>
                    <Card
                      hoverable
                      className="card-hover"
                      onClick={() => navigate(`/material/${material.id}`)}
                      bodyStyle={{ padding: 20 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                        <div 
                          className="dye-color-swatch"
                          style={{ background: material.color }}
                        />
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 600 }}>{material.name}</div>
                          <Tag color="green" style={{ marginTop: 4 }}>{material.category}</Tag>
                        </div>
                      </div>
                      <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                        {material.description.substring(0, 50)}...
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                        <span>产地：{material.origin}</span>
                        <span>{material.season}</span>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <EmptyState description="没有找到匹配的染材" />
                </Col>
              )}
            </Row>
          </Space>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>经典染色作品</div>
            <Button type="link" onClick={() => navigate('/works?type=classic')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {classicWorks.map(work => (
              <Col xs={24} sm={12} md={6} key={work.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{
                      height: 200,
                      background: `url(${work.image}) center/cover`,
                      position: 'relative'
                    }}>
                      <Tag color="gold" style={{ position: 'absolute', top: 12, left: 12 }}>
                        经典
                      </Tag>
                    </div>
                  }
                  className="card-hover"
                  onClick={() => navigate(`/work/${work.id}`)}
                >
                  <Meta
                    title={work.title}
                    description={
                      <div>
                        <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                          {work.description.substring(0, 40)}...
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                          <span><EyeOutlined style={{ marginRight: 4 }} />{work.views}</span>
                          <span><HeartOutlined style={{ marginRight: 4 }} />{work.likes}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>创新染色作品</div>
            <Button type="link" onClick={() => navigate('/works?type=innovation')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {innovationWorks.map(work => (
              <Col xs={24} sm={12} md={6} key={work.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{
                      height: 200,
                      background: `url(${work.image}) center/cover`,
                      position: 'relative'
                    }}>
                      <Tag color="purple" style={{ position: 'absolute', top: 12, left: 12 }}>
                        创新
                      </Tag>
                    </div>
                  }
                  className="card-hover"
                  onClick={() => navigate(`/work/${work.id}`)}
                >
                  <Meta
                    title={work.title}
                    description={
                      <div>
                        <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                          {work.description.substring(0, 40)}...
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                          <span><EyeOutlined style={{ marginRight: 4 }} />{work.views}</span>
                          <span><HeartOutlined style={{ marginRight: 4 }} />{work.likes}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>推荐教程</div>
            <Button type="link" onClick={() => navigate('/tutorials')}>
              查看更多 <RightOutlined />
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            {recommendedTutorials.map(tutorial => (
              <Col xs={24} md={8} key={tutorial.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <div style={{
                      height: 200,
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${tutorial.cover}) center/cover`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }} onClick={() => navigate(`/tutorial/${tutorial.id}`)}>
                      <PlayCircleOutlined style={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                      <Tag 
                        color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}
                        style={{ position: 'absolute', top: 12, left: 12 }}
                      >
                        {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
                      </Tag>
                      <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12 }}>
                        {tutorial.duration}
                      </Tag>
                    </div>
                  }
                  onClick={() => navigate(`/tutorial/${tutorial.id}`)}
                >
                  <Meta
                    title={tutorial.title}
                    description={
                      <div>
                        <div style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                          {tutorial.description.substring(0, 60)}...
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar size={24} src={inheritors.find(i => i.name === tutorial.author)?.avatar} />
                            <span style={{ fontSize: 12, color: '#666' }}>{tutorial.author}</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            <EyeOutlined style={{ marginRight: 4 }} />{tutorial.views}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div className="section-title">非遗传承人</div>
          <Row gutter={[24, 24]}>
            {inheritors.map(inheritor => (
              <Col xs={24} md={8} key={inheritor.id}>
                <Card hoverable className="card-hover">
                  <div style={{ display: 'flex', gap: 16 }}>
                    <Avatar size={80} src={inheritor.avatar} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 4, fontSize: 18 }}>{inheritor.name}</h3>
                      <p style={{ color: '#2d5a27', fontSize: 12, marginBottom: 8 }}>{inheritor.title}</p>
                      <p style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                        从业 {inheritor.experience} · 擅长 {inheritor.specialty}
                      </p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {inheritor.achievements.slice(0, 2).map((a, i) => (
                          <Tag key={i} color="gold" style={{ fontSize: 11 }}>{a}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {showEcoTip && ecoKnowledge.length > 0 && (
          <Card 
            style={{ 
              marginBottom: 24, 
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              borderColor: '#b7eb8f'
            }}
            extra={
              <Button 
                type="text" 
                size="small" 
                onClick={() => setShowEcoTip(false)}
                style={{ color: '#389e0d' }}
              >
                收起
              </Button>
            }
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 48 }}>🌿</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#2d5a27', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BulbOutlined style={{ color: '#faad14' }} />
                  环保小知识
                </h3>
                <p style={{ color: '#389e0d', lineHeight: 1.8, marginBottom: 12 }}>
                  {ecoKnowledge[0]?.content}
                </p>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => setEcoModalVisible(true)}
                  style={{ background: '#2d5a27', borderColor: '#2d5a27' }}
                >
                  了解更多环保知识
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <FloatButton
        icon={<span style={{ fontSize: 20 }}>🌿</span>}
        description="环保知识"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setEcoModalVisible(true)}
      />

      <EcoKnowledgeModal 
        visible={ecoModalVisible} 
        onClose={() => setEcoModalVisible(false)} 
      />
    </div>
  )
}

export default Home
