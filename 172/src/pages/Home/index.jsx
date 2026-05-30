import { useEffect } from 'react';
import { Carousel, Row, Col, Card, Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchProducts,
  selectBanners,
  selectHotProducts,
  selectNewProducts,
  selectCategories,
  selectProductsLoading,
} from '../../store/productSlice';
import GoodsCard from '../../components/GoodsCard';
import Loading from '../../components/Loading';

const { Title } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const banners = useSelector(selectBanners);
  const hotProducts = useSelector(selectHotProducts);
  const newProducts = useSelector(selectNewProducts);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <Carousel autoplay style={{ marginBottom: 24, borderRadius: 8, overflow: 'hidden' }}>
        {banners.map((banner) => (
          <div key={banner.id} style={{ position: 'relative', height: 320 }}>
            <img
              src={banner.image}
              alt={banner.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 80,
              }}
            >
              <div style={{ color: '#fff' }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>
                  {banner.title}
                </Title>
                <p style={{ fontSize: 16, marginTop: 12 }}>{banner.description}</p>
                <Button type="primary" size="large" style={{ marginTop: 16 }} onClick={() => navigate(banner.link)}>
                  立即查看
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Title level={4} style={{ margin: '0 0 16px' }}>
          商品分类
        </Title>
        <Row gutter={[16, 16]}>
          {categories.map((category) => (
            <Col xs={6} sm={4} md={3} key={category.id}>
              <div
                onClick={() => navigate(`/category/${category.id}`)}
                style={{
                  textAlign: 'center',
                  padding: '16px 8px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{category.icon}</div>
                <div style={{ fontSize: 14, color: '#333' }}>{category.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {category.count}件商品
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            🔥 热门推荐
          </Title>
          <Button type="link" onClick={() => navigate('/category')} icon={<RightOutlined />}>
            查看更多
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {hotProducts.map((product) => (
            <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
              <GoodsCard product={product} />
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            ✨ 新品上架
          </Title>
          <Button type="link" onClick={() => navigate('/category')} icon={<RightOutlined />}>
            查看更多
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {newProducts.map((product) => (
            <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
              <GoodsCard product={product} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
