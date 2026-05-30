import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Typography,
  Rate,
  Button,
  InputNumber,
  Tag,
  Divider,
  Card,
  message,
  Radio,
  Descriptions,
  List,
} from 'antd';
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  TruckOutlined,
  SafetyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  fetchProductById,
  selectCurrentProduct,
  selectProductsLoading,
} from '../../store/productSlice';
import { useCart } from '../../hooks/useCart';
import Loading from '../../components/Loading';
import Empty from '../../components/Empty';

const { Title, Paragraph, Text } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const product = useSelector(selectCurrentProduct);
  const loading = useSelector(selectProductsLoading);
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch({ type: 'products/setCurrentProduct', payload: null });
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.specs) {
      const defaultSpecs = {};
      product.specs.forEach((spec) => {
        defaultSpecs[spec.name] = spec.options[0];
      });
      setSelectedSpecs(defaultSpecs);
    }
  }, [product]);

  if (loading) {
    return <Loading />;
  }

  if (!product) {
    return <Empty description="商品不存在" buttonText="返回首页" />;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSpecs);
    message.success('已加入购物车');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSpecs);
    navigate('/cart');
  };

  const handleSpecChange = (specName, value) => {
    setSelectedSpecs((prev) => ({
      ...prev,
      [specName]: value,
    }));
  };

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card style={{ borderRadius: 8 }}>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <div style={{ position: 'sticky', top: 80 }}>
              <div
                style={{
                  width: '100%',
                  paddingTop: '100%',
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
              >
                <img
                  src={product.images?.[activeImageIndex] || product.image}
                  alt={product.name}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[product.image, ...(product.images || [])].slice(0, 5).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 4,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImageIndex === index ? '2px solid #1890ff' : '2px solid transparent',
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {product.isHot && <Tag color="red">热卖</Tag>}
                {product.isNew && <Tag color="blue">新品</Tag>}
                {discount > 0 && <Tag color="orange">{discount}%OFF</Tag>}
              </div>

              <Title level={3} style={{ margin: '0 0 8px' }}>
                {product.name}
              </Title>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <Rate disabled value={product.rating} />
                <span style={{ color: '#666' }}>{product.rating} 分</span>
                <span style={{ color: '#999' }}>|</span>
                <span style={{ color: '#666' }}>已售 {product.sales}+</span>
              </div>

              <Card
                style={{
                  background: '#fff7e6',
                  border: 'none',
                  marginBottom: 24,
                  borderRadius: 8,
                }}
                bodyStyle={{ padding: '16px 20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ color: '#ff4d4f', fontSize: 14 }}>¥</span>
                  <span style={{ color: '#ff4d4f', fontSize: 36, fontWeight: 'bold' }}>
                    {product.price}
                  </span>
                  <span style={{ color: '#999', fontSize: 16, textDecoration: 'line-through' }}>
                    ¥{product.originalPrice}
                  </span>
                  {discount > 0 && (
                    <Tag color="red" style={{ margin: 0 }}>
                      省 ¥{(product.originalPrice - product.price).toFixed(2)}
                    </Tag>
                  )}
                </div>
              </Card>

              {product.specs?.map((spec) => (
                <div key={spec.name} style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 500, marginBottom: 12 }}>
                    {spec.name}
                    {selectedSpecs[spec.name] && (
                      <Text type="success" style={{ marginLeft: 8, fontSize: 12 }}>
                        已选：{selectedSpecs[spec.name]}
                      </Text>
                    )}
                  </div>
                  <Radio.Group
                    value={selectedSpecs[spec.name]}
                    onChange={(e) => handleSpecChange(spec.name, e.target.value)}
                    size="large"
                  >
                    {spec.options.map((option) => (
                      <Radio.Button
                        key={option}
                        value={option}
                        style={{
                          marginRight: 8,
                          marginBottom: 8,
                          borderRadius: 4,
                          transition: 'all 0.3s',
                        }}
                      >
                        {option}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
              ))}

              {Object.keys(selectedSpecs).length > 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#f6ffed',
                    borderRadius: 8,
                    marginBottom: 20,
                    border: '1px solid #b7eb8f',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text strong>已选择：</Text>
                    <Text>
                      {Object.entries(selectedSpecs)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('，')}
                    </Text>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 500, marginBottom: 12 }}>数量</div>
                <InputNumber
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={setQuantity}
                  size="large"
                  style={{ width: 120 }}
                />
                <span style={{ marginLeft: 16, color: '#999' }}>库存 {product.stock} 件</span>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <Button
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleAddToCart}
                  style={{ flex: 1, height: 48, fontSize: 16 }}
                >
                  加入购物车
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={handleBuyNow}
                  style={{ flex: 1, height: 48, fontSize: 16 }}
                >
                  立即购买
                </Button>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TruckOutlined style={{ color: '#52c41a' }} />
                  <Text style={{ fontSize: 13 }}>顺丰包邮</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <SafetyOutlined style={{ color: '#1890ff' }} />
                  <Text style={{ fontSize: 13 }}>正品保障</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ReloadOutlined style={{ color: '#fa8c16' }} />
                  <Text style={{ fontSize: 13 }}>7天无理由退换</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined style={{ color: '#722ed1' }} />
                  <Text style={{ fontSize: 13 }}>假一赔十</Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0' }} />

        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card title="商品详情" style={{ marginBottom: 24, borderRadius: 8 }}>
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>
                {product.description}
              </Paragraph>
              {product.images?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt=""
                      style={{ width: '100%', marginBottom: 16, borderRadius: 8 }}
                    />
                  ))}
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="商品参数" style={{ borderRadius: 8, position: 'sticky', top: 80 }}>
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="商品名称">{product.name}</Descriptions.Item>
                <Descriptions.Item label="商品分类">{product.category}</Descriptions.Item>
                <Descriptions.Item label="商品价格">¥{product.price}</Descriptions.Item>
                <Descriptions.Item label="原价">¥{product.originalPrice}</Descriptions.Item>
                <Descriptions.Item label="库存">{product.stock} 件</Descriptions.Item>
                <Descriptions.Item label="销量">{product.sales}+</Descriptions.Item>
                <Descriptions.Item label="评分">{product.rating} 分</Descriptions.Item>
                {product.specs?.map((spec) => (
                  <Descriptions.Item key={spec.name} label={spec.name}>
                    {spec.options.join(' / ')}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            <Card title="购买须知" style={{ marginTop: 24, borderRadius: 8 }}>
              <List
                size="small"
                dataSource={[
                  '下单后24小时内发货',
                  '支持7天无理由退换货（未拆封）',
                  '全场满99元包邮',
                  '正品保障，假一赔十',
                  '如有问题请联系客服：400-123-4567',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      description={<Text style={{ fontSize: 13 }}>{item}</Text>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProductDetail;
