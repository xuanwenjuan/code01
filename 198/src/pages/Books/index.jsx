import React, { useState, useEffect } from 'react';
import { Row, Col, Select, Input, Pagination, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from '@/store/slices/bookSlice';
import { addBrowseHistory } from '@/store/slices/userSlice';
import BookCard from '@/components/BookCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { BOOK_CATEGORIES } from '@/types';
import './index.css';

const { Search } = Input;
const { Option } = Select;

const Books = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { books, loading } = useSelector((state) => state.book);
  const { userInfo } = useSelector((state) => state.user);
  
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  useEffect(() => {
    dispatch(fetchBooks({ category, keyword }));
  }, [dispatch, category, keyword]);

  const handleSearch = (value) => {
    setKeyword(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedBooks = books.slice(startIndex, endIndex);

  return (
    <div className="books-page">
      <div className="page-header">
        <h2 className="page-title">古籍档案库</h2>
        <p className="page-desc">浏览全部古籍档案，了解修复进度与历史</p>
      </div>

      <div className="filter-bar">
        <Space size="middle" style={{ width: '100%' }}>
          <Select
            style={{ width: 200 }}
            value={category}
            onChange={handleCategoryChange}
            placeholder="选择品类"
            allowClear
          >
            {BOOK_CATEGORIES.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
          <Search
            placeholder="搜索古籍名称或作者"
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <span className="result-count">共 {books.length} 条记录</span>
        </Space>
      </div>

      <div className="books-list">
        {loading ? (
          <Loading />
        ) : books.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {paginatedBooks.map((book) => (
                <Col xs={24} sm={12} md={8} lg={6} key={book.id}>
                  <BookCard book={book} />
                </Col>
              ))}
            </Row>
            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={books.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </>
        ) : (
          <EmptyState description="未找到符合条件的古籍" type="search" />
        )}
      </div>
    </div>
  );
};

export default Books;
