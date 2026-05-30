import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Typography,
  Card,
  Button,
  Tag,
  Avatar,
  Descriptions,
  Space,
  Tabs,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ToolOutlined,
  ClockCircleOutlined,
  StarOutlined,
  UserOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { fetchTechniques } from '@/store/techniquesSlice';
import { fetchArtisans } from '@/store/artisansSlice';
import { fetchWorks } from '@/store/worksSlice';
import { toggleFavorite, addToHistory } from '@/store/userSlice';
import Loading from '@/components/Loading';
import ProcessDetail from '@/components/ProcessDetail';
import MessageBoard from '@/components/MessageBoard';
import KnowledgeTooltip from '@/components/KnowledgeTooltip';
import WorkCard from '@/components/WorkCard';
import './TechniqueDetail.css';

const { Title, Paragraph } = Typography;

const TechniqueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(Number(id) || 1);
  const [isFavorite, setIsFavorite] = useState(false);

  const { list: techniques, loading: techniquesLoading } = useSelector(
    state => state.techniques
  );
  const { list: artisans, loading: artisansLoading } = useSelector(
    state => state.artisans
  );
  const { list: works, loading: worksLoading } = useSelector(
    state => state.works
  );
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchTechniques());
    dispatch(fetchArtisans());
    dispatch(fetchWorks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(addToHistory(Number(id)));
  }, [dispatch, id]);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(Number(id) + 1000));
  }, [id]);

  const currentTechnique = techniques.find(t => t.id === activeTab);

  const handleFavorite = () => {
    if (!user) {
      message.warning('请先登录后再收藏');
      navigate('/login');
      return;
    }
    const techId = activeTab + 1000;
    dispatch(toggleFavorite(techId));
    setIsFavorite(!isFavorite);
    message.success(isFavorite ? '已取消收藏' : '收藏成功');
  };

  const handleTabChange = key => {
    setActiveTab(Number(key));
    navigate(`/technique/${key}`);
  };

  if (techniquesLoading || artisansLoading || worksLoading) {
    return <Loading text="加载中..." />;
  }

  if (!currentTechnique) {
    return (
      <div className="technique-detail-page">
        <Card>
          <p>未找到该工艺信息</p>
        </Card>
      </div>
    );
  }

  const relatedArtisans = artisans.filter(a =>
    currentTechnique.artisans?.includes(a.id)
  );
  const relatedWorks = works.filter(w =>
    currentTechnique.relatedWorks?.includes(w.id)
  );

  const tabItems = techniques.map(tech => ({
    key: tech.id,
    label: (
      <div className="tab-label">
        <PlayCircleOutlined className="tab-icon" />
        <span>{tech.name}</span>
      </div>
    ),
  }));

  const contentTabItems = [
    {
      key: 'process',
      label: '制作流程',
      children: <ProcessDetail steps={currentTechnique.steps} />,
    },
    {
      key: 'artisans',
      label: '传承人',
      children: (
        <div className="artisans-section">
          {relatedArtisans.length > 0 ? (
            <Row gutter={[24, 24]}>
              {relatedArtisans.map(artisan => (
                <Col xs={24} md={12} lg={12} key={artisan.id}>
                  <Card className="artisan-card" hoverable>
                    <div className="artisan-header">
                      <Avatar size={80} src={artisan.avatar} />
                      <div className="artisan-info">
                        <Title level={4} className="artisan-name">
                          {artisan.name}
                        </Title>
                        <Tag color="gold">{artisan.title}</Tag>
                        <div className="artisan-stats">
                          <Space size={16}>
                            <span>
                              <ClockCircleOutlined /> 从业 {artisan.experience}
                            </span>
                            <span>
                              <StarOutlined /> 擅长：{artisan.specialty}
                            </span>
                          </Space>
                        </div>
                      </div>
                    </div>
                    <Paragraph className="artisan-bio">
                      {artisan.bio}
                    </Paragraph>
                    <div className="artisan-works">
                      <Title level={5} className="works-title">
                        代表作品
                      </Title>
                      <Row gutter={[12, 12]}>
                        {works
                          .filter(w => w.artist.includes(artisan.name.slice(0, 2)))
                          .slice(0, 3)
                          .map(work => (
                            <Col xs={8} key={work.id}>
                              <div
                                className="mini-work-card"
                                onClick={() => navigate(`/work/${work.id}`)}
                              >
                                <img src={work.image} alt={work.name} />
                                <span>{work.name}</span>
                              </div>
                            </Col>
                          ))}
                      </Row>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <p className="empty-text">暂无传承人信息</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'history',
      label: '历史渊源',
      children: (
        <Card className="history-card">
          <div className="history-content">
            <HistoryOutlined className="history-icon" />
            <div>
              <Paragraph className="history-text">
                {currentTechnique.history}
              </Paragraph>
              <div className="knowledge-tags">
                <span className="knowledge-label">相关知识点：</span>
                <KnowledgeTooltip keyword="花丝镶嵌">花丝镶嵌</KnowledgeTooltip>
                <KnowledgeTooltip keyword="燕京八绝">燕京八绝</KnowledgeTooltip>
                <KnowledgeTooltip keyword="累丝">累丝</KnowledgeTooltip>
                <KnowledgeTooltip keyword="烧蓝">烧蓝</KnowledgeTooltip>
                <KnowledgeTooltip keyword="金镶玉">金镶玉</KnowledgeTooltip>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: 'works',
      label: '相关作品',
      children: (
        <div className="related-works">
          {relatedWorks.length > 0 ? (
            <Row gutter={[24, 24]}>
              {relatedWorks.map(work => (
                <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                  <WorkCard work={work} />
                </Col>
              ))}
            </Row>
          ) : (
            <Card>
              <p className="empty-text">暂无相关作品</p>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'messages',
      label: '留言咨询',
      children: <MessageBoard techniqueId={activeTab} />,
    },
  ];

  return (
    <div className="technique-detail-page">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          返回
        </Button>
        <Button
          icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
          onClick={handleFavorite}
          className="favorite-btn"
        >
          {isFavorite ? '已收藏' : '收藏工艺'}
        </Button>
      </div>

      <Card className="tech-tabs-card">
        <Tabs
          activeKey={String(activeTab)}
          items={tabItems}
          onChange={handleTabChange}
          className="tech-tabs"
        />
      </Card>

      <Card className="tech-info-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <div className="video-section">
              <div className="video-wrapper">
                <video
                  controls
                  width="100%"
                  poster="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop"
                >
                  <source src={currentTechnique.video} type="video/mp4" />
                  您的浏览器不支持视频播放
                </video>
              </div>
            </div>
          </Col>
          <Col xs={24} lg={10}>
            <div className="tech-info">
              <Title level={2} className="tech-title">
                {currentTechnique.name}
                <KnowledgeTooltip keyword={currentTechnique.name.includes('拉丝') ? '拔丝板' : '累丝'} />
              </Title>
              <Paragraph className="tech-desc">
                {currentTechnique.description}
              </Paragraph>
              <Descriptions column={1} size="small" className="tech-desc-list">
                <Descriptions.Item
                  label={
                    <span>
                      <ToolOutlined /> 所需工具
                    </span>
                  }
                >
                  {currentTechnique.tools?.map((tool, index) => (
                    <Tag key={index} className="tool-tag">
                      {tool}
                    </Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <ClockCircleOutlined /> 制作周期
                    </span>
                  }
                >
                  <span className="info-value">{currentTechnique.duration}</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <StarOutlined /> 难度系数
                    </span>
                  }
                >
                  <span className="difficulty">{currentTechnique.difficulty}</span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <UserOutlined /> 传承人
                    </span>
                  }
                >
                  {relatedArtisans.map((a, i) => (
                    <span key={a.id} className="artisan-link">
                      {a.name}
                      {i < relatedArtisans.length - 1 && '、'}
                    </span>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="content-tabs-card" styles={{ body: { padding: 0 } }}>
        <Tabs
          defaultActiveKey="process"
          items={contentTabItems}
          className="content-tabs"
          size="large"
        />
      </Card>
    </div>
  );
};

export default TechniqueDetail;
