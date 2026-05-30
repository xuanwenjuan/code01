import { useState, useEffect } from 'react';
import { Row, Col, Typography, Tabs, Input, Button, Card, Tag } from 'antd';
import { SearchOutlined, PlayCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorks, fetchCategories } from '@/store/worksSlice';
import { fetchArtisans } from '@/store/artisansSlice';
import { fetchCases } from '@/store/casesSlice';
import { fetchTechniques } from '@/store/techniquesSlice';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import WorkCard from '@/components/WorkCard';
import ArtisanCard from '@/components/ArtisanCard';
import CaseCard from '@/components/CaseCard';
import './Home.css';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { list: works, categories, loading: worksLoading } = useSelector(
    state => state.works
  );
  const { list: artisans, loading: artisansLoading } = useSelector(
    state => state.artisans
  );
  const { list: cases, loading: casesLoading } = useSelector(
    state => state.cases
  );
  const { list: techniques, loading: techniquesLoading } = useSelector(
    state => state.techniques
  );

  useEffect(() => {
    dispatch(fetchWorks());
    dispatch(fetchCategories());
    dispatch(fetchArtisans());
    dispatch(fetchCases());
    dispatch(fetchTechniques());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchWorks({ categoryId: selectedCategory, keyword: searchKeyword }));
  }, [dispatch, selectedCategory, searchKeyword]);

  const featuredWorks = works.filter(w => w.featured);
  const otherWorks = works.filter(w => !w.featured);

  const handleSearch = e => {
    setSearchKeyword(e.target.value);
  };

  const tabItems = [
    {
      key: 'all',
      label: '全部作品',
      children: (
        <Row gutter={[24, 24]}>
          {works.map(work => (
            <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
              <WorkCard work={work} />
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'featured',
      label: '精选推荐',
      children: (
        <Row gutter={[24, 24]}>
          {featuredWorks.map(work => (
            <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
              <WorkCard work={work} />
            </Col>
          ))}
        </Row>
      ),
    },
    ...categories.map(cat => ({
      key: cat.id,
      label: `${cat.icon} ${cat.name}`,
      children: (
        <Row gutter={[24, 24]}>
          {works
            .filter(w => w.categoryId === cat.id)
            .map(work => (
              <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                <WorkCard work={work} />
              </Col>
            ))}
        </Row>
      ),
    })),
  ];

  if (worksLoading || artisansLoading || casesLoading || techniquesLoading) {
    return <Loading text="加载中..." />;
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1} className="hero-title">
            花丝镶嵌
          </Title>
          <Paragraph className="hero-subtitle">
            传承千年技艺 · 演绎东方美学
          </Paragraph>
          <Paragraph className="hero-desc">
            花丝镶嵌工艺是中国传统金属工艺的精华，被誉为"燕京八绝"之首。
            本平台致力于数字化保护和展示这一珍贵的非物质文化遗产。
          </Paragraph>
          <div className="search-box">
            <Input
              size="large"
              placeholder="搜索作品、技艺、传承人..."
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={handleSearch}
              allowClear
            />
          </div>
        </div>
      </div>

      <div className="category-section">
        <Title level={3} className="section-title">
          花丝品类
        </Title>
        <Row gutter={[16, 16]}>
          <Col
            xs={12}
            sm={8}
            md={4}
            lg={4}
            onClick={() => setSelectedCategory(null)}
          >
            <div
              className={`category-card ${!selectedCategory ? 'active' : ''}`}
            >
              <span className="category-icon">🎨</span>
              <span className="category-name">全部</span>
            </div>
          </Col>
          {categories.map(cat => (
            <Col
              xs={12}
              sm={8}
              md={4}
              lg={4}
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div
                className={`category-card ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
                <span className="category-count">{cat.count}件</span>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <div className="techniques-section">
        <div className="section-header">
          <Title level={3} className="section-title">
            花丝工艺
          </Title>
          <Button
            type="link"
            onClick={() => navigate('/technique/1')}
            className="view-all-btn"
          >
            查看全部 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {techniques.slice(0, 4).map(tech => (
            <Col xs={24} sm={12} md={6} lg={6} key={tech.id}>
              <Card
                hoverable
                className="technique-card"
                onClick={() => navigate(`/technique/${tech.id}`)}
              >
                <div className="technique-icon">
                  <PlayCircleOutlined />
                </div>
                <Title level={4} className="technique-name">
                  {tech.name}
                </Title>
                <Paragraph className="technique-desc">
                  {tech.description}
                </Paragraph>
                <div className="technique-meta">
                  <Tag color="blue">{tech.difficulty}</Tag>
                  <span className="technique-duration">
                    {tech.duration}
                  </span>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="works-section">
        <div className="section-header">
          <Title level={3} className="section-title">
            作品展示
          </Title>
        </div>
        {works.length > 0 ? (
          <Tabs items={tabItems} defaultActiveKey="all" />
        ) : (
          <EmptyState description="暂无符合条件的作品" />
        )}
      </div>

      <div className="artisans-section">
        <Title level={3} className="section-title">
          技艺传承人
        </Title>
        <Row gutter={[24, 24]}>
          {artisans.map(artisan => (
            <Col xs={24} sm={12} md={12} lg={6} key={artisan.id}>
              <ArtisanCard artisan={artisan} />
            </Col>
          ))}
        </Row>
      </div>

      <div className="cases-section">
        <Title level={3} className="section-title">
          经典案例
        </Title>
        <Row gutter={[24, 24]}>
          {cases.map(caseItem => (
            <Col xs={24} sm={12} md={12} lg={6} key={caseItem.id}>
              <CaseCard caseItem={caseItem} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
