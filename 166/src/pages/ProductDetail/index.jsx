import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row, Col, Image, Button, InputNumber, Rate, Tabs, List, Avatar,
  Empty, Spin, Tag, Breadcrumb, message
} from 'antd'
import {
  ShoppingCartOutlined, HeartOutlined, HeartFilled,
  HomeOutlined, RightOutlined, CheckOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { products, categories, reviews } from '@/mock'
import { addToCart } from '@/store/cartSlice'
import { toggleFavorite, isFavorite } from '@/store/favoriteSlice'
import ProductCard from '@/components/ProductCard'
import './index.scss'

const { TabPane } = Tabs

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedSpec, setSelectedSpec] = useState(null)
  const [activeTab, setActiveTab] = useState('detail')

  const product = products.find(p => p.id === Number(id))
  const isFav = useSelector(state => isFavorite(state, product?.id))
  const category = categories.find(c => c.id === product?.categoryId)
  const relatedProducts = products.filter(p => p.categoryId === product?.categoryId && p.id !== product?.id).slice(0, 4)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
      if (product?.specs?.length) {
        setSelectedSpec(product.specs[0])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [id, product])

  useEffect(() => {
    if (product?.specs?.length > 0 && !selectedSpec) {
      setSelectedSpec(product.specs[0])
    }
  }, [product, selectedSpec])

  const currentPrice = selectedSpec?.price || product?.price || 0

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="empty-container">
        <Empty description="商品不存在" />
        <Button type="primary" onClick={() => navigate('/products')}>
          返回商品列表
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      productId: product.id,
      product,
      quantity,
      spec: selectedSpec?.name || '默认'
    }))
    message.success('已加入购物车')
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/cart')
  }

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(product))
    message.success(isFav ? '已取消收藏' : '已加入收藏')
  }

  const formatPrice = (price) => {
    const [integer, decimal] = Number(price).toFixed(1).split('.')
    return (
      <span className="detail-price">
        <span className="symbol">¥</span>
        <span className="integer">{integer}</span>
        <span className="decimal">.{decimal}</span>
      </span>
    )
  }

  const renderTags = () => {
    const tags = []
    if (product.tags?.includes('hot')) tags.push(<Tag key="hot" color="red">爆款</Tag>)
    if (product.tags?.includes('new')) tags.push(<Tag key="new" color="blue">新品</Tag>)
    if (product.tags?.includes('seckill')) tags.push(<Tag key="seckill" color="orange">秒杀</Tag>)
    if (product.tags?.includes('organic')) tags.push(<Tag key="organic" color="green">有机</Tag>)
    return tags
  }

  return (
    <div className="product-detail-page">
      <Breadcrumb className="breadcrumb" separator={<RightOutlined />}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">全部商品</Link>
        </Breadcrumb.Item>
        {category && (
          <Breadcrumb.Item>
            <Link to={`/products?category=${category.id}`}>{category.name}</Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="product-main">
        <Row gutter={[32, 24]}>
          <Col xs={24} md={10}>
            <div className="product-gallery">
              <Image
                src={product.image}
                alt={product.name}
                width="100%"
                className="main-image"
              />
            </div>
          </Col>

          <Col xs={24} md={14}>
            <div className="product-info">
              <h1 className="product-title">
                {product.name}
                <div className="product-tags">{renderTags()}</div>
              </h1>

              <div className="product-rating">
                <Rate disabled value={product.rating} />
                <span className="rating-score">{product.rating}</span>
                <span className="review-count">{product.reviews}条评价</span>
                <span className="sales-count">已售{product.sales}</span>
              </div>

              <div className="price-section">
                {formatPrice(currentPrice)}
                {product.originalPrice && (
                  <span className="original-price">¥{product.originalPrice.toFixed(1)}</span>
                )}
              </div>

              {product.specs?.length > 1 && (
                <div className="spec-section">
                  <label className="section-label">规格选择</label>
                  <div className="spec-list">
                    {product.specs.map((spec, index) => (
                      <Button
                        key={index}
                        type={selectedSpec?.name === spec.name ? 'primary' : 'default'}
                        onClick={() => setSelectedSpec(spec)}
                        className="spec-item"
                      >
                        {spec.name} - ¥{spec.price}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="quantity-section">
                <label className="section-label">购买数量</label>
                <div className="quantity-control">
                  <InputNumber
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={setQuantity}
                    size="large"
                  />
                  <span className="stock-info">库存{product.stock}件</span>
                </div>
              </div>

              <div className="action-buttons">
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  className="cart-btn"
                >
                  加入购物车
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleBuyNow}
                  className="buy-btn"
                >
                  立即购买
                </Button>
                <Button
                  size="large"
                  icon={isFav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                  className="favorite-btn"
                >
                  {isFav ? '已收藏' : '收藏'}
                </Button>
              </div>

              <div className="service-section">
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 新鲜直达</span>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 品质保证</span>
                <span><CheckOutlined style={{ color: '#52c41a' }} /> 7天无理由退换</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <div className="product-detail">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="商品详情" key="detail">
            <div className="detail-content">
              <h3>商品介绍</h3>
              <p>{product.description}</p>
              <div className="detail-images">
                <Image src={product.image} width={300} />
                <Image src={product.image} width={300} />
              </div>
            </div>
          </TabPane>
          <TabPane tab={`用户评价(${reviews.length})`} key="reviews">
            <div className="reviews-content">
              {reviews.length > 0 ? (
                <List
                  dataSource={reviews}
                  renderItem={(review) => (
                    <List.Item className="review-item">
                      <List.Item.Meta
                        avatar={<Avatar src={review.userAvatar} />}
                        title={
                          <div className="review-header">
                            <span className="reviewer-name">{review.userName}</span>
                            <Rate disabled value={review.rating} size="small" />
                            <span className="review-spec">规格：{review.spec}</span>
                          </div>
                        }
                        description={
                          <div className="review-body">
                            <p className="review-content">{review.content}</p>
                            {review.images?.length > 0 && (
                              <div className="review-images">
                                {review.images.map((img, idx) => (
                                  <Image key={idx} src={img} width={80} height={80} />
                                ))}
                              </div>
                            )}
                            <span className="review-time">{review.createTime}</span>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无评价" />
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h3 className="section-title">相关推荐</h3>
          <Row gutter={[16, 16]}>
            {relatedProducts.map(p => (
              <Col xs={12} sm={8} md={6} lg={6} key={p.id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
