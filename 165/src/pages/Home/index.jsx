import { Carousel, Row, Col, Button, Modal } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import ServiceCard from '@/components/Common/ServiceCard'
import WorkerCard from '@/components/Common/WorkerCard'
import CategoryIcon from '@/components/Common/CategoryIcon'
import { setShowPromotionModal } from '@/store/slices/appSlice'
import './style.css'

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { banners, showPromotionModal, currentCity } = useSelector(state => state.app)
  const { categories } = useSelector(state => state.service)
  const { services, workers } = useSelector(state => state.service)

  const hotServices = services.slice(0, 8)
  const recommendWorkers = workers.slice(0, 4)

  const handleClosePromotion = () => {
    dispatch(setShowPromotionModal(false))
  }

  return (
    <div className="home-page">
      <section className="banner-section">
        <div className="container">
          <Carousel autoplay effect="fade">
            {banners.map(banner => (
              <div key={banner.id} onClick={() => navigate(banner.link)}>
                <div className="banner-item">
                  <img src={banner.image} alt={banner.title} />
                  <div className="banner-content">
                    <h2>{banner.title}</h2>
                    <p>{banner.subtitle}</p>
                    <Button type="primary">立即查看</Button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="section category-section">
        <div className="container">
          <Row gutter={[16, 16]}>
            {categories.map(category => (
              <Col xs={12} sm={8} md={6} lg={3} key={category.id}>
                <CategoryIcon category={category} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">热门家政服务</h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {hotServices.map(service => (
              <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">优质师傅推荐</h2>
            <Button type="link" onClick={() => navigate('/services')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {recommendWorkers.map(worker => (
              <Col xs={24} sm={12} lg={6} key={worker.id}>
                <WorkerCard worker={worker} />
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <Modal
        open={showPromotionModal}
        onCancel={handleClosePromotion}
        footer={null}
        width={480}
        centered
        closable={true}
      >
        <div className="promotion-modal">
          <img
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
            alt="优惠活动"
            style={{ width: '100%', borderRadius: 8 }}
          />
          <div style={{ padding: 24, textAlign: 'center' }}>
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>🎁 新用户专享福利</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>首单立减30元，全城通用</p>
            <Button type="primary" size="large" onClick={() => {
              handleClosePromotion()
              navigate('/services')
            }}>
              立即领取
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home
