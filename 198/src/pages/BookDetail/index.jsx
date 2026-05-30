import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Descriptions,
  Progress,
  Steps,
  Image,
  Button,
  Avatar,
  Space,
  Divider,
  message,
  Modal,
  Empty,
  Badge
} from 'antd';
import {
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  PlayCircleOutlined,
  BulbOutlined,
  CameraOutlined,
  TeamOutlined,
  TrophyOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookDetail, clearBookDetail } from '@/store/slices/bookSlice';
import { toggleFavoriteBook, toggleFavoriteRestorer } from '@/store/slices/userSlice';
import { getDamageImages } from '@/mock/books';
import Loading from '@/components/Loading';
import KnowledgeModal from '@/components/KnowledgeModal';
import { RESTORATION_STATUS, DAMAGE_TYPES } from '@/types';
import './index.css';

const { Step } = Steps;

const statusMap = {
  [RESTORATION_STATUS.PENDING]: { text: '待修复', color: 'orange' },
  [RESTORATION_STATUS.IN_PROGRESS]: { text: '修复中', color: 'processing' },
  [RESTORATION_STATUS.COMPLETED]: { text: '已修复', color: 'success' }
};

const damageLevelMap = {
  '轻微': 'green',
  '中度': 'orange',
  '严重': 'red'
};

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { bookDetail, restorationProcess, currentRestorer, detailLoading, error } = useSelector((state) => state.book);
  const { favorites, userInfo } = useSelector((state) => state.user);

  const [damageImages, setDamageImages] = useState([]);
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');

  useEffect(() => {
    dispatch(fetchBookDetail(id));
    setDamageImages(getDamageImages(parseInt(id)));
    return () => {
      dispatch(clearBookDetail());
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleFavoriteBook = () => {
    if (bookDetail) {
      dispatch(toggleFavoriteBook(bookDetail.id));
      const isFavorite = favorites.books.includes(bookDetail.id);
      message.success(isFavorite ? '已取消收藏' : '已收藏');
    }
  };

  const handleToggleFavoriteRestorer = () => {
    if (currentRestorer) {
      dispatch(toggleFavoriteRestorer(currentRestorer.id));
      const isFavorite = favorites.restorers.includes(currentRestorer.id);
      message.success(isFavorite ? '已取消关注' : '已关注');
    }
  };

  const handlePlayVideo = (video, title) => {
    setCurrentVideo(video);
    setVideoTitle(title);
    setVideoModalOpen(true);
  };

  const getDamageTypeLabels = (types) => {
    return types.map((t) => {
      const found = DAMAGE_TYPES.find((dt) => dt.value === t);
      return found ? found.label : t;
    });
  };

  if (detailLoading) {
    return <Loading fullscreen text="加载中..." />;
  }

  if (error || !bookDetail) {
    return (
      <div className="error-container">
        <Card>
          <p>{error || '古籍不存在'}</p>
          <Button type="primary" onClick={handleBack}>
            返回
          </Button>
        </Card>
      </div>
    );
  }

  const status = statusMap[bookDetail.status] || { text: '未知', color: 'default' };
  const isBookFavorited = favorites.books.includes(bookDetail.id);
  const isRestorerFavorited = currentRestorer && favorites.restorers.includes(currentRestorer.id);

  return (
    <div className="book-detail-page">
      <div className="detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack} className="back-btn">
          返回
        </Button>
        <h2 className="detail-title">{bookDetail.name}</h2>
        <Button
          icon={<BulbOutlined />}
          type="primary"
          ghost
          onClick={() => setKnowledgeModalOpen(true)}
          className="knowledge-btn"
        >
          修复小知识
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="cover-card" bordered={false}>
            <div className="cover-wrapper">
              <Image
                src={bookDetail.cover}
                alt={bookDetail.name}
                className="book-cover-large"
                preview={false}
              />
              <div className="cover-tags">
                <Tag color={status.color}>{status.text}</Tag>
                <Tag color={damageLevelMap[bookDetail.damageLevel]}>
                  破损: {bookDetail.damageLevel}
                </Tag>
              </div>
            </div>
            <div className="cover-actions">
              <Button
                icon={isBookFavorited ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleToggleFavoriteBook}
                type={isBookFavorited ? 'primary' : 'default'}
                block
              >
                {isBookFavorited ? '已收藏' : '收藏古籍'}
              </Button>
            </div>
            <div className="view-info">
              <EyeOutlined /> {bookDetail.viewCount} 次浏览
            </div>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card className="info-card" bordered={false}>
            <Descriptions column={2} size="middle">
              <Descriptions.Item label="古籍名称">{bookDetail.name}</Descriptions.Item>
              <Descriptions.Item label="作者">{bookDetail.author}</Descriptions.Item>
              <Descriptions.Item label="年代">{bookDetail.era}</Descriptions.Item>
              <Descriptions.Item label="品类">{bookDetail.categoryLabel}</Descriptions.Item>
              <Descriptions.Item label="入藏日期">
                <CalendarOutlined /> {bookDetail.collectedDate}
              </Descriptions.Item>
              <Descriptions.Item label="预计修复周期">
                {bookDetail.estimatedDays ? `${bookDetail.estimatedDays} 天` : '待评估'}
              </Descriptions.Item>
              {bookDetail.completedDate && (
                <Descriptions.Item label="修复完成日期">
                  {bookDetail.completedDate}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="破损类型">
                {getDamageTypeLabels(bookDetail.damageTypes).map((type) => (
                  <Tag key={type} color="blue">{type}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="description-section">
              <h4>古籍简介</h4>
              <p>{bookDetail.description}</p>
            </div>

            <div className="description-section">
              <h4>破损现状</h4>
              <p>{bookDetail.damageDescription}</p>
            </div>

            {damageImages.length > 0 && (
              <div className="damage-gallery-section">
                <h4 className="section-title">
                  <CameraOutlined /> 破损图片资料
                </h4>
                <Row gutter={[12, 12]} className="damage-gallery">
                  {damageImages.map((img, index) => (
                    <Col xs={12} sm={8} md={6} key={index}>
                      <div className="damage-image-item">
                        <Image
                          src={img.url}
                          alt={`破损-${index + 1}`}
                          className="damage-image"
                        />
                        <p className="damage-image-desc">{img.desc}</p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <div className="description-section">
              <h4>修复方案</h4>
              <p>{bookDetail.restorationPlan}</p>
            </div>

            {bookDetail.restorationResult && (
              <div className="description-section restoration-result">
                <h4>修复成果</h4>
                <p className="result-text">{bookDetail.restorationResult}</p>
              </div>
            )}

            {bookDetail.status === RESTORATION_STATUS.IN_PROGRESS && bookDetail.progress !== undefined && (
              <div className="progress-section">
                <div className="progress-header">
                  <span>修复进度</span>
                  <span className="progress-value">{bookDetail.progress}%</span>
                </div>
                <Progress percent={bookDetail.progress} strokeColor={{ from: '#108ee9', to: '#87d068' }} />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {currentRestorer && (
        <Card className="restorer-card" bordered={false}>
          <div className="restorer-header">
            <h3>
              <UserOutlined /> 修复师信息
            </h3>
            <Button
              icon={isRestorerFavorited ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleToggleFavoriteRestorer}
              type={isRestorerFavorited ? 'primary' : 'default'}
            >
              {isRestorerFavorited ? '已关注' : '关注修复师'}
            </Button>
          </div>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={6}>
              <div className="restorer-avatar">
                <Badge.Ribbon text={currentRestorer.title} color="#1890ff">
                  <Avatar size={140} src={currentRestorer.avatar} icon={<UserOutlined />} />
                </Badge.Ribbon>
                <h4 style={{ marginTop: 16 }}>{currentRestorer.name}</h4>
                <p style={{ color: '#8c8c8c', margin: 0 }}>{currentRestorer.department}</p>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <div className="restorer-stats">
                <Row gutter={[16, 16]}>
                  <Col xs={8}>
                    <div className="stat-box">
                      <span className="stat-num">{currentRestorer.experience}</span>
                      <span className="stat-label">从业年限</span>
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="stat-box">
                      <span className="stat-num">{currentRestorer.completedCount}</span>
                      <span className="stat-label">修复数量</span>
                    </div>
                  </Col>
                  <Col xs={8}>
                    <div className="stat-box success">
                      <span className="stat-num">{currentRestorer.successRate}</span>
                      <span className="stat-label">修复成功率</span>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="restorer-info-section">
                <h5><TeamOutlined /> 专业领域</h5>
                <Space wrap>
                  {currentRestorer.specialty.map((s) => (
                    <Tag key={s} color="purple">{s}</Tag>
                  ))}
                </Space>
              </div>
              <div className="restorer-info-section">
                <h5><TrophyOutlined /> 资质证书</h5>
                <Space wrap>
                  {currentRestorer.certification.map((c) => (
                    <Tag key={c} icon={<SafetyCertificateOutlined />} color="green">
                      {c}
                    </Tag>
                  ))}
                </Space>
              </div>
              <div className="restorer-info-section">
                <h5><BookOutlined /> 个人简介</h5>
                <p>{currentRestorer.introduction}</p>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {restorationProcess.length > 0 && (
        <Card className="process-card" bordered={false}>
          <div className="process-header">
            <h3>
              <PlayCircleOutlined /> 修复过程记录
            </h3>
            <Button
              icon={<BulbOutlined />}
              type="link"
              onClick={() => setKnowledgeModalOpen(true)}
            >
              了解修复知识
            </Button>
          </div>
          <Steps
            direction="vertical"
            current={restorationProcess.filter((p) => p.completed).length}
            className="process-steps"
          >
            {restorationProcess.map((step) => (
              <Step
                key={step.step}
                title={
                  <div className="step-title">
                    <Space>
                      <span>{step.name}</span>
                      {step.video && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayVideo(step.video, step.name);
                          }}
                        >
                          观看视频
                        </Button>
                      )}
                    </Space>
                    {step.date && <span className="step-date">{step.date}</span>}
                  </div>
                }
                description={
                  <div className="step-content">
                    <p>{step.description}</p>
                    {step.images && step.images.length > 0 && (
                      <div className="step-images">
                        <Image.PreviewGroup>
                          <Space wrap>
                            {step.images.map((img, idx) => (
                              <Image
                                key={idx}
                                width={120}
                                height={80}
                                src={img}
                                className="step-image"
                              />
                            ))}
                          </Space>
                        </Image.PreviewGroup>
                      </div>
                    )}
                  </div>
                }
                status={step.completed ? 'finish' : 'process'}
              />
            ))}
          </Steps>
        </Card>
      )}

      <KnowledgeModal
        open={knowledgeModalOpen}
        onClose={() => setKnowledgeModalOpen(false)}
      />

      <Modal
        title={videoTitle}
        open={videoModalOpen}
        onCancel={() => setVideoModalOpen(false)}
        footer={null}
        width={800}
        className="video-modal"
      >
        {currentVideo ? (
          <video
            src={currentVideo}
            controls
            autoPlay
            style={{ width: '100%', borderRadius: 8 }}
          />
        ) : (
          <Empty description="视频加载失败" />
        )}
      </Modal>
    </div>
  );
};

export default BookDetail;
