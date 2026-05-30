import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Image,
  Tag,
  Button,
  Card,
  Timeline,
  Table,
  Avatar,
  message,
  Tabs,
  Modal,
  Carousel,
  Divider,
  Statistic,
  Descriptions,
  Steps
} from 'antd'
import {
  HeartOutlined,
  HeartFilled,
  LeftOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  LikeOutlined,
  LikeFilled,
  BookOutlined,
  HistoryOutlined,
  UserOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { fetchIncenseDetail, clearDetail } from '@/store/slices/incenseSlice'
import { fetchInheritorDetail, clearDetail as clearInheritorDetail } from '@/store/slices/inheritorSlice'
import { toggleFavorite, addHistory, toggleFollow, toggleLike } from '@/store/slices/userSlice'
import { getCulturePointsByCategory } from '@/mock/culturePoints'
import PageLoading from '@/components/PageLoading'
import PageError from '@/components/PageError'
import './index.css'

const { TabPane } = Tabs
const { Meta } = Card

const IncenseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail: incense, status, error } = useSelector(state => state.incense)
  const { detail: inheritor } = useSelector(state => state.inheritor)
  const currentUser = useSelector(state => state.user.currentUser)

  const [cultureModalVisible, setCultureModalVisible] = useState(false)
  const [selectedCulturePoint, setSelectedCulturePoint] = useState(null)
  const [activeTab, setActiveTab] = useState('material')
  const [likeCount, setLikeCount] = useState(0)

  const favorites = currentUser?.favorites || []
  const following = currentUser?.following || []
  const likes = currentUser?.likes || []
  const isFavorited = favorites.includes(parseInt(id))
  const isFollowing = inheritor && following.includes(inheritor.id)
  const isLiked = likes.includes(parseInt(id))

  useEffect(() => {
    setLikeCount(Math.floor(Math.random() * 500) + 100)
    dispatch(fetchIncenseDetail(id))
    return () => {
      dispatch(clearDetail())
      dispatch(clearInheritorDetail())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (incense) {
      dispatch(fetchInheritorDetail(incense.inheritorId))
      if (currentUser) {
        dispatch(addHistory(incense.id))
      }
    }
  }, [dispatch, incense, currentUser])

  const handleFavorite = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(incense.id))
    message.success(isFavorited ? '已取消收藏' : '收藏成功')
  }

  const handleLike = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleLike(incense.id))
    if (!isLiked) {
      setLikeCount(prev => prev + 1)
    } else {
      setLikeCount(prev => prev - 1)
    }
    message.success(isLiked ? '已取消点赞' : '点赞成功')
  }

  const handleFollow = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFollow(inheritor.id))
    message.success(isFollowing ? '已取消关注' : '关注成功')
  }

  const openCultureModal = (point) => {
    setSelectedCulturePoint(point)
    setCultureModalVisible(true)
  }

  const culturePoints = incense ? getCulturePointsByCategory(incense.category) : []

  if (status === 'loading' || !incense) return <PageLoading />
  if (status === 'failed') return <PageError onRetry={() => dispatch(fetchIncenseDetail(id))} />

  const materialColumns = [
    {
      title: '原料名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text) => <span style={{ fontWeight: 500, color: '#8B4513' }}>{text}</span>
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin',
      width: 150,
      render: (text) => (
        <span>
          <EnvironmentOutlined style={{ marginRight: 4, color: '#d4af37' }} />
          {text}
        </span>
      )
    },
    {
      title: '占比',
      dataIndex: 'proportion',
      key: 'proportion',
      width: 80,
      render: (text) => <Tag color="gold">{text}</Tag>
    },
    {
      title: '原料说明',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span style={{ color: '#666' }}>{text}</span>
    }
  ]

  return (
    <div className="incense-detail-page">
      <Button
        type="text"
        icon={<LeftOutlined />}
        onClick={() => navigate(-1)}
        className="back-btn"
      >
        返回
      </Button>

      <Row gutter={[40, 40]} className="detail-main">
        <Col xs={24} lg={12}>
          <div className="detail-gallery">
            <Carousel className="main-carousel">
              {incense.images.map((img, index) => (
                <div key={index}>
                  <Image src={img} className="main-image" />
                </div>
              ))}
            </Carousel>
            <div className="thumbnail-list">
              {incense.images.map((img, index) => (
                <Image key={index} src={img} className="thumbnail" width={80} height={80} />
              ))}
            </div>
            {incense.video && (
              <div className="video-preview" onClick={() => setActiveTab('craft')}>
                <PlayCircleOutlined className="play-icon" />
                <span>观看制作视频</span>
              </div>
            )}
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div className="detail-info">
            <div className="info-header">
              <h1>{incense.name}</h1>
              <div className="info-tags">
                {incense.type === 'ancient' ? (
                  <Tag color="gold" className="big-tag">古法传承</Tag>
                ) : (
                  <Tag color="red" className="big-tag">新品上市</Tag>
                )}
                <Tag color="purple">非遗认证</Tag>
                <Tag color="cyan">天然原料</Tag>
              </div>
            </div>

            <div className="info-price">
              <span className="price-label">价格</span>
              <span className="price-value">¥{incense.price}</span>
              <span className="price-unit">/份</span>
            </div>

            <p className="info-description">{incense.description}</p>

            <div className="info-stats">
              <Statistic
                title="收藏数"
                value={favorites.length + Math.floor(Math.random() * 200)}
                prefix={<HeartOutlined />}
                className="stat-item"
              />
              <Statistic
                title="点赞数"
                value={likeCount}
                prefix={<LikeOutlined />}
                className="stat-item"
              />
              <Statistic
                title="浏览量"
                value={Math.floor(Math.random() * 5000) + 1000}
                className="stat-item"
              />
            </div>

            <div className="info-meta">
              <div className="meta-item">
                <span className="meta-label">产地</span>
                <span className="meta-value">
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {incense.origin}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">上架时间</span>
                <span className="meta-value">{incense.createTime}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">规格</span>
                <span className="meta-value">{incense.spec || '20克/盒'}</span>
              </div>
            </div>

            <div className="info-features">
              <div className="feature-item">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>天然原料</span>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>手工制作</span>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>品质保证</span>
              </div>
              <div className="feature-item">
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>非遗认证</span>
              </div>
            </div>

            <div className="info-actions">
              <Button
                type={isFavorited ? 'default' : 'primary'}
                icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={handleFavorite}
                size="large"
                className="action-btn"
              >
                {isFavorited ? '已收藏' : '收藏'}
              </Button>
              <Button
                type={isLiked ? 'default' : 'primary'}
                icon={isLiked ? <LikeFilled style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                onClick={handleLike}
                size="large"
                className="action-btn"
                style={{ background: isLiked ? '#fff' : '#1890ff', borderColor: isLiked ? '#d9d9d9' : '#1890ff' }}
              >
                {isLiked ? '已点赞' : '点赞'}
              </Button>
            </div>

            <div className="culture-tips">
              <h4>
                <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                香道文化知识点
              </h4>
              <div className="tips-list">
                {culturePoints.slice(0, 3).map(point => (
                  <div
                    key={point.id}
                    className="tip-item"
                    onClick={() => openCultureModal(point)}
                  >
                    <span className="tip-icon">{point.icon}</span>
                    <span className="tip-title">{point.title}</span>
                    <InfoCircleOutlined className="tip-arrow" />
                  </div>
                ))}
                <div
                  className="tip-item more-tip"
                  onClick={() => openCultureModal(null)}
                >
                  <BookOutlined style={{ marginRight: 8 }} />
                  查看更多知识点
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="detail-tabs"
        items={[
          {
            key: 'material',
            label: (
              <span>
                <EnvironmentOutlined />
                原料溯源
              </span>
            ),
            children: (
              <Card title="香品配方溯源" className="section-card">
                <Descriptions column={2} bordered className="material-desc">
                  <Descriptions.Item label="香品名称">{incense.name}</Descriptions.Item>
                  <Descriptions.Item label="产地">{incense.origin}</Descriptions.Item>
                  <Descriptions.Item label="制作工艺">传统手工制作</Descriptions.Item>
                  <Descriptions.Item label="保质期">36个月</Descriptions.Item>
                </Descriptions>
                <Divider orientation="left">原料详情</Divider>
                <Table
                  columns={materialColumns}
                  dataSource={incense.materials}
                  pagination={false}
                  rowKey="name"
                  expandable={{
                    expandedRowRender: (record) => (
                      <div className="material-detail">
                        <p><strong>原料说明：</strong>{record.description}</p>
                        <p><strong>产地介绍：</strong>{record.originDetail || '该原料产自优质产区，经过严格筛选，确保品质纯正。'}</p>
                      </div>
                    )
                  }}
                />
                <div className="material-sourcing">
                  <h4><HistoryOutlined style={{ color: '#d4af37', marginRight: 8 }} />原料溯源保障</h4>
                  <Steps
                    direction="vertical"
                    size="small"
                    items={[
                      { title: '原料采购', description: '从原产地直接采购，确保原料纯正' },
                      { title: '严格筛选', description: '经过3轮筛选，去除杂质和劣质原料' },
                      { title: '传统炮制', description: '遵循古法炮制工艺，激发原料香气' },
                      { title: '配方调配', description: '按"君臣佐使"原则精心调配' },
                      { title: '成品检测', description: '每批产品都经过严格的品质检测' }
                    ]}
                  />
                </div>
              </Card>
            )
          },
          {
            key: 'craft',
            label: (
              <span>
                <PlayCircleOutlined />
                制作工艺
              </span>
            ),
            children: (
              <Card title="传统制作工艺" className="section-card">
                {incense.video && (
                  <div className="video-wrapper">
                    <video controls className="craft-video" poster={incense.images[0]}>
                      <source src={incense.video} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>
                  </div>
                )}
                <Divider orientation="left">制作流程</Divider>
                <div className="craft-gallery">
                  {incense.craftSteps.slice(0, 4).map((step, index) => (
                    <Card key={index} className="craft-step-card" cover={<Image src={`https://images.unsplash.com/photo-1607439698614-7b1106ceb461?w=300&h=200&fit=crop`} />}>
                      <Meta
                        title={`第 ${step.step} 步：${step.title}`}
                        description={step.desc}
                      />
                    </Card>
                  ))}
                </div>
                <Divider orientation="left">详细步骤</Divider>
                <Timeline
                  mode="left"
                  className="craft-timeline"
                  items={incense.craftSteps.map(step => ({
                    color: '#d4af37',
                    label: `第 ${step.step} 步`,
                    children: (
                      <div className="timeline-content">
                        <h4>{step.title}</h4>
                        <p>{step.desc}</p>
                      </div>
                    )
                  }))}
                />
              </Card>
            )
          },
          {
            key: 'inheritor',
            label: (
              <span>
                <UserOutlined />
                传承人
              </span>
            ),
            children: inheritor ? (
              <Card className="section-card">
                <div className="inheritor-detail">
                  <div className="inheritor-avatar-large">
                    <Avatar src={inheritor.avatar} size={150} />
                    <h2 style={{ textAlign: 'center', marginTop: 16 }}>{inheritor.name}</h2>
                    <Tag color="gold" style={{ margin: '0 auto', display: 'block' }}>{inheritor.title}</Tag>
                    <Button
                      type={isFollowing ? 'default' : 'primary'}
                      onClick={handleFollow}
                      style={{ marginTop: 12 }}
                      block
                    >
                      {isFollowing ? '已关注' : '关注传承人'}
                    </Button>
                  </div>
                  <div className="inheritor-content">
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="籍贯">{inheritor.origin}</Descriptions.Item>
                      <Descriptions.Item label="从艺年限">{inheritor.experience}</Descriptions.Item>
                    </Descriptions>
                    <p className="inheritor-bio">{inheritor.description}</p>
                    <div className="inheritor-philosophy">
                      <blockquote>"{inheritor.philosophy}"</blockquote>
                    </div>
                    <Divider orientation="left">主要成就</Divider>
                    <ul className="achievement-list">
                      {inheritor.achievements.map((item, index) => (
                        <li key={index}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {inheritor.resume && (
                      <>
                        <Divider orientation="left">从艺履历</Divider>
                        <Timeline
                          className="resume-timeline"
                          items={inheritor.resume.map((item, index) => ({
                            color: index === inheritor.resume.length - 1 ? '#d4af37' : '#e8e8e8',
                            children: (
                              <div>
                                <Tag color="gold">{item.year}</Tag>
                                <span style={{ marginLeft: 8 }}>{item.event}</span>
                              </div>
                            )
                          }))}
                        />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ) : <PageLoading />
          }
        ]}
      />

      <Modal
        title={selectedCulturePoint ? `${selectedCulturePoint.icon} ${selectedCulturePoint.title}` : '香道文化知识点'}
        open={cultureModalVisible}
        onCancel={() => setCultureModalVisible(false)}
        footer={null}
        width={600}
        className="culture-modal"
        closeIcon={<CloseOutlined />}
      >
        {selectedCulturePoint ? (
          <div className="culture-detail">
            <p style={{ fontSize: 16, lineHeight: 1.8 }}>{selectedCulturePoint.content}</p>
          </div>
        ) : (
          <div className="culture-list">
            {culturePoints.map(point => (
              <Card key={point.id} className="culture-card" onClick={() => setSelectedCulturePoint(point)}>
                <div className="culture-card-content">
                  <span className="culture-icon">{point.icon}</span>
                  <div>
                    <h4>{point.title}</h4>
                    <p>{point.content.substring(0, 60)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default IncenseDetail
