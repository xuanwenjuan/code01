import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Row, Col, Button, Carousel, Tag } from 'antd'
import { RightOutlined, HistoryOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { fetchIncenses, fetchAncientIncenses, fetchNewIncenses, setCategory } from '@/store/slices/incenseSlice'
import { fetchCraftCases } from '@/store/slices/craftSlice'
import { fetchInheritors } from '@/store/slices/inheritorSlice'
import IncenseCard from '@/components/IncenseCard'
import PageLoading from '@/components/PageLoading'
import PageError from '@/components/PageError'
import './index.css'

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { list, ancientList, newList, categories, currentCategory, status, error } = useSelector(state => state.incense)
  const { list: craftList, status: craftStatus } = useSelector(state => state.craft)
  const { list: inheritorList, status: inheritorStatus } = useSelector(state => state.inheritor)

  useEffect(() => {
    dispatch(fetchIncenses('all'))
    dispatch(fetchAncientIncenses())
    dispatch(fetchNewIncenses())
    dispatch(fetchCraftCases())
    dispatch(fetchInheritors())
  }, [dispatch])

  const handleCategoryClick = (categoryId) => {
    dispatch(setCategory(categoryId))
    dispatch(fetchIncenses(categoryId))
  }

  if (status === 'loading') return <PageLoading />
  if (status === 'failed') return <PageError onRetry={() => dispatch(fetchIncenses('all'))} />

  const carouselData = [
    {
      title: '香道千年，韵味悠长',
      subtitle: '传承古法技艺，品味东方雅致',
      image: 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=1600&h=500&fit=crop'
    },
    {
      title: '古法合香，匠心独运',
      subtitle: '精选天然香料，手工制作精品',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&h=500&fit=crop'
    },
    {
      title: '香韵文化，薪火相传',
      subtitle: '非遗传承人讲述香道故事',
      image: 'https://images.unsplash.com/photo-1599637047475-7e8093e06cba?w=1600&h=500&fit=crop'
    }
  ]

  return (
    <div className="home-page">
      <Carousel autoplay className="home-carousel">
        {carouselData.map((item, index) => (
          <div key={index} className="carousel-item">
            <img src={item.image} alt={item.title} />
            <div className="carousel-content">
              <h1>{item.title}</h1>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="home-section">
        <div className="section-header">
          <h2>香品品类</h2>
          <p>按品类筛选，找到你喜欢的香</p>
        </div>
        <div className="category-list">
          {categories.map(category => (
            <div
              key={category.id}
              className={`category-item ${currentCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2>古法香品</h2>
          <div className="section-more" onClick={() => navigate('/incense?type=ancient')}>
            查看更多 <RightOutlined />
          </div>
        </div>
        <Row gutter={[24, 24]}>
          {ancientList.slice(0, 4).map(incense => (
            <Col key={incense.id} xs={24} sm={12} md={8} lg={6}>
              <IncenseCard incense={incense} />
            </Col>
          ))}
        </Row>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2>新品推荐</h2>
          <div className="section-more" onClick={() => navigate('/incense?type=new')}>
            查看更多 <RightOutlined />
          </div>
        </div>
        <Row gutter={[24, 24]}>
          {newList.slice(0, 4).map(incense => (
            <Col key={incense.id} xs={24} sm={12} md={8} lg={6}>
              <IncenseCard incense={incense} />
            </Col>
          ))}
        </Row>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2>香道技艺</h2>
          <p>探索传统香道制作技艺</p>
        </div>
        <Row gutter={[24, 24]}>
          {craftList.slice(0, 6).map(craft => (
            <Col key={craft.id} xs={24} sm={12} md={8}>
              <div className="craft-card" onClick={() => navigate(`/incense`)}>
                <div className="craft-cover">
                  <img src={craft.coverImage} alt={craft.title} />
                  <Tag color="blue" className="craft-tag">{craft.difficulty}</Tag>
                </div>
                <div className="craft-content">
                  <h3>{craft.title}</h3>
                  <p>{craft.description}</p>
                  <div className="craft-meta">
                    <span><HistoryOutlined /> {craft.duration}</span>
                    <span>{craft.steps}个步骤</span>
                    <span><TrophyOutlined /> {craft.popularity}人学习</span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="home-section">
        <div className="section-header">
          <h2>非遗传承人</h2>
          <p>匠心传承，香道永续</p>
        </div>
        <Row gutter={[24, 24]}>
          {inheritorList.map(inheritor => (
            <Col key={inheritor.id} xs={24} sm={12} md={8}>
              <div className="inheritor-card">
                <div className="inheritor-avatar">
                  <img src={inheritor.avatar} alt={inheritor.name} />
                </div>
                <div className="inheritor-info">
                  <h3>{inheritor.name}</h3>
                  <Tag color="gold">{inheritor.title}</Tag>
                  <p className="inheritor-desc">{inheritor.description}</p>
                  <Button type="primary" size="small" onClick={() => navigate(`/incense`)}>
                    查看作品
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default Home
