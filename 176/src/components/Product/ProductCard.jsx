import React from 'react'
import { Card, Tag, Rate, Button } from 'antd'
import { ShoppingCartOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Meta } = Card

const ProductCard = ({ product }) => {
  const navigate = useNavigate()

  const handleCustomize = () => {
    navigate(`/product/${product.id}`)
  }

  return (
    <Card
      hoverable
      cover={
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
          <img
            alt={product.name}
            src={product.image}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {product.sales > 3000 && (
            <Tag color="red" style={{ position: 'absolute', top: '12px', left: '12px' }}>
              热销
            </Tag>
          )}
        </div>
      }
      actions={[
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleCustomize}
          block
        >
          立即定制
        </Button>,
      ]}
      style={{ height: '100%' }}
    >
      <Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '500' }}>{product.name}</span>
            <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
              ¥{product.price}
            </span>
          </div>
        }
        description={
          <div>
            <p style={{ color: '#999', margin: '8px 0', fontSize: '13px' }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Rate disabled defaultValue={product.rating} style={{ fontSize: '12px' }} />
                <span style={{ color: '#faad14', fontSize: '12px' }}>{product.rating}</span>
              </div>
              <span style={{ color: '#999', fontSize: '12px' }}>
                已售 {product.sales}+
              </span>
            </div>
            {product.originalPrice && (
              <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '12px' }}>
                原价 ¥{product.originalPrice}
              </span>
            )}
          </div>
        }
      />
    </Card>
  )
}

export default ProductCard
