import React, { useEffect, useState } from 'react'
import {
  Layout,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Button,
  Card,
  Avatar,
  Image,
  Descriptions,
  Steps,
  Modal,
  message,
  Divider,
  List,
  Input,
  Form,
  Popconfirm,
  Tooltip,
  FloatButton,
} from 'antd'
import {
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  UserAddOutlined,
  UserDeleteOutlined,
  PlayCircleOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  BulbOutlined,
  DeleteOutlined,
  SendOutlined,
  BookOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchSkillById,
  clearCurrentSkill,
  toggleLike,
  checkIsLiked,
  addComment,
  deleteComment,
  fetchKnowledgePoints,
} from '../../store/slices/skillSlice'
import {
  addFavorite,
  removeFavorite,
  addFollow,
  removeFollow,
  addBrowseHistory,
} from '../../store/slices/userSlice'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import EmptyState from '../../components/EmptyState'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const { Step } = Steps
const { TextArea } = Input

const SkillDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const { currentSkill, currentProcess, currentInheritor, materials, comments, knowledgePoints, loading, error, isLiked } =
    useSelector((state) => state.skills)
  const { user } = useSelector((state) => state.auth)
  const { favorites, followList } = useSelector((state) => state.user)

  const [videoModalVisible, setVideoModalVisible] = useState(false)
  const [currentVideoStep, setCurrentVideoStep] = useState(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isFollowed, setIsFollowed] = useState(false)
  const [knowledgeModalVisible, setKnowledgeModalVisible] = useState(false)
  const [currentKnowledge, setCurrentKnowledge] = useState(null)
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchSkillById(parseInt(id)))
      dispatch(fetchKnowledgePoints())
      if (user) {
        dispatch(checkIsLiked({ userId: user.id, skillId: parseInt(id) }))
      }
    }

    return () => {
      dispatch(clearCurrentSkill())
    }
  }, [dispatch, id, user])

  useEffect(() => {
    if (currentSkill && user) {
      dispatch(addBrowseHistory({ userId: user.id, skillId: currentSkill.id, skillName: currentSkill.name, category: currentSkill.category }))
    }
    if (currentSkill && favorites.length > 0) {
      const favorited = favorites.some((f) => f.skillId === currentSkill.id)
      setIsFavorited(favorited)
    }
    if (currentInheritor && followList.length > 0) {
      const followed = followList.some((f) => f.inheritorId === currentInheritor.id)
      setIsFollowed(followed)
    }
  }, [currentSkill, currentInheritor, favorites, followList, user, dispatch])

  const handleFavorite = () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    if (isFavorited) {
      const fav = favorites.find((f) => f.skillId === currentSkill.id)
      if (fav) {
        dispatch(removeFavorite(fav.id))
        setIsFavorited(false)
        message.success('已取消收藏')
      }
    } else {
      dispatch(
        addFavorite({
          userId: user.id,
          skillId: currentSkill.id,
          skillName: currentSkill.name,
          category: currentSkill.category,
        })
      )
      setIsFavorited(true)
      message.success('收藏成功')
    }
  }

  const handleFollow = () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    if (isFollowed) {
      const follow = followList.find((f) => f.inheritorId === currentInheritor.id)
      if (follow) {
        dispatch(removeFollow(follow.id))
        setIsFollowed(false)
        message.success('已取消关注')
      }
    } else {
      dispatch(
        addFollow({
          userId: user.id,
          inheritorId: currentInheritor.id,
          inheritorName: currentInheritor.name,
          skill: currentInheritor.skill,
        })
      )
      setIsFollowed(true)
      message.success('关注成功')
    }
  }

  const handlePlayVideo = (step) => {
    setCurrentVideoStep(step)
    setVideoModalVisible(true)
  }

  const handleLike = () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleLike({ userId: user.id, skillId: currentSkill.id }))
    message.success(isLiked ? '已取消点赞' : '点赞成功')
  }

  const handleSubmitComment = async (values) => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    if (!values.content || !values.content.trim()) {
      message.warning('请输入评论内容')
      return
    }

    setSubmittingComment(true)
    try {
      await dispatch(
        addComment({
          skillId: currentSkill.id,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          content: values.content.trim(),
        })
      ).unwrap()
      form.resetFields()
      message.success('评论发表成功')
    } catch (err) {
      message.error('评论发表失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = (commentId) => {
    dispatch(deleteComment(commentId))
    message.success('评论已删除')
  }

  const openKnowledgeModal = () => {
    setKnowledgeModalVisible(true)
  }

  const showKnowledgeDetail = (knowledge) => {
    setCurrentKnowledge(knowledge)
  }

  if (loading) {
    return <Loading tip="加载技艺详情中..." />
  }

  if (error) {
    return <ErrorState status="404" title="404" subTitle="技艺不存在或已被删除" />
  }

  if (!currentSkill) {
    return null
  }

  const getCategoryColor = (category) => {
    const colors = {
      宣纸: 'gold',
      原料: 'green',
      历史: 'blue',
      纸品: 'purple',
      工艺: 'cyan',
      其他: 'default',
    }
    return colors[category] || 'default'
  }

  return (
    <Layout style={{ background: '#f5f0e8', minHeight: '100vh' }}>
      <Content className="page-container">
        {/* 顶部封面图和基本信息 */}
        <Card
          style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden' }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            style={{
              height: '300px',
              background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentSkill.coverImage}) center/cover no-repeat`,
              display: 'flex',
              alignItems: 'flex-end',
              padding: '32px',
            }}
          >
            <div style={{ color: '#fff', flex: 1 }}>
              <Space size="middle" style={{ marginBottom: '12px' }}>
                <Tag color="gold" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {currentSkill.level}
                </Tag>
                <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {currentSkill.category}
                </Tag>
                <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  <EnvironmentOutlined /> {currentSkill.origin}
                </Tag>
              </Space>
              <Title level={1} style={{ color: '#fff', marginBottom: '8px' }}>
                {currentSkill.name}
              </Title>
              <Space size="large">
                <span>
                  <EyeOutlined style={{ marginRight: '4px' }} />
                  {currentSkill.viewCount} 次浏览
                </span>
                <span>
                  <LikeOutlined style={{ marginRight: '4px' }} />
                  {currentSkill.likeCount} 次点赞
                </span>
                <span>
                  <MessageOutlined style={{ marginRight: '4px' }} />
                  {comments.length} 条评论
                </span>
                <span>
                  <HistoryOutlined style={{ marginRight: '4px' }} />
                  收录于 {currentSkill.createTime}
                </span>
              </Space>
            </div>
          </div>

          <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              type={isLiked ? 'primary' : 'default'}
              icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
              onClick={handleLike}
            >
              {isLiked ? '已点赞' : '点赞'} ({currentSkill.likeCount})
            </Button>
            <Button
              type={isFavorited ? 'primary' : 'default'}
              icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
              onClick={handleFavorite}
            >
              {isFavorited ? '已收藏' : '收藏技艺'}
            </Button>
            {currentInheritor && (
              <Button
                type={isFollowed ? 'primary' : 'default'}
                icon={isFollowed ? <UserDeleteOutlined /> : <UserAddOutlined />}
                onClick={handleFollow}
              >
                {isFollowed ? '已关注' : '关注传承人'}
              </Button>
            )}
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* 左侧主要内容 */}
          <Col xs={24} lg={17}>
            {/* 技艺简介 */}
            <Card title="技艺简介" style={{ marginBottom: '24px', borderRadius: '12px' }}>
              <Paragraph style={{ fontSize: '15px', lineHeight: '2' }}>
                {currentSkill.description}
              </Paragraph>
              <Divider style={{ margin: '16px 0' }} />
              <Title level={4} style={{ marginBottom: '12px' }}>
                历史渊源
              </Title>
              <Paragraph style={{ fontSize: '15px', lineHeight: '2' }}>
                {currentSkill.history}
              </Paragraph>
            </Card>

            {/* 技艺图片 */}
            {currentSkill.images && currentSkill.images.length > 0 && (
              <Card title="技艺图集" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <Image.PreviewGroup>
                  <Row gutter={[12, 12]}>
                    {currentSkill.images.map((img, index) => (
                      <Col xs={12} sm={8} key={index}>
                        <Image
                          src={img}
                          style={{
                            width: '100%',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              </Card>
            )}

            {/* 造纸流程 */}
            {currentProcess && (
              <Card title="造纸工艺流程" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <Steps
                  direction="vertical"
                  current={-1}
                  items={currentProcess.steps.map((step) => ({
                    title: (
                      <Space>
                        <span style={{ fontWeight: '600' }}>
                          第{step.step}步：{step.title}
                        </span>
                        <Tag color="purple">耗时：{step.duration}</Tag>
                        {step.videoUrl && (
                          <Button
                            type="link"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handlePlayVideo(step)}
                          >
                            观看视频
                          </Button>
                        )}
                      </Space>
                    ),
                    description: (
                      <div style={{ marginTop: '12px' }}>
                        <Row gutter={[16, 16]}>
                          {step.image && (
                            <Col xs={24} sm={8}>
                              <Image
                                src={step.image}
                                style={{
                                  width: '100%',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: '8px',
                                }}
                              />
                            </Col>
                          )}
                          <Col xs={24} sm={step.image ? 16 : 24}>
                            <Paragraph style={{ marginBottom: 0 }}>{step.description}</Paragraph>
                          </Col>
                        </Row>
                      </div>
                    ),
                  }))}
                />
              </Card>
            )}

            {/* 原料溯源 */}
            <Card title="造纸原料溯源" style={{ marginBottom: '24px', borderRadius: '12px' }}>
              <Row gutter={[16, 16]}>
                {materials.map((material) => (
                  <Col xs={24} sm={12} lg={8} key={material.id}>
                    <Card hoverable className="card-hover" size="small">
                      <Image
                        src={material.image}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '12px',
                        }}
                      />
                      <Title level={5} style={{ marginBottom: '8px' }}>
                        {material.name}
                      </Title>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text type="secondary">
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          产地：{material.origin}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          采收季节：{material.harvestSeason}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          <BookOutlined style={{ marginRight: '4px' }} />
                          加工方法：{material.processingMethod}
                        </Text>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0, fontSize: '13px', marginTop: '8px' }}>
                          {material.description}
                        </Paragraph>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 评论区 */}
            <Card
              title={
                <Space>
                  <MessageOutlined />
                  评论区
                  <Tag color="blue">{comments.length}</Tag>
                </Space>
              }
              style={{ marginBottom: '24px', borderRadius: '12px' }}
            >
              {/* 发表评论 */}
              {user && (
                <Form form={form} onFinish={handleSubmitComment} style={{ marginBottom: '24px' }}>
                  <Form.Item name="content" style={{ marginBottom: '12px' }}>
                    <TextArea
                      rows={3}
                      placeholder="发表你的看法..."
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SendOutlined />}
                      loading={submittingComment}
                    >
                      发表评论
                    </Button>
                  </div>
                </Form>
              )}

              {/* 评论列表 */}
              {comments.length > 0 ? (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item
                      key={comment.id}
                      actions={[
                        user && user.id === comment.userId && (
                          <Popconfirm
                            title="确定要删除这条评论吗？"
                            onConfirm={() => handleDeleteComment(comment.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>
                        ),
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={comment.userAvatar} />}
                        title={
                          <Space>
                            <span style={{ fontWeight: '500' }}>{comment.userName}</span>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {comment.createTime}
                            </Text>
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph style={{ marginBottom: '8px' }}>{comment.content}</Paragraph>
                            <Space>
                              <span style={{ color: '#999', fontSize: '12px' }}>
                                <LikeOutlined style={{ marginRight: '4px' }} />
                                {comment.likeCount}
                              </span>
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <EmptyState description="暂无评论，快来发表第一条评论吧！" />
              )}
            </Card>
          </Col>

          {/* 右侧侧边栏 */}
          <Col xs={24} lg={7}>
            {/* 传承人信息 */}
            {currentInheritor && (
              <Card title="传承人介绍" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Avatar
                    src={currentInheritor.avatar}
                    size={80}
                    style={{ marginBottom: '12px' }}
                  />
                  <Title level={4} style={{ marginBottom: '4px' }}>
                    {currentInheritor.name}
                  </Title>
                  <Tag color="gold">{currentInheritor.title}</Tag>
                </div>

                <Descriptions column={1} size="small" style={{ marginBottom: '16px' }}>
                  <Descriptions.Item label="擅长技艺">
                    {currentInheritor.skill}
                  </Descriptions.Item>
                  <Descriptions.Item label="从业年限">
                    {currentInheritor.experience}年
                  </Descriptions.Item>
                  <Descriptions.Item label="籍贯">
                    {currentInheritor.origin}
                  </Descriptions.Item>
                  <Descriptions.Item label="粉丝数">
                    {currentInheritor.followerCount}
                  </Descriptions.Item>
                  <Descriptions.Item label="出生年月">
                    {currentInheritor.birthDate}
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ margin: '12px 0' }} />

                <Title level={5} style={{ marginBottom: '12px' }}>
                  <BookOutlined style={{ marginRight: '4px' }} />
                  个人简介
                </Title>
                <Paragraph style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  {currentInheritor.biography}
                </Paragraph>

                <Button
                  type={isFollowed ? 'default' : 'primary'}
                  block
                  icon={isFollowed ? <UserDeleteOutlined /> : <UserAddOutlined />}
                  onClick={handleFollow}
                  style={{ marginTop: '16px' }}
                >
                  {isFollowed ? '取消关注' : '关注传承人'}
                </Button>
              </Card>
            )}

            {/* 代表作品 */}
            {currentInheritor && currentInheritor.signatureWorks && (
              <Card title="代表作品" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <List
                  dataSource={currentInheritor.signatureWorks}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <TrophyOutlined style={{ color: '#faad14' }} />
                            {item.name}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Tag color="blue">{item.year}</Tag>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {item.description}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* 技艺成就 */}
            {currentInheritor && currentInheritor.achievements && (
              <Card title="主要成就" style={{ marginBottom: '24px', borderRadius: '12px' }}>
                <List
                  dataSource={currentInheritor.achievements}
                  renderItem={(item) => (
                    <List.Item>
                      <span style={{ fontSize: '13px' }}>🏆 {item}</span>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* 知识点推荐 */}
            <Card
              title={
                <Space>
                  <BulbOutlined style={{ color: '#faad14' }} />
                  古法造纸小知识
                </Space>
              }
              style={{ borderRadius: '12px' }}
              extra={
                <Button type="link" size="small" onClick={openKnowledgeModal}>
                  更多
                </Button>
              }
            >
              <List
                dataSource={knowledgePoints.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item
                    className="card-hover"
                    onClick={() => showKnowledgeDetail(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={
                        <Space size="small">
                          <Tag color={getCategoryColor(item.category)}>{item.category}</Tag>
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.title}</span>
                        </Space>
                      }
                      description={
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 0, fontSize: '12px', color: '#666' }}
                        >
                          {item.content}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>

      {/* 知识点悬浮按钮 */}
      <Tooltip title="造纸小知识">
        <FloatButton
          icon={<BulbOutlined />}
          type="primary"
          onClick={openKnowledgeModal}
          style={{ right: 24, bottom: 24 }}
          badge={{ count: knowledgePoints.length, color: '#faad14' }}
        />
      </Tooltip>

      {/* 视频弹窗 */}
      <Modal
        title={currentVideoStep ? `${currentVideoStep.title} - 视频演示` : '视频演示'}
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={800}
      >
        <div
          style={{
            height: '450px',
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <PlayCircleOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
            <div>{currentVideoStep?.title}</div>
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#999' }}>
              视频演示区域（模拟）
            </div>
          </div>
        </div>
        {currentVideoStep && (
          <div style={{ marginTop: '16px' }}>
            <Paragraph>{currentVideoStep.description}</Paragraph>
          </div>
        )}
      </Modal>

      {/* 知识点列表弹窗 */}
      <Modal
        title={
          <Space>
            <BulbOutlined style={{ color: '#faad14', fontSize: '20px' }} />
            古法造纸知识点
          </Space>
        }
        open={knowledgeModalVisible}
        onCancel={() => {
          setKnowledgeModalVisible(false)
          setCurrentKnowledge(null)
        }}
        footer={null}
        width={900}
      >
        {currentKnowledge ? (
          <div>
            <Button
              type="link"
              onClick={() => setCurrentKnowledge(null)}
              style={{ paddingLeft: 0, marginBottom: '16px' }}
            >
              ← 返回列表
            </Button>
            <Space style={{ marginBottom: '16px' }}>
              <Tag color={getCategoryColor(currentKnowledge.category)}>
                {currentKnowledge.category}
              </Tag>
              <Title level={4} style={{ marginBottom: 0 }}>
                {currentKnowledge.title}
              </Title>
            </Space>
            <Paragraph style={{ fontSize: '15px', lineHeight: '2' }}>
              {currentKnowledge.content}
            </Paragraph>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {knowledgePoints.map((item) => (
              <Col xs={24} sm={12} key={item.id}>
                <Card
                  hoverable
                  className="card-hover"
                  size="small"
                  onClick={() => showKnowledgeDetail(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <Space style={{ marginBottom: '8px' }}>
                    <Tag color={getCategoryColor(item.category)}>{item.category}</Tag>
                  </Space>
                  <Title level={5} style={{ marginBottom: '8px' }}>
                    {item.title}
                  </Title>
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{ marginBottom: 0, fontSize: '13px', color: '#666' }}
                  >
                    {item.content}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </Layout>
  )
}

export default SkillDetail
