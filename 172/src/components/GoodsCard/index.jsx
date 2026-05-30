import { Card, Tag, Rate, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { message } from 'antd';

const { Meta } = Card;

const GoodsCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const defaultSpecs = {};
    product.specs?.forEach((spec) => {
      defaultSpecs[spec.name] = spec.options[0];
    });
    addToCart(product, 1, defaultSpecs);
    message.success('已加入购物车');
  };

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <Card
      hoverable
      style={{ borderRadius: 8, overflow: 'hidden' }}
      cover={
        <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', cursor: 'pointer' }} onClick={handleClick}>
          <img
            alt={product.name}
            src={product.image}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          />
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
            {product.isHot && <Tag color="red">热卖</Tag>}
            {product.isNew && <Tag color="blue">新品</Tag>}
            {discount > 0 && <Tag color="orange">{discount}%OFF</Tag>}
          </div>
        </div>
      }
      actions={[
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          block
        >
          加入购物车
        </Button>,
      ]}
    >
      <div onClick={handleClick} style={{ cursor: 'pointer' }}>
        <Meta
          title={
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: 8,
              }}
            >
              {product.name}
            </div>
          }
          description={
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Rate disabled value={product.rating} style={{ fontSize: 12 }} />
                <span style={{ color: '#999', fontSize: 12 }}>{product.rating}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 'bold' }}>
                  ¥{product.price}
                </span>
                <span style={{ color: '#999', fontSize: 12, textDecoration: 'line-through' }}>
                  ¥{product.originalPrice}
                </span>
              </div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
                已售 {product.sales}+
              </div>
            </div>
          }
        />
      </div>
    </Card>
  );
};

export default GoodsCard;
