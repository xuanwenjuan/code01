import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Row, Col, Card, Tag, Avatar, Button, Descriptions, message,
  FloatButton, Tooltip, Space, Statistic, Row as AntRow, Col as AntCol
} from 'antd'
import { 
  ArrowLeftOutlined, HeartOutlined, HeartFilled, EyeOutlined,
  LikeOutlined, CommentOutlined, LikeFilled
} from '@ant-design/icons'
import { fetchWorks, likeWork } from '../store/slices/dataSlice'
import { toggleWorkFavorite } from '../store/slices/userSlice'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import CommentSection from '../components/CommentSection'
import EcoKnowledgeModal from '../components/EcoKnowledgeModal'

const WorkDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { works, loading, comments } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)

  const [ecoModalVisible, setEcoModalVisible] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (works.length === 0) {
      dispatch(fetchWorks())
    }
  }, [dispatch, works.length])

  const work = works.find(w => w.id === parseInt(id))
  const isFavorite = currentUser?.favoriteWorks?.includes(work?.id) || false
  const commentsCount = (comments.works[work?.id] || []).length

  const handleLike = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!liked) {
      dispatch(likeWork(work.id))
      setLiked(true)
      message.success('点赞成功')
    }
  }

  const handleFavorite = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleWorkFavorite({ workId: work.id, userId: currentUser.id }))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  if (loading.works) {
    return <LoadingState />
  }

  if (!work) {
    return <EmptyState description="作品不存在" />
  }

  return (
    <div>
      <div 
        className="page-header"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 90, 39, 0.9), rgba(26, 58, 23, 0.95)), url(${work.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/works')}
            style={{ color: 'white', marginBottom: 16, paddingLeft: 0 }}
          >
            返回作品列表
          </Button>
          <h1 style={{ color: 'white', marginBottom: 12 }}>{work.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>作者：{work.author}</span>
            <Tag color={work.type === 'classic' ? 'gold' : 'purple'}>
              {work.type === 'classic' ? '经典作品' : '创新作品'}
            </Tag>
            <Tag color="blue">{work.technique}</Tag>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              <EyeOutlined style={{ marginRight: 4 }} />{work.views} 次浏览
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card 
              style={{ marginBottom: 24 }}
              extra={
                <Space>
                  <Tooltip title="了解草木染环保知识">
                    <Button 
                      icon={<span>🌿</span>}
                      onClick={() => setEcoModalVisible(true)}
                    >
                      环保知识
                    </Button>
                  </Tooltip>
                  <Button 
                    type={isFavorite ? 'primary' : 'default'}
                    icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavorite}
                    danger={isFavorite}
                  >
                    {isFavorite ? '已收藏' : '收藏作品'}
                  </Button>
                </Space>
              }
            >
              <div 
                style={{
                  width: '100%',
                  paddingTop: '75%',
                  background: `url(${work.image}) center/cover`,
                  borderRadius: 8,
                  marginBottom: 24,
                  position: 'relative'
                }}
              >
                <div style={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16,
                  display: 'flex',
                  gap: 8
                }}>
                  {work.colors.map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: color,
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>
                {work.description}
              </p>
            </Card>

            <Card 
              type="inner" 
              style={{ 
                marginBottom: 24, 
                background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                borderColor: '#b7eb8f'
              }}
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 32 }}>🎨</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#389e0d', marginBottom: 8 }}>
                    创作心得
                  </div>
                  <p style={{ color: '#5b8c00', lineHeight: 1.6, margin: 0 }}>
                    这件作品采用{work.type === 'classic' 
                      ? '传承了传统草木染的精髓，每一道工序都遵循古法，力求还原最纯正的自然色彩。' 
                      : '融合了现代设计理念，在传统技法基础上进行创新探索，希望能让古老技艺焕发新生。'
                    }
                    使用{work.material}作为主要染材，通过{work.technique}技法精心制作而成。
                  </p>
                </div>
              </div>
            </Card>

            <CommentSection type="works" itemId={work.id} />
          </Col>

          <Col xs={24} lg={8}>
            <Card style={{ marginBottom: 24 }}>
              <AntRow gutter={16}>
                <AntCol span={12}>
                  <Statistic 
                    title="浏览量" 
                    value={work.views}
                    prefix={<EyeOutlined />}
                    valueStyle={{ color: '#1890ff', fontSize: 20 }}
                  />
                </AntCol>
                <AntCol span={12}>
                  <Statistic 
                    title="点赞数" 
                    value={work.likes}
                    prefix={<HeartOutlined />}
                    valueStyle={{ color: '#f5222d', fontSize: 20 }}
                  />
                </AntCol>
              </AntRow>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <Button 
                  block
                  type={liked ? 'primary' : 'default'}
                  icon={liked ? <LikeFilled /> : <LikeOutlined />}
                  onClick={handleLike}
                  danger={liked}
                >
                  {liked ? '已点赞' : '点赞'}
                </Button>
                <Button 
                  block
                  icon={<CommentOutlined />}
                >
                  评论 ({commentsCount})
                </Button>
              </div>
            </Card>

            <Card title="作品信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="作品名称">{work.title}</Descriptions.Item>
                <Descriptions.Item label="作者">{work.author}</Descriptions.Item>
                <Descriptions.Item label="作品类型">
                  <Tag color={work.type === 'classic' ? 'gold' : 'purple'}>
                    {work.type === 'classic' ? '经典作品' : '创新作品'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="所用技法">{work.technique}</Descriptions.Item>
                <Descriptions.Item label="使用染材">{work.material}</Descriptions.Item>
                <Descriptions.Item label="评论数">{commentsCount}</Descriptions.Item>
                <Descriptions.Item label="发布时间">{work.createTime}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="配色方案" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                {work.colors.map((color, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        background: color,
                        marginBottom: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    <span style={{ fontSize: 12, color: '#666' }}>{color}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card 
              title="环保小贴士" 
              style={{ marginBottom: 24 }}
              extra={
                <Button 
                  type="link" 
                  size="small"
                  onClick={() => setEcoModalVisible(true)}
                >
                  更多
                </Button>
              }
            >
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 32 }}>🌱</span>
                <div>
                  <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                    草木染作品使用天然染料，对环境友好。您也可以尝试自己动手，用身边的植物材料进行创作，体验大自然的色彩魔法。
                  </p>
                </div>
              </div>
            </Card>

            <Card title="相关作品">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {works.filter(w => w.id !== work.id && w.type === work.type).slice(0, 3).map(item => (
                  <div 
                    key={item.id}
                    style={{ 
                      display: 'flex', 
                      gap: 12, 
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 8,
                      transition: 'all 0.3s'
                    }}
                    className="card-hover"
                    onClick={() => navigate(`/work/${item.id}`)}
                  >
                    <div 
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 4,
                        background: `url(${item.image}) center/cover`,
                        flexShrink: 0
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{item.title}</div>
                      <div style={{ color: '#999', fontSize: 12 }}>{item.technique}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <FloatButton
        icon={<span style={{ fontSize: 20 }}>🌿</span>}
        description="环保知识"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setEcoModalVisible(true)}
      />

      <EcoKnowledgeModal 
        visible={ecoModalVisible} 
        onClose={() => setEcoModalVisible(false)} 
      />
    </div>
  )
}

export default WorkDetail
