import React, { useState, useEffect, useMemo } from 'react';
import {
  Tabs,
  Card,
  Avatar,
  Descriptions,
  List,
  Button,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Space,
  Select,
  Input,
  DatePicker,
  Badge,
  Statistic,
  Empty,
  Tooltip,
  Modal
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  HistoryOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  HeartFilled,
  SafetyCertificateOutlined,
  FilterOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { mockBooks, getRestorationProcess } from '@/mock/books';
import { mockRestorers } from '@/mock/userData';
import { clearBrowseHistory, deleteBrowseRecord } from '@/store/slices/userSlice';
import EmptyState from '@/components/EmptyState';
import { USER_ROLES, RESTORATION_STATUS, BOOK_CATEGORIES } from '@/types';
import dayjs from 'dayjs';
import './index.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: RESTORATION_STATUS.PENDING, label: '待修复' },
  { value: RESTORATION_STATUS.IN_PROGRESS, label: '修复中' },
  { value: RESTORATION_STATUS.COMPLETED, label: '已修复' }
];

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  const { userInfo, favorites, browseHistory } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [keywordFilter, setKeywordFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadingBook, setDownloadingBook] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setStatusFilter('all');
    setCategoryFilter('all');
    setKeywordFilter('');
    setDateRange(null);
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleClearHistory = () => {
    dispatch(clearBrowseHistory());
    message.success('浏览记录已清空');
  };

  const handleDeleteRecord = (id) => {
    dispatch(deleteBrowseRecord(id));
    message.success('已删除');
  };

  const handleBatchDownload = (book) => {
    setDownloadingBook(book);
    setDownloadModalVisible(true);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadModalVisible(false);
            setDownloadingBook(null);
            message.success(`"${book.name}" 修复素材下载完成！`);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getRoleLabel = (role) => {
    if (role === USER_ROLES.ADMIN) return '档案管理员';
    if (role === USER_ROLES.RESTORER) return '古籍修复师';
    return '未知角色';
  };

  const getStatusText = (status) => {
    switch (status) {
      case RESTORATION_STATUS.COMPLETED: return '已修复';
      case RESTORATION_STATUS.IN_PROGRESS: return '修复中';
      case RESTORATION_STATUS.PENDING: return '待修复';
      default: return '未知';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RESTORATION_STATUS.COMPLETED: return 'success';
      case RESTORATION_STATUS.IN_PROGRESS: return 'processing';
      case RESTORATION_STATUS.PENDING: return 'orange';
      default: return 'default';
    }
  };

  const filteredFavoriteBooks = useMemo(() => {
    let result = mockBooks.filter((book) => favorites.books.includes(book.id));
    
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((b) => b.category === categoryFilter);
    }
    if (keywordFilter) {
      const keyword = keywordFilter.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(keyword) ||
          b.author.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  }, [favorites.books, statusFilter, categoryFilter, keywordFilter]);

  const filteredHistory = useMemo(() => {
    let result = [...browseHistory];
    
    if (keywordFilter) {
      const keyword = keywordFilter.toLowerCase();
      result = result.filter((h) => h.bookName.toLowerCase().includes(keyword));
    }
    
    if (dateRange && dateRange.length === 2) {
      const start = dayjs(dateRange[0]).startOf('day');
      const end = dayjs(dateRange[1]).endOf('day');
      result = result.filter((h) => {
        const viewedAt = dayjs(h.viewedAt);
        return viewedAt.isAfter(start) && viewedAt.isBefore(end);
      });
    }
    
    return result;
  }, [browseHistory, keywordFilter, dateRange]);

  const totalViewCount = useMemo(() => {
    return mockBooks
      .filter((b) => favorites.books.includes(b.id))
      .reduce((sum, b) => sum + b.viewCount, 0);
  }, [favorites.books]);

  const completedCount = useMemo(() => {
    return mockBooks.filter(
      (b) => favorites.books.includes(b.id) && b.status === RESTORATION_STATUS.COMPLETED
    ).length;
  }, [favorites.books]);

  const inProgressCount = useMemo(() => {
    return mockBooks.filter(
      (b) => favorites.books.includes(b.id) && b.status === RESTORATION_STATUS.IN_PROGRESS
    ).length;
  }, [favorites.books]);

  const favoriteRestorers = mockRestorers.filter((r) => favorites.restorers.includes(r.id));

  return (
    <div className="profile-page">
      <Card className="profile-header-card" bordered={false}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6}>
            <div className="profile-avatar">
              <Badge.Ribbon text={getRoleLabel(userInfo?.role)} color={userInfo?.role === USER_ROLES.ADMIN ? '#1890ff' : '#52c41a'}>
                <Avatar size={120} src={userInfo?.avatar} icon={<UserOutlined />} />
              </Badge.Ribbon>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <div className="profile-info">
              <div className="profile-name-row">
                <h2 className="profile-name">{userInfo?.name}</h2>
                {userInfo?.role === USER_ROLES.RESTORER && (
                  <Tag color="green" icon={<CheckCircleOutlined />}>认证修复师</Tag>
                )}
                {userInfo?.role === USER_ROLES.ADMIN && (
                  <Tag color="blue" icon={<ToolOutlined />}>管理员</Tag>
                )}
              </div>
              <div className="profile-tags">
                <Tag color="green">{userInfo?.department}</Tag>
                {userInfo?.title && <Tag color="purple">{userInfo?.title}</Tag>}
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <BookOutlined />
                  <span className="stat-value">{favorites.books.length}</span>
                  <span className="stat-label">收藏古籍</span>
                </div>
                <div className="stat-item">
                  <TeamOutlined />
                  <span className="stat-value">{favorites.restorers.length}</span>
                  <span className="stat-label">关注修复师</span>
                </div>
                <div className="stat-item">
                  <HistoryOutlined />
                  <span className="stat-value">{browseHistory.length}</span>
                  <span className="stat-label">浏览记录</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="profile-tabs-card" bordered={false}>
        <Tabs activeKey={activeTab} onChange={handleTabChange} size="large">
          <TabPane tab={<span><UserOutlined />个人信息</span>} key="info">
            <div className="info-section">
              <Descriptions column={2} size="middle">
                <Descriptions.Item label="用户名">{userInfo?.username}</Descriptions.Item>
                <Descriptions.Item label="姓名">{userInfo?.name}</Descriptions.Item>
                <Descriptions.Item label="角色">
                  <Tag color="blue">{getRoleLabel(userInfo?.role)}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="部门">{userInfo?.department}</Descriptions.Item>
                <Descriptions.Item label="邮箱">
                  <MailOutlined /> {userInfo?.email}
                </Descriptions.Item>
                <Descriptions.Item label="电话">
                  <PhoneOutlined /> {userInfo?.phone}
                </Descriptions.Item>
                {userInfo?.title && (
                  <Descriptions.Item label="职称">{userInfo?.title}</Descriptions.Item>
                )}
                {userInfo?.experience && (
                  <Descriptions.Item label="从业经验">{userInfo.experience} 年</Descriptions.Item>
                )}
              </Descriptions>

              {userInfo?.specialty && (
                <div className="extra-info">
                  <h4>专业领域</h4>
                  <Space wrap>
                    {userInfo.specialty.map((s) => (
                      <Tag key={s} color="purple">{s}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              {userInfo?.certification && (
                <div className="extra-info">
                  <h4>资质证书</h4>
                  <Space wrap>
                    {userInfo.certification.map((c) => (
                      <Tag key={c} icon={<SafetyCertificateOutlined />} color="green">
                        {c}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane tab={<span><HeartFilled style={{ color: '#ff4d4f' }} />收藏古籍</span>} key="favorites">
            {favorites.books.length > 0 ? (
              <>
                <Card className="stats-overview" bordered={false}>
                  <Row gutter={[16, 16]}>
                    <Col xs={8}>
                      <Statistic
                        title="收藏总数"
                        value={favorites.books.length}
                        prefix={<BookOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title="已修复"
                        value={completedCount}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col xs={8}>
                      <Statistic
                        title="总浏览量"
                        value={totalViewCount}
                        prefix={<EyeOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Col>
                  </Row>
                </Card>

                <div className="filter-bar">
                  <Space wrap>
                    <Select
                      placeholder="状态筛选"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: 140 }}
                      allowClear
                    >
                      {statusOptions.map((opt) => (
                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                      ))}
                    </Select>
                    <Select
                      placeholder="品类筛选"
                      value={categoryFilter}
                      onChange={setCategoryFilter}
                      style={{ width: 140 }}
                      allowClear
                    >
                      {BOOK_CATEGORIES.map((cat) => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                    <Input
                      placeholder="搜索古籍名称/作者"
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                      style={{ width: 200 }}
                      prefix={<SearchOutlined />}
                      allowClear
                    />
                  </Space>
                  <span className="result-count">
                    筛选结果：{filteredFavoriteBooks.length} 条
                  </span>
                </div>

                {filteredFavoriteBooks.length > 0 ? (
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                    dataSource={filteredFavoriteBooks}
                    renderItem={(book) => (
                      <List.Item>
                        <Card
                          hoverable
                          cover={
                            <div className="favorite-cover">
                              <img src={book.cover} alt={book.name} />
                              <div className="view-count-badge">
                                <EyeOutlined /> {book.viewCount}
                              </div>
                            </div>
                          }
                          actions={[
                            <Tooltip title="查看详情">
                              <Button type="link" size="small" onClick={() => handleBookClick(book.id)}>
                                查看
                              </Button>
                            </Tooltip>,
                            <Tooltip title="下载素材">
                              <Button
                                type="link"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => handleBatchDownload(book)}
                              >
                                下载
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <Card.Meta
                            title={book.name}
                            description={
                              <div>
                                <p style={{ margin: '4px 0', color: '#8c8c8c', fontSize: 12 }}>
                                  {book.era} · {book.categoryLabel}
                                </p>
                                <Tag color={getStatusColor(book.status)}>
                                  {getStatusText(book.status)}
                                </Tag>
                              </div>
                            }
                          />
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="没有符合筛选条件的古籍" />
                )}
              </>
            ) : (
              <EmptyState
                description="暂无收藏的古籍"
                type="favorite"
                action={() => navigate('/books')}
                actionText="去浏览古籍"
              />
            )}
          </TabPane>

          <TabPane tab={<span><TeamOutlined />关注修复师</span>} key="restorers">
            {favoriteRestorers.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 2 }}
                dataSource={favoriteRestorers}
                renderItem={(restorer) => (
                  <List.Item>
                    <Card className="restorer-item" hoverable>
                      <Row gutter={[16, 16]}>
                        <Col span={6}>
                          <Badge.Ribbon text={restorer.title} color="#52c41a">
                            <Avatar size={80} src={restorer.avatar} icon={<UserOutlined />} />
                          </Badge.Ribbon>
                        </Col>
                        <Col span={18}>
                          <div className="restorer-name-row">
                            <h4 style={{ margin: 0, fontSize: 16 }}>{restorer.name}</h4>
                            <Badge status="success" text="在线" />
                          </div>
                          <p style={{ margin: '4px 0', color: '#8c8c8c' }}>
                            {restorer.department} · {restorer.experience}年经验
                          </p>
                          <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                            <Col span={8}>
                              <div className="restorer-stat">
                                <span className="num">{restorer.completedCount}</span>
                                <span className="label">已修复</span>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="restorer-stat">
                                <span className="num">{restorer.successRate}</span>
                                <span className="label">成功率</span>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="restorer-stat">
                                <span className="num">{restorer.rating}</span>
                                <span className="label">评分</span>
                              </div>
                            </Col>
                          </Row>
                          <div style={{ marginTop: 8 }}>
                            {restorer.specialty.slice(0, 3).map((s) => (
                              <Tag key={s} color="purple" style={{ marginBottom: 4 }}>{s}</Tag>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <EmptyState
                description="暂无关注的修复师"
                type="default"
              />
            )}
          </TabPane>

          <TabPane tab={<span><HistoryOutlined />浏览记录</span>} key="history">
            {browseHistory.length > 0 ? (
              <>
                <div className="history-filter-bar">
                  <Space wrap>
                    <Input
                      placeholder="搜索浏览记录"
                      value={keywordFilter}
                      onChange={(e) => setKeywordFilter(e.target.value)}
                      style={{ width: 200 }}
                      prefix={<SearchOutlined />}
                      allowClear
                    />
                    <RangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder={['开始日期', '结束日期']}
                    />
                    <Button
                      type="text"
                      icon={<FilterOutlined />}
                      onClick={() => {
                        setKeywordFilter('');
                        setDateRange(null);
                      }}
                    >
                      重置筛选
                    </Button>
                  </Space>
                  <div className="history-actions">
                    <span>共 {filteredHistory.length} 条记录</span>
                    <Popconfirm
                      title="确定要清空所有浏览记录吗？"
                      onConfirm={handleClearHistory}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="text" danger size="small">
                        清空记录
                      </Button>
                    </Popconfirm>
                  </div>
                </div>

                {filteredHistory.length > 0 ? (
                  <List
                    dataSource={filteredHistory}
                    renderItem={(item) => (
                      <List.Item
                        className="history-item"
                        onClick={() => handleBookClick(item.bookId)}
                        actions={[
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRecord(item.id);
                            }}
                          >
                            删除
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div className="history-avatar">
                              <img src={item.bookCover} alt={item.bookName} />
                            </div>
                          }
                          title={
                            <Space>
                              <span>{item.bookName}</span>
                              <Tag color="blue" size="small">
                                <ClockCircleOutlined /> {item.viewedAt}
                              </Tag>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="没有符合筛选条件的浏览记录" />
                )}
              </>
            ) : (
              <EmptyState description="暂无浏览记录" type="default" />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <Space>
            <DownloadOutlined />
            批量下载修复素材
          </Space>
        }
        open={downloadModalVisible}
        onCancel={() => setDownloadModalVisible(false)}
        footer={null}
        width={500}
      >
        {downloadingBook && (
          <div className="download-modal">
            <p className="download-book-name">
              正在下载：<strong>{downloadingBook.name}</strong>
            </p>
            <p className="download-info">
              修复过程图片 {getRestorationProcess(downloadingBook.id).reduce((sum, p) => sum + (p.images?.length || 0), 0)} 张
              {getRestorationProcess(downloadingBook.id).some(p => p.video) ? '，视频 1 个' : ''}
            </p>
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
              </div>
              <span className="progress-text">{downloadProgress}%</span>
            </div>
            <p className="download-tip">
              {downloadProgress < 100 ? '正在打包下载，请稍候...' : '下载完成！'}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Profile;
