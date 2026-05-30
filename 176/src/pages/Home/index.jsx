import React, { useState, useEffect } from 'react'
import { Row, Col, Select, Card, Carousel, Tag, Button, Typography, message, Alert } from 'antd'
import {
  BookOutlined,
  StarOutlined,
  ShoppingBagOutlined,
  TshirtOutlined,
  CoffeeOutlined,
  HighlightOutlined,
  EnvironmentOutlined,
  FireOutlined,
  GiftOutlined,
  SmileOutlined,
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../../components/Product/ProductCard'
import Loading from '../../components/Common/Loading'
import EmptyState from '../../components/Common/EmptyState'
import { setSelectedCampus, setSelectedCategory, getFilteredProducts, setLoading } from '../../store/productSlice'

const { Title, Paragraph, Text } = Typography
const { Option } = Select

const iconMap = {
  BookOutlined: <BookOutlined style={{ fontSize: '24px' }} />,
  StarOutlined: <StarOutlined style={{ fontSize: '24px' }} />,
  ShoppingBagOutlined: <ShoppingBagOutlined style={{ fontSize: '24px' }} />,
  TshirtOutlined: <TshirtOutlined style={{ fontSize: '24px' }} />,
  CoffeeOutlined: <CoffeeOutlined style={{ fontSize: '24px' }} />,
  HighlightOutlined: <HighlightOutlined style={{ fontSize: '24px' }} />,
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { campuses, selectedCampus, categories, packages, loading, products } = useSelector(
    (state) => state.product
  )
  const { isLoggedIn, currentUser } = useSelector((state) => state.user)
  const filteredProducts = useSelector(getFilteredProducts)
  const [activeCategory, setActiveCategory] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    dispatch(setLoading(true))
    const timer = setTimeout(() => {
      dispatch(setLoading(false))
    }, 800)
    return () => clearTimeout(timer)
  }, [dispatch])

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      setShowWelcome(true)
      const timer = setTimeout(() => setShowWelcome(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, currentUser])

  const handleCampusChange = (value) => {
    const campus = campuses.find((c) => c.id === value)
    dispatch(setSelectedCampus(campus))
    message.success(`已切换到${campus.name}`)
  }

  const handleCategoryClick = (categoryId) => {
    const newCategory = activeCategory === categoryId ? null : categoryId
    setActiveCategory(newCategory)
    dispatch(setSelectedCategory(newCategory))
    if (newCategory) {
      const category = categories.find((c) => c.id === categoryId)
      message.info(`正在查看${category.name}分类`)
    }
  }

  if (loading) {
    return <Loading text="加载中，请稍候..." />
  }

  return (
    <div className="page-container">
      {showWelcome && isLoggedIn && currentUser && (
        <Alert
          message={`欢迎回来，${currentUser.name}！`}
          description="开始探索我们的校园文创产品吧"
          type="success"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <EnvironmentOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
        <span style={{ fontWeight: '500' }}>当前校园：</span>
        <Select
          value={selectedCampus?.id}
          style={{ width: '200px' }}
          onChange={handleCampusChange}
          showSearch
          placeholder="选择校园"
          optionFilterProp="children"
        >
          {campuses.map((campus) => (
            <Option key={campus.id} value={campus.id}>
              {campus.name}
            </Option>
          ))}
        </Select>
        <Text type="secondary">{selectedCampus?.address}</Text>
        {isLoggedIn && (
          <Tag color="blue" style={{ marginLeft: 'auto' }}>
            <SmileOutlined /> {currentUser?.name} [{currentUser?.role === 'designer' ? '设计师' : '普通用户'}]
          </Tag>
        )}
      </div>

      <Carousel
        autoplay
        style={{ marginBottom: '32px', borderRadius: '8px', overflow: 'hidden' }}
        dotPosition="bottom"
      >
        <div>
          <div
            style={{
              height: '300px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#fff',
              padding: '0 20px',
              textAlign: 'center',
            }}
          >
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              校园文创 专属定制
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: '12px', fontSize: '16px', marginBottom: 0 }}>
              让每一件文创都承载校园的记忆
            </Paragraph>
          </div>
        </div>
        <div>
          <div
            style={{
              height: '300px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#fff',
              padding: '0 20px',
              textAlign: 'center',
            }}
          >
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              毕业季特惠
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: '12px', fontSize: '16px', marginBottom: 0 }}>
              定制专属毕业纪念品，留下青春印记
            </Paragraph>
          </div>
        </div>
        <div>
          <div
            style={{
              height: '300px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: '#fff',
              padding: '0 20px',
              textAlign: 'center',
            }}
          >
            <Title level={2} style={{ color: '#fff', margin: 0 }}>
              设计师招募
            </Title>
            <Paragraph style={{ color: '#fff', marginTop: '12px', fontSize: '16px', marginBottom: 0 }}>
              展示你的创意，让更多人看到你的设计
            </Paragraph>
          </div>
        </div>
      </Carousel>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GiftOutlined style={{ color: '#1890ff' }} />
            <span>热门定制套餐</span>
          </div>
        }
        style={{ marginBottom: '32px' }}
      >
        {packages && packages.length > 0 ? (
          <Row gutter={[24, 24]}>
            {packages.map((pkg) => (
              <Col xs={24} sm={12} md={8} key={pkg.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={pkg.name}
                      src={pkg.image}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button type="primary" onClick={() => navigate(`/product/${pkg.products[0]}`)}>
                      立即定制
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{pkg.name}</span>
                        <Tag color="red">{pkg.tag}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ color: '#999', fontSize: '13px', margin: '8px 0' }}>
                          {pkg.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 'bold' }}>
                            ¥{pkg.price}
                          </span>
                          <span style={{ color: '#999', textDecoration: 'line-through' }}>
                            ¥{pkg.originalPrice}
                          </span>
                          <Tag color="green">省{pkg.originalPrice - pkg.price}元</Tag>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState description="暂无套餐" />
        )}
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FireOutlined style={{ color: '#ff4d4f' }} />
            <span>文创产品分类</span>
          </div>
        }
        style={{ marginBottom: '32px' }}
      >
        {categories && categories.length > 0 ? (
          <Row gutter={[16, 16]}>
            {categories.map((category) => (
              <Col xs={12} sm={8} md={4} key={category.id}>
                <div
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: activeCategory === category.id ? '#e6f7ff' : '#fafafa',
                    border: `2px solid ${activeCategory === category.id ? '#1890ff' : 'transparent'}`,
                    boxShadow: activeCategory === category.id ? '0 4px 12px rgba(24, 144, 255, 0.2)' : 'none',
                  }}
                >
                  <div style={{ color: '#1890ff', marginBottom: '8px' }}>
                    {iconMap[category.icon]}
                  </div>
                  <span style={{ fontWeight: '500' }}>{category.name}</span>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState description="暂无分类" />
        )}
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarOutlined style={{ color: '#faad14' }} />
            <span>{activeCategory ? '筛选结果' : '全部产品'}</span>
            <Tag color="blue">{filteredProducts.length} 件商品</Tag>
          </div>
        }
        extra={
          activeCategory && (
            <Button type="link" onClick={() => handleCategoryClick(null)}>
              查看全部
            </Button>
          )
        }
      >
        {filteredProducts.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredProducts.map((product) => (
              <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState
            description={activeCategory ? '该分类下暂无产品' : '暂无产品'}
            actionText={activeCategory ? '查看全部' : undefined}
            onAction={activeCategory ? () => handleCategoryClick(null) : undefined}
          />
        )}
      </Card>
    </div>
  )
}

export default Home
