import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Rate,
  Avatar,
  Steps,
  Tabs,
  List,
  Image,
  Descriptions,
  message,
  Modal,
  Form,
  Input,
  Popover,
  Divider,
  Badge,
  Tooltip
} from 'antd'
import {
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  UserOutlined,
  PlusOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ToolOutlined,
  AppstoreOutlined,
  BulbOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  SendOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { fetchMortiseDetail, clearDetail } from '@/store/slices/mortiseSlice'
import { toggleFavorite, toggleFollow, addBrowsingHistory } from '@/store/slices/userSlice'
import Loading from '@/components/Loading'
import ErrorState from '@/components/ErrorState'
import MortiseCard from '@/components/MortiseCard'
import { designers } from '@/mock/users'
import { allMortises } from '@/mock/mortises'
import { comments, knowledgePoints } from '@/mock/comments'

const { Step } = Steps
const { TabPane } = Tabs
const { Meta } = Card
const { TextArea } = Input

const MortiseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail, detailLoading, error } = useSelector(state => state.mortise)
  const { favorites, following } = useSelector(state => state.user)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [commentModalVisible, setCommentModalVisible] = useState(false)
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false)
  const [currentKnowledge, setCurrentKnowledge] = useState(null)
  const [commentList, setCommentList] = useState([])
  const [commentForm] = Form.useForm()
  const [replyTo, setReplyTo] = useState(null)
  const [likedComments, setLikedComments] = useState([])

  useEffect(() => {
    if (id) {
      dispatch(fetchMortiseDetail(id))
      const mortise = allMortises.find(m => m.id === parseInt(id))
      if (mortise) {
        dispatch(addBrowsingHistory({ id: parseInt(id), name: mortise.name }))
      }
      setCommentList(comments[id] || [])
    }
    return () => {
      dispatch(clearDetail())
    }
  }, [id, dispatch])

  const isFavorite = favorites.includes(parseInt(id))
  const designer = detail ? designers.find(d => d.id === detail.designerId) : null
  const isFollowing = designer && following.includes(designer.id)
  const relatedMortises = detail
    ? allMortises.filter(m => m.category === detail.category && m.id !== detail.id).slice(0, 4)
    : []
  const kps = knowledgePoints[id] || []

  const handleFavorite = () => {
    if (!isAuthenticated) {
      message.warning('请先登录后再收藏')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(parseInt(id)))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const handleFollow = () => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (designer) {
      dispatch(toggleFollow(designer.id))
      message.success(isFollowing ? '已取消关注' : '关注成功')
    }
  }

  const handleShare = () => {
    message.success('链接已复制到剪贴板')
  }

  const playVideo = (video) => {
    setCurrentVideo(video)
    setVideoModalVisible(true)
  }

  const showKnowledge = (kp) => {
    setCurrentKnowledge(kp)
    setKnowledgeModalVisible(true)
  }

  const handleCommentLike = (commentId) => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (likedComments.includes(commentId)) {
      setLikedComments(likedComments.filter(id => id !== commentId))
    } else {
      setLikedComments([...likedComments, commentId])
      setCommentList(commentList.map(c =>
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ))
    }
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录后发表评论')
      navigate('/login')
      return
    }
    try {
      const values = await commentForm.validateFields()
      const newComment = {
        id: Date.now(),
        userId: user?.id,
        userName: user?.name,
        userAvatar: user?.avatar,
        content: values.content,
        rating: values.rating || 5,
        likes: 0,
        createdAt: new Date().toLocaleString('zh-CN'),
        replies: []
      }
      if (replyTo) {
        setCommentList(commentList.map(c =>
          c.id === replyTo.id
            ? {
                ...c,
                replies: [...c.replies, {
                  id: Date.now(),
                  userId: user?.id,
                  userName: user?.name,
                  userAvatar: user?.avatar,
                  content: `回复 @${replyTo.userName}: ${values.content}`,
                  createdAt: new Date().toLocaleString('zh-CN')
                }]
              }
            : c
        ))
        message.success('回复成功')
      } else {
        setCommentList([newComment, ...commentList])
        message.success('评论成功')
      }
      commentForm.resetFields()
      setCommentModalVisible(false)
      setReplyTo(null)
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  const openReply = (comment) => {
    if (!isAuthenticated) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    setReplyTo(comment)
    setCommentModalVisible(true)
  }

  if (detailLoading) {
    return <Loading text="加载详情..." />
  }

  if (error || !detail) {
    return <ErrorState title="加载失败" subTitle={error || '榫卯详情不存在'} />
  }

  const getDifficultyText = (level) => {
    const texts = ['', '入门', '简单', '中等', '困难', '专家']
    return texts[level] || '未知'
  }

  const getCategoryName = (category) => {
    const names = {
      classic: '经典榫卯',
      innovative: '创新榫卯',
      furniture: '家具榫卯',
      architecture: '建筑榫卯',
      decoration: '装饰榫卯'
    }
    return names[category] || '其他'
  }

  const getCategoryColor = (category) => {
    const colors = {
      classic: '#faad14',
      innovative: '#1890ff',
      furniture: '#52c41a',
      architecture: '#722ed1',
      decoration: '#eb2f96'
    }
    return colors[category] || '#8c8c8c'
  }

  const KnowledgeBadge = ({ kp }) => (
    <Tooltip title={kp.title}>
      <Button
        type="text"
        icon={<BulbOutlined style={{ color: '#faad14' }} />}
        onClick={() => showKnowledge(kp)}
        style={{ padding: '4px 8px' }}
        size="small"
      >
        <span style={{ fontSize: 12 }}>知识点</span>
      </Button>
    </Tooltip>
  )

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100%', padding: '24px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>

        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <div style={{ position: 'relative', paddingTop: '75%', borderRadius: 8, overflow: 'hidden' }}>
                <Image
                  src={detail.coverImage}
                  alt={detail.name}
                  preview={false}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Tag
                  color={getCategoryColor(detail.category)}
                  style={{ position: 'absolute', top: 16, left: 16, fontSize: 14 }}
                >
                  {getCategoryName(detail.category)}
                </Tag>
                {kps.length > 0 && (
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <Popover
                      title={
                        <span>
                          <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                          工艺知识点 ({kps.length})
                        </span>
                      }
                      content={
                        <div style={{ maxWidth: 300 }}>
                          <List
                            size="small"
                            dataSource={kps}
                            renderItem={kp => (
                              <List.Item
                                style={{ cursor: 'pointer', padding: '8px 0' }}
                                onClick={() => showKnowledge(kp)}
                              >
                                <List.Item.Meta
                                  title={<span style={{ color: '#1890ff' }}>{kp.title}</span>}
                                  description={
                                    <span style={{ fontSize: 12, color: '#888' }}>
                                      相关：{kp.relatedPart}
                                    </span>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        </div>
                      }
                      trigger="click"
                    >
                      <Button
                        type="primary"
                        icon={<BulbOutlined />}
                        size="small"
                        style={{ background: '#faad14', borderColor: '#faad14' }}
                      >
                        知识点
                      </Button>
                    </Popover>
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ padding: '16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>{detail.name}</h1>
                  <span style={{ color: '#999', fontSize: 16 }}>{detail.englishName}</span>
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <EyeOutlined style={{ color: '#888' }} />
                    <span style={{ color: '#666' }}>{detail.views.toLocaleString()} 浏览</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <HeartFilled style={{ color: '#ff4d4f' }} />
                    <span style={{ color: '#666' }}>{detail.collects.toLocaleString()} 收藏</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CommentOutlined style={{ color: '#52c41a' }} />
                    <span style={{ color: '#666' }}>{commentList.length} 评论</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#666' }}>难度：</span>
                    <Rate disabled allowHalf value={detail.difficulty / 2} />
                    <span style={{ color: '#888', marginLeft: 4 }}>{getDifficultyText(detail.difficulty)}</span>
                  </div>
                </div>

                <p style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 20 }}>
                  {detail.description}
                </p>

                <div style={{ marginBottom: 20 }}>
                  {detail.tags?.map((tag, index) => (
                    <Tag key={index} style={{ margin: 4 }}>{tag}</Tag>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Button
                    type="primary"
                    icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavorite}
                    size="large"
                  >
                    {isFavorite ? '已收藏' : '收藏'}
                  </Button>
                  <Button
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                    size="large"
                  >
                    分享
                  </Button>
                  <Button
                    icon={<CommentOutlined />}
                    onClick={() => {
                      if (!isAuthenticated) {
                        message.warning('请先登录')
                        navigate('/login')
                        return
                      }
                      setReplyTo(null)
                      setCommentModalVisible(true)
                    }}
                    size="large"
                  >
                    发表评论
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
              <Tabs defaultActiveKey="structure">
                <TabPane tab="结构拆解" key="structure">
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 18 }}>结构组件</h3>
                      {kps.length > 0 && (
                        <span style={{ color: '#888', fontSize: 13 }}>
                          点击 <InfoCircleOutlined style={{ color: '#faad14' }} /> 查看知识点
                        </span>
                      )}
                    </div>
                    <Row gutter={[16, 16]}>
                      {detail.structureParts?.map((part, index) => {
                        const relatedKp = kps.find(kp => kp.relatedPart === part.name)
                        return (
                          <Col xs={24} sm={12} key={index}>
                            <Card
                              size="small"
                              hoverable
                              actions={relatedKp ? [
                                <KnowledgeBadge key="kp" kp={relatedKp} />
                              ] : null}
                            >
                              <Meta
                                title={
                                  <span style={{ color: '#1890ff' }}>
                                    <AppstoreOutlined style={{ marginRight: 8 }} />
                                    {part.name}
                                  </span>
                                }
                                description={part.description}
                              />
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>三维示意图</h3>
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        height: 300,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: '#666',
                        cursor: 'pointer'
                      }}
                      onClick={() => message.info('3D模型功能开发中...')}
                    >
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📐</div>
                      <div style={{ fontSize: 16 }}>交互式三维模型</div>
                      <div style={{ fontSize: 13, marginTop: 8 }}>点击可360°查看结构细节</div>
                      <Button type="primary" style={{ marginTop: 16 }}>
                        查看3D模型
                      </Button>
                    </div>
                  </div>
                </TabPane>

                <TabPane tab="制作工艺" key="craft">
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 18 }}>制作步骤</h3>
                      {kps.filter(kp => kp.relatedPart === '组装' || kp.relatedPart === '材料').length > 0 && (
                        <span style={{ color: '#888', fontSize: 13 }}>
                          相关知识点：
                          {kps.filter(kp => kp.relatedPart === '组装' || kp.relatedPart === '材料').map(kp => (
                            <Button
                              key={kp.id}
                              type="link"
                              size="small"
                              icon={<BulbOutlined style={{ color: '#faad14' }} />}
                              onClick={() => showKnowledge(kp)}
                              style={{ padding: '0 4px' }}
                            >
                              {kp.title}
                            </Button>
                          ))}
                        </span>
                      )}
                    </div>
                    <Steps direction="vertical" size="small">
                      {detail.makingSteps?.map((step, index) => (
                        <Step
                          key={index}
                          title={`步骤 ${step.step}：${step.title}`}
                          description={step.description}
                        />
                      ))}
                    </Steps>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                      <ToolOutlined style={{ marginRight: 8 }} />
                      所需工具
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {detail.tools?.map((tool, index) => (
                        <Tag key={index} color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                          {tool}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ marginBottom: 16, fontSize: 18 }}>
                      <AppstoreOutlined style={{ marginRight: 8 }} />
                      所需材料
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {detail.materials?.map((material, index) => (
                        <Tag key={index} color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                          {material}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </TabPane>

                <TabPane tab="历史渊源" key="history">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="历史渊源">
                      <p style={{ lineHeight: 1.8, margin: 0 }}>{detail.history}</p>
                    </Descriptions.Item>
                    <Descriptions.Item label="应用场景">
                      <p style={{ lineHeight: 1.8, margin: 0 }}>{detail.application}</p>
                    </Descriptions.Item>
                    <Descriptions.Item label="收录时间">
                      {detail.createdAt}
                    </Descriptions.Item>
                  </Descriptions>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      工艺视频
                      <Badge count={detail.videos?.length || 0} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="videos"
                >
                  <Row gutter={[16, 16]}>
                    {detail.videos?.map((video, index) => (
                      <Col xs={24} sm={12} key={index}>
                        <Card
                          hoverable
                          cover={
                            <div
                              style={{
                                position: 'relative',
                                paddingTop: '56.25%',
                                background: '#000',
                                cursor: 'pointer'
                              }}
                              onClick={() => playVideo(video)}
                            >
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  opacity: 0.8
                                }}
                              />
                              <PlayCircleOutlined
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: 64,
                                  color: '#fff'
                                }}
                              />
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: 8,
                                  right: 8,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#fff',
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  fontSize: 12
                                }}
                              >
                                {video.duration}
                              </span>
                            </div>
                          }
                          onClick={() => playVideo(video)}
                        >
                          <Meta title={video.title} />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <CommentOutlined />
                      评论区
                      <Badge count={commentList.length} style={{ marginLeft: 8 }} />
                    </span>
                  }
                  key="comments"
                >
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<CommentOutlined />}
                      onClick={() => {
                        if (!isAuthenticated) {
                          message.warning('请先登录')
                          navigate('/login')
                          return
                        }
                        setReplyTo(null)
                        setCommentModalVisible(true)
                      }}
                    >
                      发表评论
                    </Button>
                  </div>

                  {commentList.length > 0 ? (
                    <List
                      itemLayout="vertical"
                      dataSource={commentList}
                      renderItem={item => (
                        <List.Item
                          key={item.id}
                          actions={[
                            <span key="like" onClick={() => handleCommentLike(item.id)} style={{ cursor: 'pointer', color: likedComments.includes(item.id) ? '#1890ff' : '#888' }}>
                              {likedComments.includes(item.id) ? <LikeFilled /> : <LikeOutlined />} {item.likes}
                            </span>,
                            <span key="reply" onClick={() => openReply(item)} style={{ cursor: 'pointer', color: '#1890ff' }}>
                              回复
                            </span>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar src={item.userAvatar} icon={<UserOutlined />} />}
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>{item.userName}</span>
                                <Rate disabled allowHalf value={item.rating} style={{ fontSize: 12 }} />
                              </div>
                            }
                            description={item.createdAt}
                          />
                          <div style={{ marginLeft: 56, marginTop: 8 }}>
                            <p style={{ marginBottom: 8, lineHeight: 1.6 }}>{item.content}</p>
                            {item.replies && item.replies.length > 0 && (
                              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8 }}>
                                {item.replies.map(reply => (
                                  <div key={reply.id} style={{ marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                      <Avatar size={24} src={reply.userAvatar} icon={<UserOutlined />} />
                                      <span style={{ fontSize: 13, fontWeight: 500 }}>{reply.userName}</span>
                                      <span style={{ fontSize: 11, color: '#999' }}>{reply.createdAt}</span>
                                    </div>
                                    <p style={{ marginLeft: 32, fontSize: 13, color: '#555' }}>{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                      <div style={{ color: '#888' }}>暂无评论，快来发表第一条评论吧！</div>
                    </div>
                  )}
                </TabPane>
              </Tabs>
            </Card>

            {relatedMortises.length > 0 && (
              <Card style={{ borderRadius: 12 }} title="相关推荐">
                <Row gutter={[16, 16]}>
                  {relatedMortises.map(mortise => (
                    <Col xs={24} sm={12} md={6} key={mortise.id}>
                      <MortiseCard mortise={mortise} />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={8}>
            {designer && (
              <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Avatar size={80} src={designer.avatar} icon={<UserOutlined />} />
                  <div style={{ marginTop: 12, fontSize: 18, fontWeight: 600 }}>
                    {designer.name}
                  </div>
                  <div style={{ color: '#1890ff', marginTop: 4 }}>
                    {designer.title}
                  </div>
                </div>

                <Descriptions column={2} size="small" style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="从业经验">{designer.experience}</Descriptions.Item>
                  <Descriptions.Item label="作品数量">{designer.worksCount}件</Descriptions.Item>
                  <Descriptions.Item label="粉丝数">{designer.followers.toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="总收藏">{designer.followers}</Descriptions.Item>
                </Descriptions>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>设计师履历</div>
                  <div style={{ color: '#666', fontSize: 13, lineHeight: 1.6 }}>
                    {designer.bio}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>资质认证</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {designer.certifications?.map((cert, i) => (
                      <Tag key={i} color="gold">{cert}</Tag>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>擅长领域</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {designer.specialty?.map((s, i) => (
                      <Tag key={i} color="blue">{s}</Tag>
                    ))}
                  </div>
                </div>

                <Button
                  type={isFollowing ? 'default' : 'primary'}
                  icon={isFollowing ? <CheckOutlined /> : <PlusOutlined />}
                  onClick={handleFollow}
                  block
                >
                  {isFollowing ? '已关注' : '+ 关注设计师'}
                </Button>
              </Card>
            )}

            {kps.length > 0 && (
              <Card
                title={
                  <span>
                    <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    工艺知识点
                  </span>
                }
                style={{ marginBottom: 24, borderRadius: 12 }}
              >
                <List
                  size="small"
                  dataSource={kps}
                  renderItem={kp => (
                    <List.Item
                      style={{ cursor: 'pointer', padding: '12px 0' }}
                      onClick={() => showKnowledge(kp)}
                    >
                      <List.Item.Meta
                        title={
                          <span style={{ color: '#1890ff' }}>
                            <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                            {kp.title}
                          </span>
                        }
                        description={
                          <span style={{ fontSize: 12, color: '#888' }}>
                            相关部件：{kp.relatedPart}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            <Card title="目录导航" style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
              <List
                size="small"
                dataSource={[
                  { key: 'structure', label: '结构拆解' },
                  { key: 'craft', label: '制作工艺' },
                  { key: 'history', label: '历史渊源' },
                  { key: 'videos', label: '工艺视频' },
                  { key: 'comments', label: '评论区' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <a href={`#${item.key}`} style={{ color: '#333' }}>{item.label}</a>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={currentVideo?.title}
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
      >
        <div
          style={{
            background: '#000',
            height: 450,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexDirection: 'column'
          }}
        >
          <PlayCircleOutlined style={{ fontSize: 80, marginBottom: 16 }} />
          <div style={{ fontSize: 16 }}>视频播放区域</div>
          <div style={{ color: '#888', marginTop: 8, fontSize: 13 }}>
            （此处嵌入视频播放器）
          </div>
        </div>
      </Modal>

      <Modal
        title={replyTo ? `回复 @${replyTo.userName}` : '发表评论'}
        open={commentModalVisible}
        onCancel={() => {
          setCommentModalVisible(false)
          setReplyTo(null)
          commentForm.resetFields()
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setCommentModalVisible(false)
            setReplyTo(null)
            commentForm.resetFields()
          }}>
            取消
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitComment}>
            发送
          </Button>
        ]}
        width={600}
      >
        <Form form={commentForm} layout="vertical">
          <Form.Item
            name="rating"
            label="评分"
            initialValue={5}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="content"
            label="评论内容"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea
              rows={4}
              placeholder={replyTo ? `回复 @${replyTo.userName}...` : '分享您的见解和经验...'}
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span>
            <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
            {currentKnowledge?.title}
          </span>
        }
        open={knowledgeModalVisible}
        onCancel={() => setKnowledgeModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setKnowledgeModalVisible(false)}>
            我知道了
          </Button>
        ]}
        width={600}
      >
        {currentKnowledge && (
          <div>
            <Tag color="blue" style={{ marginBottom: 16 }}>
              相关部件：{currentKnowledge.relatedPart}
            </Tag>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>
              {currentKnowledge.content}
            </div>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>
              💡 传统工艺凝聚了古人的智慧，值得我们学习和传承
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MortiseDetail
