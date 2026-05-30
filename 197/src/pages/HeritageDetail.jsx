import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Button,
  Tag,
  Image,
  Modal,
  message,
  Row,
  Col,
  List,
  Avatar,
  Space,
  Tabs,
  Divider,
  Card,
  Tooltip,
  Badge,
  Descriptions
} from 'antd'
import {
  HeartOutlined,
  HeartFilled,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  TeamOutlined,
  PictureOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { incrementViews } from '../store/slices/heritageSlice'
import { toggleFavorite, toggleMediaFavorite, addViewHistory } from '../store/slices/userSlice'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'

const HeritageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { heritages } = useSelector(state => state.heritage)
  const { currentUser, favorites, favoriteMedia } = useSelector(state => state.user)
  const [loading, setLoading] = useState(true)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false)
  const [currentKnowledge, setCurrentKnowledge] = useState(null)
  const [activeTab, setActiveTab] = useState('history')

  const heritage = heritages.find(h => h.id === parseInt(id))
  const isFavorite = favorites.includes(parseInt(id))

  useEffect(() => {
    if (heritages.length > 0) {
      setLoading(false)
      if (heritage) {
        dispatch(incrementViews(heritage.id))
        if (currentUser) {
          dispatch(addViewHistory(heritage.id))
        }
      }
    }
  }, [id, heritages, dispatch, heritage, currentUser])

  const handleFavorite = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(parseInt(id)))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const handleImagePreview = (url, title) => {
    setPreviewImage(url)
    setPreviewTitle(title)
    setPreviewVisible(true)
  }

  const handleMediaFavorite = (e, mediaId) => {
    e.stopPropagation()
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleMediaFavorite(mediaId))
    message.success(favoriteMedia.includes(mediaId) ? '已取消收藏' : '收藏成功')
  }

  const handleKnowledgeClick = (knowledge) => {
    setCurrentKnowledge(knowledge)
    setKnowledgeModalVisible(true)
  }

  if (loading) {
    return <Loading tip="加载中..." />
  }

  if (!heritage) {
    return (
      <div className="container">
        <EmptyState description="未找到该非遗项目" actionText="返回首页" onAction={() => navigate('/')} />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'history',
      label: (
        <span>
          <BookOutlined /> 历史渊源
        </span>
      )
    },
    {
      key: 'inheritance',
      label: (
        <span>
          <TeamOutlined /> 传承脉络
        </span>
      )
    },
    {
      key: 'media',
      label: (
        <span>
          <PictureOutlined /> 数字化展品
        </span>
      )
    },
    {
      key: 'knowledge',
      label: (
        <span>
          <BulbOutlined /> 非遗知识
        </span>
      )
    }
  ]

  const renderHistory = () => (
    <div style={{ padding: '24px 0' }}>
      {heritage.backgroundDetail && (
        <div style={{ marginBottom: 32 }}>
          <Card title="历史背景" style={{ borderRadius: 8 }}>
            <p style={{ lineHeight: 2, color: '#555', fontSize: 15, textIndent: '2em' }}>
              {heritage.backgroundDetail}
            </p>
          </Card>
        </div>
      )}

      <h3 style={{ marginBottom: 20, color: '#333' }}>发展历程</h3>
      {heritage.history && heritage.history.length > 0 ? (
        <div>
          {heritage.history.map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-year">{item.year}</div>
              <div className="timeline-content">{item.content}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState description="暂无历史渊源信息" />
      )}
    </div>
  )

  const renderInheritance = () => (
    <div style={{ padding: '24px 0' }}>
      {heritage.inheritance && heritage.inheritance.length > 0 ? (
        <List
          dataSource={heritage.inheritance}
          renderItem={(item, index) => (
            <List.Item
              key={index}
              style={{
                padding: '24px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <Card
                style={{ width: '100%', borderRadius: 8 }}
                bodyStyle={{ padding: '24px' }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={64}
                      icon={<UserOutlined />}
                      style={{ background: 'linear-gradient(135deg, #d4380d, #ff7a45)' }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18, fontWeight: 600 }}>{item.name}</span>
                      {item.school && (
                        <Tag color="geekblue" style={{ fontSize: 13 }}>
                          {item.school}
                        </Tag>
                      )}
                      <Tag color="blue">{item.period}</Tag>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: 12 }}>
                      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                        {item.description}
                      </p>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <EmptyState description="暂无传承人信息" />
      )}
    </div>
  )

  const renderMedia = () => (
    <div style={{ padding: '24px 0' }}>
      {heritage.media && heritage.media.length > 0 ? (
        <div className="media-grid">
          {heritage.media.map((item, index) => (
            <div key={item.id || index} className="media-item">
              <img src={item.url} alt={item.title} />
              {item.type === 'video' && (
                <div className="media-play">
                  <PlayCircleOutlined />
                </div>
              )}
              <div
                onClick={(e) => handleMediaFavorite(e, item.id)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  zIndex: 2
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {favoriteMedia.includes(item.id) ? (
                  <HeartFilled style={{ color: '#d4380d', fontSize: 18 }} />
                ) : (
                  <HeartOutlined style={{ color: '#666', fontSize: 18 }} />
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '20px 12px 12px',
                  color: 'white'
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                {item.description && (
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState description="暂无数字化展品" />
      )}
    </div>
  )

  const renderKnowledge = () => (
    <div style={{ padding: '24px 0' }}>
      {heritage.knowledge && heritage.knowledge.length > 0 ? (
        <Row gutter={[24, 24]}>
          {heritage.knowledge.map((item, index) => (
            <Col xs={24} md={12} key={index}>
              <Card
                hoverable
                onClick={() => handleKnowledgeClick(item)}
                style={{
                  borderRadius: 8,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fff2e8, #ffe7d6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <QuestionCircleOutlined style={{ fontSize: 24, color: '#d4380d' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px', color: '#333', lineHeight: 1.6 }}>
                      {item.question}
                    </h4>
                    <p style={{
                      color: '#888',
                      fontSize: 13,
                      lineHeight: 1.6,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.answer}
                    </p>
                    <div style={{ marginTop: 12, color: '#d4380d', fontSize: 13 }}>
                      点击查看详情 →
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState description="暂无非遗相关知识" />
      )}
    </div>
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{
        background: `linear-gradient(135deg, rgba(26,26,46,0.85), rgba(15,52,96,0.85)), url(${heritage.cover})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        padding: '60px 0'
      }}>
        <div className="container">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 24, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
          >
            返回
          </Button>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <h1 style={{ color: 'white', fontSize: 36, margin: 0 }}>{heritage.name}</h1>
                <Tag color={heritage.level === '世界级' ? 'red' : 'green'} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {heritage.level}
                </Tag>
                {heritage.isEndangered && <Tag color="warning">濒危</Tag>}
                {heritage.isHot && <Tag color="orange">热门</Tag>}
              </div>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: 20 }}>
                {heritage.description}
              </p>
              <Space size="large" wrap>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EnvironmentOutlined /> {heritage.origin}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined /> {heritage.heritageTime}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <EyeOutlined /> {heritage.views} 次浏览
                </span>
                <span className="category-tag" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  {heritage.categoryName}
                </span>
              </Space>
              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  style={{ background: isFavorite ? '#d4380d' : 'rgba(255,255,255,0.2)', border: 'none' }}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <div className="detail-section">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
            style={{ marginBottom: 0 }}
          />

          <Divider style={{ margin: '16px 0' }} />

          {activeTab === 'history' && renderHistory()}
          {activeTab === 'inheritance' && renderInheritance()}
          {activeTab === 'media' && renderMedia()}
          {activeTab === 'knowledge' && renderKnowledge()}
        </div>
      </div>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <Image src={previewImage} alt={previewTitle} style={{ width: '100%' }} />
      </Modal>

      <Modal
        open={knowledgeModalVisible}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <QuestionCircleOutlined style={{ color: '#d4380d' }} />
            非遗知识问答
          </div>
        }
        onCancel={() => setKnowledgeModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        {currentKnowledge && (
          <div>
            <Card style={{ borderRadius: 8, marginBottom: 16 }}>
              <h4 style={{ color: '#333', marginBottom: 16, fontSize: 16 }}>
                问：{currentKnowledge.question}
              </h4>
              <p style={{
                color: '#555',
                lineHeight: 2,
                fontSize: 15,
                textIndent: '2em',
                margin: 0
              }}>
                {currentKnowledge.answer}
              </p>
            </Card>
            <div style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>
              💡 学习非遗知识，传承文化瑰宝
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default HeritageDetail
