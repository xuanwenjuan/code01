import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Empty, Popconfirm, message } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { removeFavorite, clearFavorite } from '@/store/favoriteSlice'
import { addToCart } from '@/store/cartSlice'
import './index.scss'

const Favorites = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items } = useSelector(state => state.favorite)

  const handleRemove = (productId) => {
    dispatch(removeFavorite(productId))
    message.success('已取消收藏')
  }

  const handleClearAll = () => {
    dispatch(clearFavorite())
    message.success('已清空收藏')
  }

  const handleAddToCart = (product) => {
    dispatch(addToCart({
      productId: product.id,
      product,
      quantity: 1,
      spec: product.specs?.[0]?.name || '默认'
    }))
    message.success('已加入购物车')
  }

  if (items.length === 0) {
    return (
      <div className="favorites-page">
        <div className="empty-state">
          <Empty description="暂无收藏商品">
            <Button type="primary" onClick={() => navigate('/products')}>
              去逛逛
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h2>我的收藏 ({items.length})</h2>
        <Popconfirm
          title="确定要清空所有收藏吗？"
          onConfirm={handleClearAll}
        >
          <Button danger>清空收藏</Button>
        </Popconfirm>
      </div>

      <Row gutter={[16, 16]}>
        {items.map(product => (
          <Col xs={12} sm={8} md={6} lg={4} xl={3} key={product.id}>
            <Card
              hoverable
              cover={
                <div className="cover-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="product-image"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    className="remove-btn"
                    onClick={() => handleRemove(product.id)}
                  />
                </div>
              }
              actions={[
                <Button
                  key="cart"
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleAddToCart(product)}
                  block
                >
                  加入购物车
                </Button>
              ]}
            >
              <Card.Meta
                title={
                  <div className="product-name" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.name}
                  </div>
                }
                description={
                  <div className="product-price">
                    <span className="current">¥{product.price.toFixed(1)}</span>
                    {product.originalPrice && (
                      <span className="original">¥{product.originalPrice.toFixed(1)}</span>
                    )}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default Favorites
