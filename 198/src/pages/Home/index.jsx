import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Select, 
  Input, 
  Tabs, 
  Statistic, 
  Card, 
  Carousel, 
  Tag,
  Button,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  BookOutlined, 
  ToolOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks, fetchRecommendedBooks } from '@/store/slices/bookSlice';
import { addBrowseHistory } from '@/store/slices/userSlice';
import BookCard from '@/components/BookCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { BOOK_CATEGORIES, RESTORATION_STATUS } from '@/types';
import { mockBooks } from '@/mock/books';
import './index.css';

const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { books, recommendedBooks, loading } = useSelector((state) => state.book);
  const { userInfo } = useSelector((state) => state.user);
  
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    dispatch(fetchBooks({ category, status: activeTab, keyword }));
    dispatch(fetchRecommendedBooks());
  }, [dispatch, category, activeTab, keyword]);

  const handleSearch = (value) => {
    setKeyword(value);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleBookClick = (book) => {
    dispatch(addBrowseHistory({
      id: Date.now(),
      userId: userInfo.id,
      bookId: book.id,
      bookName: book.name,
      bookCover: book.cover,
      viewedAt: new Date().toLocaleString()
    }));
    navigate(`/book/${book.id}`);
  };

  const pendingBooks = mockBooks.filter(b => b.status === RESTORATION_STATUS.PENDING);
  const inProgressBooks = mockBooks.filter(b => b.status === RESTORATION_STATUS.IN_PROGRESS);
  const completedBooks = mockBooks.filter(b => b.status === RESTORATION_STATUS.COMPLETED);

  const bannerImages = [
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&h=400&fit=crop'
  ];

  return (
    <div className="home-page">
      <div className="banner-section">
        <Carousel autoplay effect="fade" className="main-banner">
          {bannerImages.map((img, index) => (
            <div key={index} className="banner-item">
              <img src={img} alt={`banner-${index}`} className="banner-image" />
              <div className="banner-content">
                <h2>传承千年文脉 修复古籍瑰宝</h2>
                <p>让沉睡的古籍重新焕发生机</p>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div className="stats-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="待修复古籍"
                value={pendingBooks.length}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="修复中古籍"
                value={inProgressBooks.length}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="stat-card">
              <Statistic
                title="已修复古籍"
                value={completedBooks.length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="filter-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Select
              style={{ width: '100%' }}
              value={category}
              onChange={handleCategoryChange}
              placeholder="选择古籍品类"
            >
              {BOOK_CATEGORIES.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={16}>
            <Search
              placeholder="搜索古籍名称或作者"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </Col>
        </Row>
      </div>

      <div className="tabs-section">
        <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
          <TabPane tab="待修复古籍" key="pending">
            {loading ? (
              <Loading />
            ) : books.length > 0 ? (
              <Row gutter={[16, 16]}>
                {books.map((book) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                    <BookCard book={book} />
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState description="暂无待修复的古籍" type="default" />
            )}
          </TabPane>
          <TabPane tab="修复中古籍" key="in_progress">
            {loading ? (
              <Loading />
            ) : books.length > 0 ? (
              <Row gutter={[16, 16]}>
                {books.map((book) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                    <BookCard book={book} />
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState description="暂无修复中的古籍" type="default" />
            )}
          </TabPane>
          <TabPane tab="已修复古籍" key="completed">
            {loading ? (
              <Loading />
            ) : books.length > 0 ? (
              <Row gutter={[16, 16]}>
                {books.map((book) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                    <BookCard book={book} />
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState description="暂无已修复的古籍" type="default" />
            )}
          </TabPane>
        </Tabs>
      </div>

      <div className="recommend-section">
        <div className="section-header">
          <h3 className="section-title">修复案例推荐</h3>
          <Button type="link" onClick={() => navigate('/books')}>
            查看更多 <ArrowRightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {recommendedBooks.slice(0, 4).map((book) => (
            <Col xs={24} sm={12} md={6} key={book.id}>
              <Card
                className="recommend-card"
                hoverable
                cover={
                  <div className="recommend-cover">
                    <img src={book.cover} alt={book.name} />
                    <div className="recommend-tag">
                      <Tag color="gold">推荐</Tag>
                    </div>
                  </div>
                }
                onClick={() => handleBookClick(book)}
              >
                <Card.Meta
                  title={book.name}
                  description={
                    <div className="recommend-info">
                      <p>{book.era} · {book.categoryLabel}</p>
                      <p className="view-count">
                        <EyeOutlined /> {book.viewCount} 次浏览
                      </p>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
