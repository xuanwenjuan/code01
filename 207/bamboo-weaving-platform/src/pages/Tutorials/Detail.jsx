import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Row, Col, Card, Tag, Avatar, Typography, Button, Space, 
  Steps, Alert, Input, List, message, Rate, Tabs, Tooltip, Form
} from 'antd'
import { 
  ArrowLeftOutlined, HeartOutlined, PlayCircleOutlined, 
  LikeOutlined, ExclamationCircleOutlined, BulbOutlined,
  WarningOutlined, ToolOutlined, SendOutlined
} from '@ant-design/icons'
import { getTutorialById, likeTutorial } from '@/store/slices/tutorialsSlice'
import { fetchComments, addComment, likeComment } from '@/store/slices/commentsSlice'
import StatusHandler from '@/components/StatusHandler'
import VideoPlayer from '@/components/VideoPlayer'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps
const { TextArea } = Input
const { TabPane } = Tabs

const SENSITIVE_WORDS = ['广告', '推销', '联系方式', '微信', '电话', 'qq', '购买', '链接', '淘宝', '拼多多']
const SPECIAL_CHAR_REGEX = /[\[\]{}<>\\/|~!@#$%^&*()+=]/

const TutorialDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentTutorial, status, error } = useSelector(state => state.tutorials)
  const { currentComments, status: commentsStatus } = useSelector(state => state.comments)
  const { currentUser } = useSelector(state => state.user)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState('video')
  const [commentForm] = Form.useForm()
  const [isQuestion, setIsQuestion] = useState(false)

  useEffect(() => {
    dispatch(getTutorialById(parseInt(id)))
    dispatch(fetchComments(parseInt(id)))
  }, [dispatch, id])

  const handleLike = () => {
    dispatch(likeTutorial(parseInt(id)))
    message.success('点赞成功')
  }

  const handleLikeComment = (commentId) => {
    dispatch(likeComment(commentId))
  }

  const validateComment = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error('请输入评论内容'))
    }
    if (value.trim().length < 5) {
      return Promise.reject(new Error('评论内容至少5个字符'))
    }
    if (value.trim().length > 500) {
      return Promise.reject(new Error('评论内容不能超过500个字符'))
    }
    const containsSensitive = SENSITIVE_WORDS.some(word => 
      value.toLowerCase().includes(word.toLowerCase())
    )
    if (containsSensitive) {
      return Promise.reject(new Error('评论内容包含敏感词，请修改后重新提交'))
    }
    const specialChars = SPECIAL_CHAR_REGEX.test(value)
    if (specialChars) {
      return Promise.reject(new Error('评论内容包含特殊字符，请修改后重新提交'))
    }
    return Promise.resolve()
  }

  const handleSubmitComment = async () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    try {
      const values = await commentForm.validateFields()
      dispatch(addComment({
        tutorialId: parseInt(id),
        userId: currentUser.id,
        username: currentUser.nickname,
        avatar: currentUser.avatar,
        content: values.content,
        isQuestion
      })).then(() => {
        message.success('评论成功')
        commentForm.resetFields()
        setIsQuestion(false)
      })
    } catch (error) {
      if (error.errorFields) {
        message.error(error.errorFields[0].errors[0])
      }
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setActiveTab('video')
    }
  }

  const handleNextStep = () => {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setActiveTab('video')
    }
  }

  const handleVideoEnded = () => {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
      message.success('本步骤视频播放完成，可进入下一步学习')
    } else {
      message.success('恭喜！您已完成本教程的所有步骤学习')
    }
  }

  const getLevelColor = (level) => {
    const colors = { '入门': 'green', '中级': 'orange', '高级': 'red' }
    return colors[level] || 'default'
  }

  if (!currentTutorial) {
    return <StatusHandler status={status} error={error} data={null} />
  }

  const currentStepData = currentTutorial.steps[currentStep]

  return (
    <div>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/tutorials')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <div style={{ position: 'relative' }}>
              <img 
                src={currentTutorial.cover} 
                alt={currentTutorial.title}
                style={{ width: '100%', borderRadius: 8 }}
              />
              <PlayCircleOutlined 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  fontSize: 80,
                  color: 'white',
                  opacity: 0.9
                }} 
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space style={{ marginBottom: 12 }} wrap>
                  <Tag color={getLevelColor(currentTutorial.level)}>{currentTutorial.level}</Tag>
                  {currentTutorial.isRecommended && <Tag color="gold">推荐</Tag>}
                </Space>
                <Title level={2} style={{ marginTop: 0, marginBottom: 12 }}>
                  {currentTutorial.title}
                </Title>
                <Paragraph style={{ color: '#666', fontSize: 14 }}>
                  {currentTutorial.description}
                </Paragraph>
              </div>

              <Space size="large">
                <Space>
                  <Avatar src={currentTutorial.avatar} size={40} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{currentTutorial.author}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>竹编大师</Text>
                  </div>
                </Space>
                <Space>
                  <Rate disabled defaultValue={currentTutorial.rating} allowHalf />
                  <Text type="secondary">{currentTutorial.rating}</Text>
                </Space>
              </Space>

              <Space size="large">
                <Space>
                  <Text type="secondary">播放</Text>
                  <Text strong>{currentTutorial.views}</Text>
                </Space>
                <Space>
                  <Text type="secondary">点赞</Text>
                  <Text strong>{currentTutorial.likes}</Text>
                </Space>
                <Space>
                  <Text type="secondary">时长</Text>
                  <Text strong>{currentTutorial.duration}</Text>
                </Space>
                <Space>
                  <Text type="secondary">步骤</Text>
                  <Text strong>{currentTutorial.steps.length}步</Text>
                </Space>
              </Space>

              <Space>
                <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={() => setActiveTab('video')}>
                  开始学习
                </Button>
                <Button size="large" icon={<HeartOutlined />} onClick={handleLike}>
                  收藏
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card 
        title={`教程步骤 - 第 ${currentStep + 1}/${currentTutorial.steps.length} 步`}
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Tooltip title="上一步">
              <Button onClick={handlePrevStep} disabled={currentStep === 0}>
                上一步
              </Button>
            </Tooltip>
            <Tooltip title="下一步">
              <Button type="primary" onClick={handleNextStep} disabled={currentStep === currentTutorial.steps.length - 1}>
                下一步
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Steps
          type="navigation"
          current={currentStep}
          onChange={setCurrentStep}
          items={currentTutorial.steps.map(step => ({
            title: step.title
          }))}
          style={{ marginBottom: 24 }}
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="🎬 视频演示" key="video">
            {currentStepData && (
              <div>
                <VideoPlayer
                  videoUrl={currentStepData.videoUrl}
                  title={`第${currentStep + 1}步：${currentStepData.title}`}
                  onEnded={handleVideoEnded}
                  onPrev={handlePrevStep}
                  onNext={handleNextStep}
                  hasPrev={currentStep > 0}
                  hasNext={currentStep < currentTutorial.steps.length - 1}
                />
                
                <Card style={{ marginTop: 24 }}>
                  <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                    {currentStepData.title}
                    <Tag style={{ marginLeft: 8 }}>预计用时：{currentStepData.duration}</Tag>
                  </Title>
                  
                  <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                    {currentStepData.description}
                  </Paragraph>

                  <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                    {currentStepData.isDifficult && (
                      <Alert
                        message="⚠️ 重难点"
                        description={currentStepData.keyPoint}
                        type="warning"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                      />
                    )}
                    {currentStepData.keyPoint && !currentStepData.isDifficult && (
                      <Alert
                        message="💡 技巧提示"
                        description={currentStepData.keyPoint}
                        type="info"
                        showIcon
                        icon={<BulbOutlined />}
                      />
                    )}
                    {currentStepData.commonMistakes && (
                      <Alert
                        message="❌ 常见错误"
                        description={currentStepData.commonMistakes}
                        type="error"
                        showIcon
                        icon={<WarningOutlined />}
                      />
                    )}
                  </Space>

                  {currentStepData.image && (
                    <div style={{ marginTop: 24, textAlign: 'center' }}>
                      <img 
                        src={currentStepData.image} 
                        alt={currentStepData.title}
                        style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
                      />
                      <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>步骤示意图</div>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </TabPane>
          
          <TabPane tab="📝 图文详解" key="text">
            {currentStepData && (
              <Card>
                <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                  {currentStepData.title}
                </Title>
                
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>操作步骤：</Title>
                  <Paragraph style={{ fontSize: 15, lineHeight: 2 }}>
                    {currentStepData.description}
                  </Paragraph>
                </div>

                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card style={{ background: '#fffbe6', borderColor: '#ffe58f' }}>
                      <div style={{ textAlign: 'center' }}>
                        <ExclamationCircleOutlined style={{ fontSize: 24, color: '#faad14', marginBottom: 8 }} />
                        <div style={{ fontWeight: 500 }}>重难点</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          {currentStepData.keyPoint || '无'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ background: '#f0f5ff', borderColor: '#adc6ff' }}>
                      <div style={{ textAlign: 'center' }}>
                        <BulbOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                        <div style={{ fontWeight: 500 }}>技巧提示</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          {currentStepData.keyPoint || '无'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ background: '#fff2f0', borderColor: '#ffccc7' }}>
                      <div style={{ textAlign: 'center' }}>
                        <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
                        <div style={{ fontWeight: 500 }}>常见错误</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          {currentStepData.commonMistakes || '无'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {currentStepData.image && (
                  <div style={{ textAlign: 'center' }}>
                    <img 
                      src={currentStepData.image} 
                      alt={currentStepData.title}
                      style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8 }}
                    />
                  </div>
                )}
              </Card>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>常见错误汇总</span>
              </Space>
            }
          >
            {currentTutorial.commonMistakes && currentTutorial.commonMistakes.length > 0 ? (
              <List
                dataSource={currentTutorial.commonMistakes}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <List.Item.Meta
                      avatar={<div style={{ width: 24, height: 24, background: '#ff4d4f', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{index + 1}</div>}
                      description={item}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无常见错误说明
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <ToolOutlined style={{ color: '#52c41a' }} />
                <span>所需工具</span>
              </Space>
            }
          >
            {currentTutorial.tools && currentTutorial.tools.length > 0 ? (
              <Space wrap>
                {currentTutorial.tools.map((tool, index) => (
                  <Tag key={index} color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {tool}
                  </Tag>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                暂无工具说明
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title={`💬 技法答疑 (${currentComments.length})`}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card size="small" style={{ background: '#fafafa' }}>
            <Form form={commentForm}>
              <Form.Item
                name="content"
                rules={[{ validator: validateComment }]}
              >
                <TextArea
                  rows={4}
                  placeholder={isQuestion ? '请输入你的问题（至少5个字符，最多500个字符）...' : '分享你的学习心得（至少5个字符，最多500个字符）...'}
                  style={{ marginBottom: 12 }}
                />
              </Form.Item>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Space>
                  <input 
                    type="checkbox" 
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                    id="isQuestion"
                  />
                  <label htmlFor="isQuestion">标记为问题</label>
                </Space>
                <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitComment}>
                  发表评论
                </Button>
              </Space>
            </Form>
          </Card>

          <StatusHandler status={commentsStatus} data={currentComments} emptyText="暂无评论，快来发表第一条评论吧！">
            <List
              dataSource={currentComments}
              renderItem={item => (
                <List.Item key={item.id}>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={
                      <Space>
                        <span style={{ fontWeight: 500 }}>{item.username}</span>
                        {item.isQuestion && <Tag color="red">问题</Tag>}
                        <Text type="secondary" style={{ fontSize: 12 }}>{item.createTime}</Text>
                      </Space>
                    }
                    description={
                      <div>
                        <Paragraph style={{ marginTop: 8, marginBottom: 8 }}>{item.content}</Paragraph>
                        {item.reply && (
                          <Alert
                            message={`${item.reply.replier} 回复：`}
                            description={item.reply.content}
                            type="success"
                            showIcon
                            style={{ marginBottom: 8 }}
                          />
                        )}
                        <Button 
                          type="text" 
                          size="small" 
                          icon={<LikeOutlined />}
                          onClick={() => handleLikeComment(item.id)}
                        >
                          {item.likes}
                        </Button>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </StatusHandler>
        </Space>
      </Card>
    </div>
  )
}

export default TutorialDetail
