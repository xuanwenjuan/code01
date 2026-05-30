import { useEffect, useState } from 'react'
import { Carousel, Row, Col, Button, Tabs } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTypes, filterTypes } from '@/store/slices/typeSlice'
import { fetchRecommendedWorks } from '@/store/slices/workSlice'
import { fetchArtisans } from '@/store/slices/artisanSlice'
import { mockCarouselData } from '@/mock'
import TypeCard from '@/components/TypeCard'
import WorkCard from '@/components/WorkCard'
import ArtisanCard from '@/components/ArtisanCard'
import Loading from '@/components/Loading'
import Empty from '@/components/Empty'
import './index.css'

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { filteredList, categories } = useSelector(state => state.types)
  const { recommended } = useSelector(state => state.works)
  const { list: artisans } = useSelector(state => state.artisans)
  const { loading } = useSelector(state => state.ui)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    dispatch(fetchTypes())
    dispatch(fetchRecommendedWorks())
    dispatch(fetchArtisans())
  }, [dispatch])

  useEffect(() => {
    if (categories.length > 0) {
      dispatch(filterTypes({ category: activeCategory, isClassic: activeCategory === '经典活字' ? true : activeCategory === '复刻活字' ? false : undefined }))
    }
  }, [activeCategory, categories, dispatch])

  const classicTypes = filteredList.filter(t => t.isClassic).slice(0, 4)
  const modernTypes = filteredList.filter(t => !t.isClassic).slice(0, 4)

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: '经典活字', label: '经典活字' },
    { key: '复刻活字', label: '复刻活字' }
  ]

  if (loading) return <Loading />

  return (
    <div className="home-page">
      <Carousel autoplay className="home-carousel">
        {mockCarouselData.map(item => (
          <div key={item.id}>
            <div className="carousel-item" style={{ backgroundImage: `url(${item.image})` }}>
              <div className="carousel-overlay">
                <div className="carousel-content">
                  <h1>{item.title}</h1>
                  <p>{item.subtitle}</p>
                  <Button type="primary" size="large" onClick={() => navigate(item.link)}>
                    立即探索 <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">活字品类</h2>
          <div className="section-tabs">
            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              items={tabItems}
              size="small"
            />
          </div>
          <Button type="link" onClick={() => navigate('/types')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>

        {activeCategory === 'all' ? (
          <>
            <div className="subsection">
              <h3 className="subsection-title">
                <span className="title-badge gold">经典</span>
                经典活字
              </h3>
              {classicTypes.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {classicTypes.map(type => (
                    <Col key={type.id} xs={24} sm={12} md={6}>
                      <TypeCard type={type} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="暂无经典活字" />
              )}
            </div>

            <div className="subsection">
              <h3 className="subsection-title">
                <span className="title-badge blue">复刻</span>
                复刻活字
              </h3>
              {modernTypes.length > 0 ? (
                <Row gutter={[24, 24]}>
                  {modernTypes.map(type => (
                    <Col key={type.id} xs={24} sm={12} md={6}>
                      <TypeCard type={type} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty description="暂无复刻活字" />
              )}
            </div>
          </>
        ) : (
          filteredList.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredList.slice(0, 8).map(type => (
                <Col key={type.id} xs={24} sm={12} md={6}>
                  <TypeCard type={type} />
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无相关活字品类" />
          )
        )}
      </section>

      <section className="home-section gray-bg">
        <div className="section-header">
          <h2 className="section-title">推荐作品</h2>
          <Button type="link" onClick={() => navigate('/works')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>
        {recommended.length > 0 ? (
          <Row gutter={[24, 24]}>
            {recommended.map(work => (
              <Col key={work.id} xs={24} sm={12} md={8}>
                <WorkCard work={work} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无推荐作品" />
        )}
      </section>

      <section className="home-section">
        <div className="section-header">
          <h2 className="section-title">非遗传承人</h2>
          <Button type="link" onClick={() => navigate('/artisans')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>
        {artisans.length > 0 ? (
          <Row gutter={[24, 24]}>
            {artisans.map(artisan => (
              <Col key={artisan.id} xs={24} sm={12} md={8}>
                <ArtisanCard artisan={artisan} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无传承人信息" />
        )}
      </section>

      <section className="home-section banner-section">
        <div className="banner-content">
          <h2>探索活字印刷的奥秘</h2>
          <p>从选材到装帧，完整了解木活字印刷的工艺流程</p>
          <Button type="primary" size="large" onClick={() => navigate('/technique')}>
            了解技艺流程 <ArrowRightOutlined />
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
