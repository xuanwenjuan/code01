import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Typography, Card, Tag, Avatar, Empty, Button, Tabs } from 'antd';
import {
  SearchOutlined,
  PictureOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { fetchSearchResults, clearSearchResults, logOperation } from '@/store/platformSlice';
import Loading from '@/components/Loading';
import './SearchResults.css';

const { Title, Paragraph } = Typography;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const keyword = searchParams.get('q') || '';

  const { searchResults, searchLoading } = useSelector(state => state.platform);

  useEffect(() => {
    if (keyword) {
      dispatch(fetchSearchResults(keyword));
      dispatch(logOperation({
        action: 'view_search_results',
        detail: `查看搜索结果: ${keyword}`,
      }));
    }
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, keyword]);

  const handleItemClick = (type, id) => {
    dispatch(logOperation({
      action: 'click_search_result',
      itemId: id,
      itemType: type,
      detail: `从搜索结果点击: ${type} ${id}`,
    }));
    if (type === 'work') {
      navigate(`/work/${id}`);
    } else if (type === 'case') {
      navigate(`/case/${id}`);
    } else if (type === 'technique') {
      navigate(`/technique/${id}`);
    }
  };

  const renderWorkCard = work => (
    <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
      <Card
        hoverable
        className="result-card"
        onClick={() => handleItemClick('work', work.id)}
      >
        <div className="result-cover">
          <img src={work.image} alt={work.name} />
          <Tag color="blue" className="type-tag">作品</Tag>
        </div>
        <Card.Meta
          title={work.name}
          description={
            <div>
              <p className="result-desc">{work.description}</p>
              <div className="result-meta">
                <span>{work.category}</span>
                <span className="result-price">{work.price}</span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderCaseCard = caseItem => (
    <Col xs={24} sm={12} md={8} lg={6} key={caseItem.id}>
      <Card
        hoverable
        className="result-card"
        onClick={() => handleItemClick('case', caseItem.id)}
      >
        <div className="result-cover">
          <img src={caseItem.cover} alt={caseItem.title} />
          <Tag color="green" className="type-tag">案例</Tag>
        </div>
        <Card.Meta
          title={caseItem.title}
          description={
            <div>
              <p className="result-desc">{caseItem.description}</p>
              <div className="result-meta">
                <span>{caseItem.date}</span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderTechniqueCard = tech => (
    <Col xs={24} sm={12} md={8} lg={6} key={tech.id}>
      <Card
        hoverable
        className="result-card"
        onClick={() => handleItemClick('technique', tech.id)}
      >
        <div className="result-cover technique-cover">
          <PlayCircleOutlined className="play-icon" />
          <Tag color="gold" className="type-tag">工艺</Tag>
        </div>
        <Card.Meta
          title={tech.name}
          description={
            <div>
              <p className="result-desc">{tech.description}</p>
              <div className="result-meta">
                <span>{tech.difficulty}</span>
                <span>{tech.duration}</span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const renderArtisanCard = artisan => (
    <Col xs={24} sm={12} md={8} lg={6} key={artisan.id}>
      <Card hoverable className="result-card artisan-card">
        <div className="artisan-cover">
          <Avatar size={80} src={artisan.avatar} icon={<UserOutlined />} />
          <Tag color="purple" className="type-tag">传承人</Tag>
        </div>
        <Card.Meta
          title={artisan.name}
          description={
            <div>
              <p className="result-desc">{artisan.title}</p>
              <div className="result-meta">
                <span>从业 {artisan.experience}</span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const tabItems = [
    {
      key: 'all',
      label: `全部 (${searchResults.total})`,
      children: (
        <div className="search-results-grid">
          {searchResults.works.map(renderWorkCard)}
          {searchResults.cases.map(renderCaseCard)}
          {searchResults.techniques.map(renderTechniqueCard)}
          {searchResults.artisans.map(renderArtisanCard)}
        </div>
      ),
    },
    {
      key: 'works',
      label: `作品 (${searchResults.works.length})`,
      children: (
        <Row gutter={[16, 16]}>
          {searchResults.works.map(renderWorkCard)}
        </Row>
      ),
    },
    {
      key: 'cases',
      label: `案例 (${searchResults.cases.length})`,
      children: (
        <Row gutter={[16, 16]}>
          {searchResults.cases.map(renderCaseCard)}
        </Row>
      ),
    },
    {
      key: 'techniques',
      label: `工艺 (${searchResults.techniques.length})`,
      children: (
        <Row gutter={[16, 16]}>
          {searchResults.techniques.map(renderTechniqueCard)}
        </Row>
      ),
    },
    {
      key: 'artisans',
      label: `传承人 (${searchResults.artisans.length})`,
      children: (
        <Row gutter={[16, 16]}>
          {searchResults.artisans.map(renderArtisanCard)}
        </Row>
      ),
    },
  ];

  if (searchLoading) {
    return <Loading text="搜索中..." />;
  }

  return (
    <div className="search-results-page">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          返回
        </Button>
        <Title level={3} className="page-title">
          <SearchOutlined /> 搜索结果
        </Title>
      </div>

      <Card className="search-info">
        <Paragraph className="search-keyword">
          搜索关键词：<span className="keyword-highlight">"{keyword}"</span>
          <span className="result-count">共找到 {searchResults.total} 条结果</span>
        </Paragraph>
      </Card>

      {searchResults.total > 0 ? (
        <Card className="results-container" styles={{ body: { padding: 0 } }}>
          <Tabs defaultActiveKey="all" items={tabItems} className="results-tabs" />
        </Card>
      ) : (
        <Card className="empty-results">
          <Empty
            description={
              <div>
                <p>未找到与 "{keyword}" 相关的结果</p>
                <p className="empty-tip">试试其他关键词，或检查拼写是否正确</p>
              </div>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
