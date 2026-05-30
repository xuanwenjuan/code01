import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Row, Col, Typography, Steps, Card, Tag, Button, Modal,
  Tabs, Collapse, Descriptions, List, Avatar, Badge, Divider,
  Timeline, Popover, message
} from 'antd'
import {
  PlayCircleOutlined, InfoCircleOutlined, DownloadOutlined,
  HeartOutlined, HeartFilled, HistoryOutlined, EyeOutlined
} from '@ant-design/icons'
import { mockProcessSteps, mockMaterialKnowledge, mockKnowledgePoints, mockArtisans, mockWorks } from '@/mock'
import { toggleFavoriteWork, addToHistory } from '@/store/slices/userSlice'
import KnowledgeTooltip from '@/components/KnowledgeTooltip'
import CommentSection from '@/components/CommentSection'
import WorkCard from '@/components/WorkCard'
import ArtisanCard from '@/components/ArtisanCard'
import './index.css'

const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs
const { Panel } = Collapse

const Technique = () => {
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const favorites = useSelector(state => state.user.favorites.works)
  const [currentStep, setCurrentStep] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedStep, setSelectedStep] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const headerKnowledge = mockKnowledgePoints.find(k => k.position === 'header')
  const materialKnowledge = mockKnowledgePoints.find(k => k.position === 'material')
  const carvingKnowledge = mockKnowledgePoints.find(k => k.position === 'carving')
  const processKnowledge = mockKnowledgePoints.find(k => k.position === 'process')
  const footerKnowledge = mockKnowledgePoints.find(k => k.position === 'footer')

  const stepItems = mockProcessSteps.map((step, index) => ({
    title: step.title,
    description: step.duration
  }))

  const handleStepClick = (step) => {
    setSelectedStep(step)
    setModalVisible(true)
    dispatch(addToHistory({
      id: `step-${step.id}`,
      type: 'process',
      title: step.title,
      image: step.image,
      timestamp: new Date().toISOString()
    }))
  }

  const handleWorkClick = (work) => {
    dispatch(addToHistory({
      id: work.id,
      type: 'work',
      title: work.title,
      image: work.image,
      timestamp: new Date().toISOString()
    }))
  }

  const handleDownload = (type = 'single') => {
    if (!currentUser) {
      message.warning('请先登录后下载')
      return
    }
    setDownloading(true)
    setTimeout(() => {
      message.success(type === 'batch' ? '批量下载成功！' : '下载成功！')
      setDownloading(false)
    }, 1500)
  }

  const handleToggleFavorite = (workId) => {
    if (!currentUser) {
      message.warning('请先登录后收藏')
      return
    }
    dispatch(toggleFavoriteWork(workId))
    message.success(favorites.includes(workId) ? '已取消收藏' : '收藏成功')
  }

  const materials = mockMaterialKnowledge.map(material => ({
    key: material.id,
    label: material.name,
    children: (
      <div>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <img src={material.image} alt={material.name} className="material-image" />
          </Col>
          <Col xs={24} md={16}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="产地">{material.origin}</Descriptions.Item>
              <Descriptions.Item label="硬度">{material.hardness}</Descriptions.Item>
              <Descriptions.Item label="纹理">{material.texture}</Descriptions.Item>
              <Descriptions.Item label="适用场景">{material.usage}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: '16px' }}>
              <Text strong>材质优势：</Text>
              <div style={{ marginTop: '8px' }}>
                {material.advantages.map((adv, i) => (
                  <Tag key={i} color="green" style={{ marginBottom: '4px' }}>{adv}</Tag>
                ))}
              </div>
            </div>
            <Paragraph style={{ marginTop: '16px' }}>{material.description}</Paragraph>
          </Col>
        </Row>
      </div>
    )
  }))

  const carvingSteps = [
    {
      title: '选料',
      content: '选取质地坚硬、纹理均匀的梨木、枣木等优质木材，去除树皮和缺陷部分，切割成规格统一的字坯。',
      time: '约30分钟/块'
    },
    {
      title: '写反字',
      content: '将需要雕刻的字用毛笔反写在薄纸上，然后反贴在字坯上，使字迹清晰地印在木材表面。',
      time: '约5分钟/字'
    },
    {
      title: '刻字',
      content: '使用平刀、圆刀等雕刻工具，按照反字轮廓进行雕刻，注意字体的深浅和笔画的粗细变化。',
      time: '约15-30分钟/字'
    },
    {
      title: '修边',
      content: '将刻好的字坯四周修整齐，去除多余的木料，确保每个活字大小一致、边缘光滑。',
      time: '约5分钟/字'
    },
    {
      title: '打磨',
      content: '用细砂纸将活字表面打磨光滑，去除雕刻时留下的刀痕，使字面平整、字迹清晰。',
      time: '约3分钟/字'
    },
    {
      title: '检验',
      content: '将刻好的活字蘸墨试印，检查字迹是否清晰、完整，对不合格的活字进行修复或重刻。',
      time: '约2分钟/字'
    }
  ]

  const recommendedWorks = mockWorks.filter(w => w.recommended).slice(0, 4)
  const featuredArtisans = mockArtisans.slice(0, 4)

  return (
    <div className="technique-page">
      <div className="page-header">
        <div className="header-title-row">
          <Title level={2}>木活字印刷技艺</Title>
          <KnowledgeTooltip knowledge={headerKnowledge} />
        </div>
        <Paragraph className="page-desc">
          木活字印刷是中国古代四大发明之一，历经千年传承，至今仍散发着独特的艺术魅力。
          从选材到装帧，每一道工序都凝聚着匠人的智慧与心血。
        </Paragraph>
      </div>

      <Tabs defaultActiveKey="1" className="technique-tabs">
        <TabPane tab="工艺流程" key="1">
          <section className="process-section">
            <div className="section-header">
              <Title level={3}>完整印刷流程</Title>
              <div style={{ display: 'flex', gap: '8px' }}>
                <KnowledgeTooltip knowledge={processKnowledge} />
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload('batch')}
                  loading={downloading}
                >
                  批量下载素材
                </Button>
              </div>
            </div>

            <Steps
              current={currentStep}
              onChange={setCurrentStep}
              items={stepItems}
              direction="horizontal"
              className="process-steps"
            />

            <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
              {mockProcessSteps.map((step, index) => (
                <Col key={step.id} xs={24} sm={12} md={6}>
                  <Card
                    hoverable
                    className={`step-card ${currentStep === index ? 'active' : ''}`}
                    cover={<img alt={step.title} src={step.image} className="step-image" />}
                    onClick={() => setCurrentStep(index)}
                    actions={[
                      <Button type="link" icon={<InfoCircleOutlined />} onClick={(e) => { e.stopPropagation(); handleStepClick(step) }}>
                        详情
                      </Button>,
                      <Button type="link" icon={<DownloadOutlined />} onClick={(e) => { e.stopPropagation(); handleDownload() }}>
                        下载
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Tag color="blue">步骤 {index + 1}</Tag>
                            <span>{step.title}</span>
                          </div>
                          <Badge count={step.views} size="small" prefixCls="custom-badge" />
                        </div>
                      }
                      description={step.description.slice(0, 60) + '...'}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          <Divider />

          <section className="video-section">
            <Title level={3}>流程视频演示</Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card className="video-card">
                  <div className="video-placeholder">
                    <PlayCircleOutlined style={{ fontSize: '64px', color: '#fff' }} />
                    <p>排版工艺演示</p>
                  </div>
                  <Card.Meta
                    title="活字排版全过程"
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>时长：15分30秒</span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span><EyeOutlined /> 2.3万</span>
                          <Button type="link" icon={<DownloadOutlined />} size="small" onClick={() => handleDownload()}>下载</Button>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="video-card">
                  <div className="video-placeholder">
                    <PlayCircleOutlined style={{ fontSize: '64px', color: '#fff' }} />
                    <p>刷墨拓印技巧</p>
                  </div>
                  <Card.Meta
                    title="刷墨与拓印技艺"
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>时长：12分15秒</span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span><EyeOutlined /> 1.8万</span>
                          <Button type="link" icon={<DownloadOutlined />} size="small" onClick={() => handleDownload()}>下载</Button>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            </Row>
          </section>
        </TabPane>

        <TabPane tab="选材雕刻" key="2">
          <section className="material-section">
            <div className="section-header">
              <Title level={3}>木材选材</Title>
              <KnowledgeTooltip knowledge={materialKnowledge} />
            </div>
            <Collapse items={materials} defaultActiveKey={[1]} className="material-collapse" />
          </section>

          <Divider />

          <section className="carving-section">
            <div className="section-header">
              <Title level={3}>雕刻工艺详解</Title>
              <KnowledgeTooltip knowledge={carvingKnowledge} />
            </div>
            <Timeline mode="left" className="carving-timeline">
              {carvingSteps.map((step, index) => (
                <Timeline.Item
                  key={index}
                  label={step.time}
                  color="blue"
                >
                  <Card size="small" className="carving-step-card">
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tag color="blue" style={{ margin: 0 }}>第{index + 1}步</Tag>
                          <span style={{ fontWeight: 600 }}>{step.title}</span>
                        </div>
                      }
                      description={step.content}
                    />
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </section>
        </TabPane>

        <TabPane tab="传承人" key="3">
          <section className="artisans-section">
            <Title level={3}>非遗传承人</Title>
            <Row gutter={[24, 24]}>
              {featuredArtisans.map(artisan => (
                <Col key={artisan.id} xs={24} sm={12} lg={6}>
                  <ArtisanCard artisan={artisan} />
                </Col>
              ))}
            </Row>

            <Divider />

            <Title level={4} style={{ marginTop: '40px' }}>传承人从业经历</Title>
            <Card className="experience-card">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={4} style={{ textAlign: 'center' }}>
                  <Avatar src={featuredArtisans[0]?.avatar} size={100} />
                  <div style={{ marginTop: '12px', fontWeight: 600 }}>{featuredArtisans[0]?.name}</div>
                  <Tag color="gold" style={{ marginTop: '4px' }}>国家级非遗传承人</Tag>
                </Col>
                <Col xs={24} md={20}>
                  <Descriptions column={2} size="middle">
                    <Descriptions.Item label="从业年限">{featuredArtisans[0]?.experience}年</Descriptions.Item>
                    <Descriptions.Item label="代表作品">{featuredArtisans[0]?.masterpieces?.slice(0, 2).join('、')}</Descriptions.Item>
                    <Descriptions.Item label="所属流派">{featuredArtisans[0]?.style}</Descriptions.Item>
                    <Descriptions.Item label="获得荣誉">国家级非遗传承人、中国工艺美术大师</Descriptions.Item>
                    <Descriptions.Item label="个人简介" span={2}>
                      {featuredArtisans[0]?.bio}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </section>
        </TabPane>

        <TabPane tab="代表作品" key="4">
          <section className="works-section">
            <div className="section-header">
              <Title level={3}>精品印刷作品</Title>
              {currentUser && (
                <Popover
                  content="登录后可收藏喜欢的作品"
                  trigger="hover"
                >
                  <Text type="secondary">
                    <HeartOutlined /> 点击卡片收藏作品
                  </Text>
                </Popover>
              )}
            </div>
            <Row gutter={[24, 24]}>
              {recommendedWorks.map(work => (
                <Col key={work.id} xs={24} sm={12} lg={6}>
                  <div style={{ position: 'relative' }}>
                    <WorkCard work={work} onClick={() => handleWorkClick(work)} />
                    <Button
                      type="text"
                      icon={favorites.includes(work.id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(work.id)
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </section>
        </TabPane>
      </Tabs>

      <Divider />

      <CommentSection />

      <div className="footer-knowledge">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HistoryOutlined style={{ color: '#faad14' }} />
          <Text strong>历史小知识</Text>
          <KnowledgeTooltip knowledge={footerKnowledge} />
        </div>
        <Paragraph style={{ margin: '8px 0 0 0', color: '#666' }}>
          {footerKnowledge?.content}
        </Paragraph>
      </div>

      <Modal
        title={`${selectedStep?.title} - 工艺详情`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => handleDownload()}>
            下载素材
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={720}
      >
        {selectedStep && (
          <div className="step-detail">
            <img src={selectedStep.image} alt={selectedStep.title} className="step-detail-image" />
            <div className="step-detail-content">
              <Title level={4}>{selectedStep.title}</Title>
              <Tag color="blue">预计时长：{selectedStep.duration}</Tag>
              <Paragraph style={{ marginTop: '16px' }}>{selectedStep.description}</Paragraph>
              <div className="step-detail-info">
                <div>
                  <strong>所需工具：</strong>
                  <div style={{ marginTop: '8px' }}>
                    {selectedStep.tools.map((tool, i) => (
                      <Tag key={i}>{tool}</Tag>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <strong>工艺技巧：</strong>
                  <Paragraph style={{ marginTop: '8px' }}>{selectedStep.tips}</Paragraph>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Technique
