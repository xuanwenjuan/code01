import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tag, Button, message } from 'antd'
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/store/cartSlice'
import { toggleFavorite, isFavorite } from '@/store/favoriteSlice'
import './index.scss'

const { Meta } = Card

const ProductCard = ({ product, showActions = true }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isFav = useSelector(state => isFavorite(state, product.id))

  const handleClick = () => {
    navigate(`/product/${product.id}`)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    dispatch(addToCart({
      productId: product.id,
      product,
      quantity: 1,
      spec: product.specs?.[0]?.name || '默认'
    }))
    message.success('已加入购物车')
  }

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    dispatch(toggleFavorite(product))
    message.success(isFav ? '已取消收藏' : '已加入收藏')
  }

  const renderTags = () => {
    const tags = []
    if (product.tags?.includes('hot')) tags.push(<Tag key="hot" color="red">爆款</Tag>)
    if (product.tags?.includes('new')) tags.push(<Tag key="new" color="blue">新品</Tag>)
    if (product.tags?.includes('seckill')) tags.push(<Tag key="seckill" color="orange">秒杀</Tag>)
    if (product.tags?.includes('organic')) tags.push(<Tag key="organic" color="green">有机</Tag>)
    return tags
  }

  const formatPrice = (price) => {
    const [integer, decimal] = price.toFixed(1).split('.')
    return (
      <span className="price">
        <span className="symbol">¥</span>
        <span className="integer">{integer}</span>
        <span className="decimal">.{decimal}</span>
      </span>
    )
  }

  return (
    <Card
      className="product-card card-hover"
      hoverable
      onClick={handleClick}
      cover={
        <div className="card-cover">
          <img src={product.image} alt={product.name} loading="lazy" />
          <div className="card-tags">{renderTags()}</div>
          {showActions && (
            <div className="favorite-btn" onClick={handleToggleFavorite}>
              {isFav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            </div>
          )}
        </div>
      }
      actions={showActions ? [
        <Button
          key="cart"
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          block
        >
          加入购物车
        </Button>
      ] : null}
    >
      <Meta
        title={<div className="product-name">{product.name}</div>}
        description={
          <div className="product-info">
            <div className="price-row">
              {formatPrice(product.price)}
              {product.originalPrice && (
                <span className="original-price">¥{product.originalPrice.toFixed(1)}</span>
              )}
            </div>
            <div className="sales-info">
              <span>已售{product.sales}</span>
              <span className="rating">⭐ {product.rating}</span>
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default React.memo(ProductCard)
