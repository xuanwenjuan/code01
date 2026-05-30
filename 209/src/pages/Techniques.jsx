import { useState, useEffect } from 'react'
import {
  Tabs,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Modal,
  Image,
  Space,
  Button,
  Divider,
  Alert,
  List,
  Collapse,
  Steps,
  Avatar,
  Tooltip,
  Descriptions,
  Badge
} from 'antd'
import {
  ToolOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  SettingOutlined,
  CommentOutlined,
  CaretRightOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTechniques, fetchTools, fetchVideos } from '../store/slices/techniquesSlice'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import VideoPlayer from '../components/VideoPlayer'
import MessageBoard from '../components/MessageBoard'
import { getStoredMessages } from '../mock/data'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

const Techniques = () => {
  const dispatch = useDispatch()
  const { techniques, tools, videos, loading, error } = useSelector(state => state.techniques)
  const [activeTechnique, setActiveTechnique] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [showMessageBoard, setShowMessageBoard] = useState(false)

  useEffect(() => {
    dispatch(fetchTechniques())
    dispatch(fetchTools())
    dispatch(fetchVideos())
  }, [dispatch])

  useEffect(() => {
    if (activeTechnique) {
      setCurrentStep(0)
    }
  }, [activeTechnique])

  if (loading && techniques.length === 0) {
    return <Loading />
  }

  if (error) {
    return <ErrorState onRetry={() => dispatch(fetchTechniques())} />
  }

  const tabs = [
    {
      key: 'techniques',
      label: '核心技法',
      icon: <ThunderboltOutlined />
    },
    {
      key: 'tools',
      label: '工具详解',
      icon: <ToolOutlined />
    },
    {
      key: 'videos',
      label: '视频教程',
      icon: <PlayCircleOutlined />
    }
  ]

  const renderTechniques = () => (
    <div>
      <Row gutter={[24, 24]}>
        {techniques.map(technique => (
          <Col xs={24} md={12} key={technique.id}>
            <Card
              hoverable
              className="pottery-card"
              onClick={() => setActiveTechnique(technique)}
              styles={{ body: { padding: 24 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <Title level={3} style={{ margin: 0, color: '#8B4513' }}>
                  {technique.name}
                </Title>
                <Tag color={
                  technique.difficulty === '入门' ? 'green' :
                  technique.difficulty === '中级' ? 'orange' : 'red'
                }>
                  {technique.difficulty}
                </Tag>
              </div>
              <Paragraph style={{ color: '#666', minHeight: 60 }}>
                {technique.description}
              </Paragraph>
              <Space split={<Divider type="vertical" />} style={{ color: '#999' }}>
                <span><ClockCircleOutlined style={{ marginRight: 4 }} />{technique.duration}</span>
                <span>{technique.steps?.length} 个步骤</span>
                <span>{technique.tools?.length} 种工具</span>
              </Space>
              <div style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  icon={<CaretRightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveTechnique(technique)
                  }}
                >
                  查看详情
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderTools = () => (
    <div>
      <Row gutter={[24, 24]}>
        {tools.map(tool => (
          <Col xs={24} sm={12} md={8} lg={6} key={tool.id}>
            <Card
              hoverable
              className="pottery-card tool-card"
              onClick={() => setSelectedTool(tool)}
              cover={
                <Image
                  src={tool.image}
                  alt={tool.name}
                  height={180}
                  style={{ objectFit: 'cover' }}
                  preview={false}
                />
              }
              actions={[
                <span key="view" onClick={() => setSelectedTool(tool)}>
                  <InfoCircleOutlined /> 查看详情
                </span>
              ]}
            >
              <Title level={5} style={{ margin: '0 0 8px' }}>{tool.name}</Title>
              <Tag color="blue" style={{ marginBottom: 8 }}>{tool.category}</Tag>
              <Paragraph style={{
                fontSize: 13,
                color: '#666',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {tool.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderVideos = () => (
    <div>
      <Row gutter={[24, 24]}>
        {videos.map(video => (
          <Col xs={24} sm={12} md={8} lg={6} key={video.id}>
            <Card
              hoverable
              className="pottery-card"
              onClick={() => setSelectedVideo(video)}
              styles={{ body: { padding: 0 } }}
              cover={
                <div className="video-preview">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    height={180}
                    style={{ objectFit: 'cover' }}
                    preview={false}
                  />
                  <div className="play-icon">▶</div>
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12
                  }}>
                    {video.duration}
                  </div>
                </div>
              }
              actions={[
                <span key="play" onClick={() => setSelectedVideo(video)}>
                  <PlayCircleOutlined /> 播放
                </span>
              ]}
            >
              <div style={{ padding: 16 }}>
                <Title level={5} style={{ margin: '0 0 8px' }}>{video.title}</Title>
                <Paragraph style={{
                  fontSize: 13,
                  color: '#666',
                  margin: '0 0 12px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {video.description}
                </Paragraph>
                <Space>
                  <Tag color={video.level === '入门' ? 'green' : video.level === '进阶' ? 'blue' : 'orange'}>
                    {video.level}
                  </Tag>
                  <Tag color="purple">{video.technique}</Tag>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderTechniqueDetail = () => {
    if (!activeTechnique) return null

    const handlePrevStep = () => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1)
      }
    }

    const handleNextStep = () => {
      if (currentStep < activeTechnique.steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }

    const currentStepData = activeTechnique.steps?.[currentStep]

    return (
      <Modal
        open={!!activeTechnique}
        title={
          <Space>
            <span>{activeTechnique.name}</span>
            <Tag color={
              activeTechnique.difficulty === '入门' ? 'green' :
              activeTechnique.difficulty === '中级' ? 'orange' : 'red'
            }>
              {activeTechnique.difficulty}
            </Tag>
          </Space>
        }
        onCancel={() => {
          setActiveTechnique(null)
          setShowMessageBoard(false)
        }}
        footer={null}
        width={1000}
        styles={{ body: { maxHeight: '85vh', overflowY: 'auto', padding: 0 } }}
        destroyOnClose
      >
        <div style={{ padding: 24 }}>
          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                <span>预计耗时：{activeTechnique.duration}</span>
                <Divider type="vertical" />
                <span>所需工具：{activeTechnique.tools?.join('、')}</span>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Paragraph style={{ fontSize: 15, color: '#333', marginBottom: 24 }}>
            {activeTechnique.description}
          </Paragraph>

          <Tabs
            defaultActiveKey="steps"
            items={[
              {
                key: 'steps',
                label: '📝 操作步骤',
                children: (
                  <div>
                    <Steps
                      current={currentStep}
                      onChange={setCurrentStep}
                      style={{ marginBottom: 24 }}
                      items={activeTechnique.steps?.map((step, index) => ({
                        title: `步骤${index + 1}`,
                        description: step.title
                      }))}
                    />

                    {currentStepData && (
                      <Card
                        bordered={false}
                        style={{ background: '#fafafa', marginBottom: 16 }}
                      >
                        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 300 }}>
                            <Title level={4} style={{ color: '#8B4513', marginTop: 0 }}>
                              步骤 {currentStep + 1}：{currentStepData.title}
                            </Title>
                            <Paragraph style={{ fontSize: 15, color: '#333' }}>
                              {currentStepData.description}
                            </Paragraph>
                          </div>
                          {currentStepData.image && (
                            <div style={{ flex: 1, minWidth: 300 }}>
                              <Image
                                src={currentStepData.image}
                                alt={currentStepData.title}
                                width="100%"
                                style={{ borderRadius: 8 }}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                      <Button
                        icon={<LeftOutlined />}
                        onClick={handlePrevStep}
                        disabled={currentStep === 0}
                      >
                        上一步
                      </Button>
                      <Space>
                        <Text type="secondary">
                          {currentStep + 1} / {activeTechnique.steps?.length}
                        </Text>
                      </Space>
                      <Button
                        type="primary"
                        onClick={handleNextStep}
                        disabled={currentStep === activeTechnique.steps?.length - 1}
                        icon={<RightOutlined />}
                        iconPosition="right"
                      >
                        下一步
                      </Button>
                    </div>

                    {activeTechnique.videoUrl && (
                      <Card 
                        title="🎬 视频演示" 
                        size="small"
                        style={{ marginBottom: 24 }}
                      >
                        <VideoPlayer
                          src={activeTechnique.videoUrl}
                          thumbnail={currentStepData?.image}
                          title={activeTechnique.name}
                        />
                      </Card>
                    )}
                  </div>
                )
              },
              {
                key: 'errors',
                label: '⚠️ 常见错误与改进',
                children: (
                  <div>
                    <List
                      dataSource={activeTechnique.errorPoints}
                      renderItem={(item, index) => (
                        <List.Item key={index}>
                          <Card
                            style={{ width: '100%' }}
                            types="inner"
                            title={
                              <Space>
                                <Badge color="red" />
                                <span style={{ color: '#ff4d4f' }}>错误表现</span>
                              </Space>
                            }
                            extra={
                              <Tag color="red">{index + 1}</Tag>
                            }
                          >
                            <Paragraph style={{ margin: '0 0 12px' }}>{item.problem}</Paragraph>
                            <Divider style={{ margin: '12px 0' }} />
                            <Space align="start">
                              <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />
                              <div>
                                <Text strong style={{ color: '#52c41a' }}>改进方法：</Text>
                                <Paragraph style={{ margin: '4px 0 0' }}>{item.solution}</Paragraph>
                              </div>
                            </Space>
                          </Card>
                        </List.Item>
                      )}
                    />
                  </div>
                )
              },
              {
                key: 'tips',
                label: '💡 经验技巧',
                children: (
                  <div>
                    <Alert
                      message="小贴士"
                      description={activeTechnique.tips}
                      type="success"
                      showIcon
                      icon={<BulbOutlined />}
                    />
                  </div>
                )
              },
              {
                key: 'messages',
                label: <span><CommentOutlined /> 交流讨论</span>,
                children: (
                  <MessageBoard techniqueId={activeTechnique.id} />
                )
              }
            ]}
          />
        </div>
      </Modal>
    )
  }

  const renderToolDetail = () => {
    if (!selectedTool) return null

    return (
      <Modal
        open={!!selectedTool}
        title={
          <Space>
            <span>{selectedTool.name}</span>
            <Tag color="blue">{selectedTool.category}</Tag>
          </Space>
        }
        onCancel={() => setSelectedTool(null)}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
      >
        <Row gutter={24}>
          <Col xs={24} md={10}>
            <Image
              src={selectedTool.image}
              alt={selectedTool.name}
              width="100%"
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Paragraph style={{ fontSize: 15, color: '#333', marginBottom: 16 }}>
              {selectedTool.description}
            </Paragraph>

            <Collapse
              defaultActiveKey={['usage']}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Collapse.Panel
                header={<span><ToolOutlined /> 基本用途</span>}
                key="usage"
              >
                <p style={{ margin: 0 }}>{selectedTool.usage}</p>
              </Collapse.Panel>
              <Collapse.Panel
                header={<span><BulbOutlined /> 操作技巧</span>}
                key="skills"
              >
                <List
                  dataSource={selectedTool.skills}
                  renderItem={(skill, index) => (
                    <List.Item>
                      <Space align="start">
                        <Tag color="brown">{index + 1}</Tag>
                        <span>{skill}</span>
                      </Space>
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
              <Collapse.Panel
                header={<span><SettingOutlined /> 维护保养</span>}
                key="maintenance"
              >
                <p style={{ margin: 0 }}>{selectedTool.maintenance}</p>
              </Collapse.Panel>
              <Collapse.Panel
                header={<span><SafetyOutlined /> 安全注意</span>}
                key="safety"
              >
                <p style={{ margin: 0, color: '#ff4d4f' }}>{selectedTool.safety}</p>
              </Collapse.Panel>
            </Collapse>
          </Col>
        </Row>
      </Modal>
    )
  }

  const renderVideoDetail = () => {
    if (!selectedVideo) return null

    return (
      <Modal
        open={!!selectedVideo}
        title={selectedVideo.title}
        onCancel={() => setSelectedVideo(null)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <VideoPlayer
          src={selectedVideo.videoUrl}
          thumbnail={selectedVideo.thumbnail}
          title={selectedVideo.title}
          autoPlay
        />
        <div style={{ marginTop: 16 }}>
          <Space style={{ marginBottom: 12 }}>
            <Tag color={selectedVideo.level === '入门' ? 'green' : selectedVideo.level === '进阶' ? 'blue' : 'orange'}>
              {selectedVideo.level}
            </Tag>
            <Tag color="purple">{selectedVideo.technique}</Tag>
            <Text type="secondary">
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {selectedVideo.duration}
            </Text>
          </Space>
          <Paragraph style={{ fontSize: 15, color: '#333' }}>
            {selectedVideo.description}
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedVideo.instructor}`} />
              <Text strong>讲师：{selectedVideo.instructor}</Text>
            </Space>
            <Text type="secondary">
              {selectedVideo.views?.toLocaleString()} 次观看
            </Text>
          </div>
          
          {selectedVideo.techniqueId && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={() => {
                  const technique = techniques.find(t => t.id === selectedVideo.techniqueId)
                  if (technique) {
                    setSelectedVideo(null)
                    setTimeout(() => setActiveTechnique(technique), 100)
                  }
                }}
              >
                查看相关技法详解
              </Button>
            </div>
          )}

          {selectedVideo.techniqueId && (
            <div style={{ marginTop: 24 }}>
              <Title level={5} style={{ marginBottom: 16 }}>
                <CommentOutlined /> 视频讨论区
              </Title>
              <MessageBoard techniqueId={selectedVideo.techniqueId} />
            </div>
          )}
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>🛠️ 技艺实操</h1>
        <p>学习陶艺制作的核心技法，了解专业工具使用，观看详细视频教程</p>
      </div>

      <div style={{ padding: '0 24px 48px', maxWidth: 1400, margin: '0 auto' }}>
        <Tabs
          defaultActiveKey="techniques"
          items={tabs}
          size="large"
          style={{ marginBottom: 32 }}
        >
          <Tabs.TabPane tab="核心技法" key="techniques">
            {renderTechniques()}
          </Tabs.TabPane>
          <Tabs.TabPane tab="工具详解" key="tools">
            {renderTools()}
          </Tabs.TabPane>
          <Tabs.TabPane tab="视频教程" key="videos">
            {renderVideos()}
          </Tabs.TabPane>
        </Tabs>
      </div>

      {renderTechniqueDetail()}
      {renderToolDetail()}
      {renderVideoDetail()}
    </div>
  )
}

export default Techniques
