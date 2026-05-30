import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Typography, Button, Tag, Card, Avatar, Carousel, Input, Select, List } from 'antd';
import { SearchOutlined, FireOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import { setCategory } from '../../store/slices/worksSlice';
import { mockMasters } from '../../mock';
import WorkCard from '../../components/Common/WorkCard';
import Loading from '../../components/Status/Loading';
import './Home.css';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Meta } = Card;

const Home = () => {
  const dispatch = useDispatch();
  const { works, loading, selectedCategory } = useSelector(state => state.works);
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'folk', label: '民俗类' },
    { key: 'flower', label: '花鸟类' },
    { key: 'figure', label: '人物类' },
  ];

  const banners = [
    { id: 1, title: '传承千年剪纸技艺', subtitle: '感受中华传统文化魅力', image: 'https://images.unsplash.com/photo-1609749893505-9091ae6f54e7?w=1600&h=500&fit=crop' },
    { id: 2, title: '精品剪纸作品展', subtitle: '领略大师精湛技艺', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1600&h=500&fit=crop' },
    { id: 3, title: '剪纸技艺交流社区', subtitle: '分享你的剪纸作品', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=500&fit=crop' },
  ];

  const filteredWorks = works
    .filter(work => {
      const matchCategory = selectedCategory === 'all' || work.category === selectedCategory;
      const matchSearch = work.title.includes(searchText) || work.description.includes(searchText) || work.author.includes(searchText);
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'popular') {
        return b.likes - a.likes;
      }
      return b.views - a.views;
    });

  const popularWorks = [...works].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div className="home-page">
      <div className="banner-section">
        <Carousel autoplay effect="fade">
          {banners.map(banner => (
            <div key={banner.id}>
              <div className="banner-item" style={{ backgroundImage: `url(${banner.image})` }}>
                <div className="banner-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="container">
        <div className="section">
          <div className="section-header">
            <Title level={3} className="section-title">
              <FireOutlined style={{ color: '#c41e3a', marginRight: 10 }} />
              剪纸作品展示
            </Title>
            <div className="filter-bar">
              <div className="category-tabs">
                {categories.map(cat => (
                  <Tag.CheckableTag
                    key={cat.key}
                    checked={selectedCategory === cat.key}
                    onChange={() => dispatch(setCategory(cat.key))}
                    className={selectedCategory === cat.key ? 'active' : ''}
                  >
                    {cat.label}
                  </Tag.CheckableTag>
                ))}
              </div>
              <div className="filter-right">
                <Search
                  placeholder="搜索作品..."
                  allowClear
                  style={{ width: 200 }}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  style={{ width: 120 }}
                >
                  <Option value="latest">最新发布</Option>
                  <Option value="popular">最受欢迎</Option>
                  <Option value="views">浏览最多</Option>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredWorks.map(work => (
                <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                  <WorkCard work={work} />
                </Col>
              ))}
            </Row>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <Title level={3} className="section-title">
              <StarOutlined style={{ color: '#faad14', marginRight: 10 }} />
              大师风采
            </Title>
          </div>
          <Row gutter={[24, 24]}>
            {mockMasters.map(master => (
              <Col xs={24} sm={12} md={6} key={master.id}>
                <Card className="master-card">
                  <div className="master-avatar">
                    <Avatar size={100} src={master.avatar} />
                  </div>
                  <Meta
                    title={master.name}
                    description={
                      <div>
                        <Tag color="red">{master.title}</Tag>
                        <p className="master-desc">{master.description}</p>
                        <div className="master-stats">
                          <span><EyeOutlined /> {master.works} 作品</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="section">
          <div className="section-header">
            <Title level={3} className="section-title">
              <FireOutlined style={{ color: '#ff4d4f', marginRight: 10 }} />
              热门推荐
            </Title>
          </div>
          <Row gutter={[24, 24]}>
            {popularWorks.map(work => (
              <Col xs={24} sm={12} md={6} key={work.id}>
                <WorkCard work={work} />
              </Col>
            ))}
          </Row>
        </div>

        <div className="section">
          <div className="cta-section">
            <div className="cta-content">
              <Title level={3}>加入剪纸技艺交流社区</Title>
              <Paragraph>
                分享你的剪纸作品，与大师互动交流，传承中华传统文化
              </Paragraph>
              <div className="cta-buttons">
                <Button type="primary" size="large">
                  立即注册
                </Button>
                <Button size="large">
                  了解更多
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
