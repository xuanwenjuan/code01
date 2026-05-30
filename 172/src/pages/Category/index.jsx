import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Typography, Empty, Button } from 'antd';
import {
  fetchProducts,
  selectAllProducts,
  selectCategories,
  selectProductsLoading,
} from '../../store/productSlice';
import GoodsCard from '../../components/GoodsCard';
import Loading from '../../components/Loading';

const { Title } = Typography;

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(selectAllProducts);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  const [activeCategory, setActiveCategory] = useState(id || 'all');

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (id) {
      setActiveCategory(id);
    }
  }, [id]);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p) => p.categoryId === parseInt(activeCategory));

  if (loading && products.length === 0) {
    return <Loading />;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        商品分类
      </Title>

      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <Button
            type={activeCategory === 'all' ? 'primary' : 'default'}
            onClick={() => {
              setActiveCategory('all');
              navigate('/category');
            }}
          >
            全部商品
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              type={activeCategory === String(category.id) ? 'primary' : 'default'}
              onClick={() => {
                setActiveCategory(String(category.id));
                navigate(`/category/${category.id}`);
              }}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </Card>

      {filteredProducts.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredProducts.map((product) => (
            <Col xs={12} sm={8} md={6} lg={6} key={product.id}>
              <GoodsCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <Card style={{ borderRadius: 8 }}>
          <Empty description="该分类暂无商品" />
        </Card>
      )}
    </div>
  );
};

export default Category;
