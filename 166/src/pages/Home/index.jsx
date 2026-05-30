import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Carousel, Button, Empty, Modal, Spin } from 'antd'
import { RightOutlined, GiftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { banners, categories, products, seckillProducts } from '@/mock'
import ProductCard from '@/components/ProductCard'
import { useCountdown, useToggle } from '@/hooks'
import './index.scss'

const Home = () => {
  const navigate = useNavigate()
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const hotProducts = products.filter(p => p.tags?.includes('hot')).slice(0, 8)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      const hasSeenPopup = localStorage.getItem('hasSeenNewUserPopup')
      if (!hasSeenPopup) {
        setShowNewUserModal(true)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleCloseNewUserModal = () => {
    setShowNewUserModal(false)
    localStorage.setItem('hasSeenNewUserPopup', 'true')
  }

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.id}`)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className="home-page">
      <section className="banner-section">
        <Carousel autoplay autoplaySpeed={4000} effect="fade">
          {banners.map(banner => (
            <div key={banner.id}>
              <div
                className="banner-slide"
                style={{ backgroundImage: `url(${banner.image})` }}
                onClick={() => navigate(banner.link)}
              >
                <div className="banner-content">
                  <h2>{banner.title}</h2>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      <section className="categories-section">
        <Row gutter={[16, 16]}>
          {categories.map(category => (
            <Col xs={6} sm={4} md={3} key={category.id}>
              <div
                className="category-item card-hover"
                onClick={() => handleCategoryClick(category)}
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <span style={{ color: category.color }}>{category.icon}</span>
                </div>
                <span className="category-name">{category.name}</span>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      <section className="seckill-section">
        <div className="section-header">
          <div className="section-title">
            <span className="title-icon">⚡</span>
            <h2>限时秒杀</h2>
            <div className="countdown">
              <ClockCircleOutlined />
              <span>距结束</span>
              <CountdownTimer endTime={Date.now() + 2 * 60 * 60 * 1000} />
            </div>
          </div>
          <Button type="text" onClick={() => navigate('/products?tag=seckill')}>
            更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {seckillProducts.map(product => (
            <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
              <div className="seckill-item card-hover">
                <div className="seckill-image">
                  <img src={product.image} alt={product.name} />
                  <div className="seckill-tag">
                    {Math.round((product.soldCount / product.totalCount) * 100)}%已抢
                  </div>
                </div>
                <div className="seckill-info">
                  <h3 className="seckill-name">{product.name}</h3>
                  <div className="seckill-price">
                    <span className="current-price">¥{product.seckillPrice}</span>
                    <span className="original-price">¥{product.price}</span>
                  </div>
                  <Button
                    type="primary"
                    block
                    size="small"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    立即抢购
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      <section className="hot-section">
        <div className="section-header">
          <div className="section-title">
            <span className="title-icon">🔥</span>
            <h2>爆款推荐</h2>
          </div>
          <Button type="text" onClick={() => navigate('/products?tag=hot')}>
            更多 <RightOutlined />
          </Button>
        </div>
        {hotProducts.length > 0 ? (
          <Row gutter={[16, 16]}>
            {hotProducts.map(product => (
              <Col xs={12} sm={8} md={6} lg={4} xl={3} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无商品" />
        )}
      </section>

      <Modal
        title={
          <div className="modal-title">
            <GiftOutlined style={{ color: '#faad14', marginRight: 8 }} />
            新人专享福利
          </div>
        }
        open={showNewUserModal}
        onCancel={handleCloseNewUserModal}
        footer={[
          <Button key="close" onClick={handleCloseNewUserModal}>
            稍后再说
          </Button>,
          <Button
            key="claim"
            type="primary"
            onClick={() => {
              handleCloseNewUserModal()
              navigate('/products')
            }}
          >
            立即领取
          </Button>
        ]}
        className="new-user-modal"
      >
        <div className="new-user-content">
          <div className="gift-banner">
            <div className="gift-amount">
              <span className="symbol">¥</span>
              <span className="amount">20</span>
              <span className="label">新人优惠券</span>
            </div>
          </div>
          <p className="gift-desc">
            注册即送20元优惠券，满99元可用！
          </p>
          <div className="gift-rules">
            <p>• 仅限新用户使用</p>
            <p>• 有效期30天</p>
            <p>• 全场通用</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

const CountdownTimer = ({ endTime }) => {
  const { hours, minutes, seconds, isExpired } = useCountdown(endTime)

  if (isExpired) return <span className="expired">已结束</span>

  return (
    <div className="countdown-timer">
      <span className="time-box">{hours}</span>
      <span className="colon">:</span>
      <span className="time-box">{minutes}</span>
      <span className="colon">:</span>
      <span className="time-box">{seconds}</span>
    </div>
  )
}

export default Home
