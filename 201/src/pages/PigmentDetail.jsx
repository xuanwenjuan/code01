import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Row, Col, Card, Tag, Button, Space, Avatar, Descriptions,
  Tabs, List, Modal, message, Typography, Steps, Divider,
  Tooltip, Popover, Timeline
} from 'antd'
import {
  ArrowLeftOutlined, HeartOutlined, HeartFilled,
  EnvironmentOutlined, UserOutlined, PlayCircleOutlined,
  EyeOutlined, CalendarOutlined, FireOutlined, ShareAltOutlined,
  InfoCircleOutlined, CopyOutlined, QrcodeOutlined,
  TrophyOutlined, BookOutlined, MedicineBoxOutlined,
  SafetyCertificateOutlined, ExperimentOutlined, HistoryOutlined,
  ClockCircleOutlined, StarOutlined, SunOutlined
} from '@ant-design/icons'
import { fetchPigmentById, clearDetail } from '@/store/slices/pigmentSlice'
import { toggleFavorite, addBrowseHistory, toggleFollowMaster } from '@/store/slices/userSlice'
import Loading from '@/components/common/Loading'
import ErrorBlock from '@/components/common/ErrorBlock'
import PigmentCard from '@/components/PigmentCard'
import { pigments } from '@/mock'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card

const propertyKnowledge = {
  lightfastness: {
    title: '耐光性',
    icon: <SunOutlined />,
    content: '耐光性是指颜料在光照下保持颜色不发生变化的能力。耐光性极佳的颜料如石青、石绿等矿物颜料，可以历经千年不褪色，敦煌壁画中使用的矿物颜料历经千年仍然色彩鲜艳。',
    levels: {
      '极佳': '在强日光照射下可保持数百年不褪色',
      '较好': '在正常光照下可保持数十年不褪色',
      '一般': '需要避光保存，长期光照可能会褪色'
    }
  },
  transparency: {
    title: '透明度',
    icon: <ExperimentOutlined />,
    content: '透明度是指颜料涂层的透明程度。不透明颜料如朱砂、蛤粉等覆盖力强，适合平涂效果；半透明颜料如赭石适合渲染效果；透明颜料如胭脂、藤黄适合多层罩染。',
    levels: {
      '不透明': '覆盖力强，可完全覆盖底色',
      '半透明': '可部分透见底色',
      '透明': '可清晰透见底色，适合罩染'
    }
  },
  toxicity: {
    title: '毒性',
    icon: <SafetyCertificateOutlined />,
    content: '矿物颜料的毒性与其化学成分有关。朱砂、雄黄等含硫化物的颜料具有一定毒性，使用时需注意防护。现代画家在使用有毒颜料时应佩戴手套，避免入口，使用后及时洗手。',
    levels: {
      '无毒': '可安全使用',
      '低毒': '正常使用无害，避免长期接触',
      '有毒': '使用时需注意防护，避免入口和长期接触'
    }
  },
  grindingDifficulty: {
    title: '研磨难度',
    icon: <MedicineBoxOutlined />,
    content: '研磨难度反映了将矿石研磨成细粉的难易程度。质地坚硬的矿石需要长时间研磨才能获得细腻的颜料颗粒。传统水飞法是中国传统颜料制作工艺的核心技术。',
    levels: {
      '容易': '质地较软，短时间研磨即可',
      '中等': '需要一定时间研磨',
      '较难': '质地坚硬，需要长时间反复研磨',
      '无需研磨': '已加工成品'
    }
  }
}

const masterAchievements = [
  { year: '1985年', title: '开始跟随父亲学习传统颜料制作技艺' },
  { year: '1990年', title: '独立完成第一套完整的石青颜料制作' },
  { year: '1995年', title: '作品被故宫博物院选为古画修复专用颜料' },
  { year: '2000年', title: '获得省级工艺美术大师称号' },
  { year: '2008年', title: '被评为国家级非物质文化遗产传承人' },
  { year: '2015年', title: '出版《中国传统矿物颜料制作技艺》专著' },
  { year: '2020年', title: '建立传统颜料制作技艺传习所' },
  { year: '2023年', title: '作品入选国家非遗展示中心' }
]

const processTools = {
  '选矿': ['精选高纯度矿石', '挑选色泽纯正的优质原料', '去除杂质和劣质部分'],
  '粗碎': ['铁锤', '石臼', '铜钵'],
  '研磨': ['砚台', '水飞钵', '瓷盘'],
  '淘洗': ['陶瓷缸', '细纱布', '清水'],
  '沉淀': ['大瓷缸', '日光', '耐心'],
  '晾干': ['阴凉通风处', '避免阳光直射', '自然阴干']
}

const processTips = {
  '选矿': '挑选矿石时要注意颜色纯正，好的原料是优质颜料的基础',
  '粗碎': '破碎时要注意力度，过度破碎会产生过多杂质',
  '研磨': '水磨是关键，时间越细越好，传统工艺要72小时以上',
  '淘洗': '淘洗次数越多，颜料越细腻',
  '沉淀': '沉淀时要保持环境清洁，避免灰尘落入',
  '晾干': '阴干而非晒干，晒干会导致颜料结块'
}

function PigmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { detail, loading, error } = useSelector(state => state.pigment)
  const { currentUser } = useSelector(state => state.user)
  const [knowledgeModal, setKnowledgeModal] = useState({ visible: false, type: '' })
  const [shareModal, setShareModal] = useState(false)
  const [masterModal, setMasterModal] = useState(false)
  const [activeTab, setActiveTab] = useState('source')

  useEffect(() => {
    dispatch(fetchPigmentById(id))
    return () => dispatch(clearDetail())
  }, [dispatch, id])

  useEffect(() => {
    if (detail && currentUser) {
      dispatch(addBrowseHistory(detail.id))
    }
  }, [detail, currentUser, dispatch])

  const isFavorite = currentUser?.favorites?.includes(detail?.id)
  const isFollowing = currentUser?.followingMasters?.includes(detail?.master?.id)

  const handleFavorite = () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(toggleFavorite(detail.id))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const handleFollowMaster = () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(toggleFollowMaster(detail.master.id))
    message.success(isFollowing ? '已取消关注' : '关注成功')
  }

  const handleVideoClick = (video) => {
    Modal.info({
      title: video.title,
      width: 700,
      content: (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '100%',
              height: 400,
              backgroundImage: `url(${video.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              cursor: 'pointer'
            }}
            onClick={() => message.info('视频播放功能演示中...')}
          >
            <PlayCircleOutlined style={{ fontSize: 64, color: '#fff' }} />
          </div>
          <p style={{ marginTop: 16, color: '#666' }}>
            时长：{video.duration} | 该视频展示传统颜料制作技艺
          </p>
        </div>
      ),
      okText: '关闭'
    })
  }

  const handleShare = () => {
    setShareModal(true)
  }

  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败，请手动复制')
    })
  }

  const handleShowKnowledge = (type) => {
    setKnowledgeModal({ visible: true, type })
  }

  const relatedPigments = pigments.filter(p => detail?.relatedPigments?.includes(p.id))

  const getProcessPopover = (stepName) => (
    <Popover
      title={`${stepName} - 详情说明`}
      content={
        <div style={{ width: 280 }}>
          <Paragraph strong style={{ marginBottom: 8 }}>所需工具/材料：</Paragraph>
          <List
            size="small"
            dataSource={processTools[stepName] || []}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
          <Divider style={{ margin: '12px 0' }} />
          <Paragraph type="warning" strong style={{ marginBottom: 4 }}>注意事项：</Paragraph>
          <Paragraph style={{ fontSize: 12, marginBottom: 0 }}>
            {processTips[stepName]}
          </Paragraph>
        </div>
      }
      trigger="hover"
    >
      <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 8 }} />
    </Popover>
  )

  const tabItems = [
    {
      key: 'source',
      label: '矿源溯源',
      children: detail?.mineSource && (
        <Card>
          <Row gutter={24}>
            <Col md={12}>
              <Title level={5} style={{ marginBottom: 16 }}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                矿源信息
              </Title>
              <Descriptions column={1} bordered size="middle" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="产地">
                  <Space><EnvironmentOutlined /> {detail.mineSource.location}</Space>
                </Descriptions.Item>
                {detail.mineSource.latitude && (
                  <Descriptions.Item label="地理坐标">
                    {detail.mineSource.latitude}°N, {detail.mineSource.longitude}°E
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="矿床类型">{detail.mineSource.formation}</Descriptions.Item>
                <Descriptions.Item label="开采历史">{detail.mineSource.extractionHistory}</Descriptions.Item>
              </Descriptions>

              <Divider />

              <Title level={5} style={{ marginBottom: 16 }}>
                <BookOutlined style={{ marginRight: 8 }} />
                地质特征
              </Title>
              <Card size="small" style={{ background: '#faf5eb' }}>
                <Paragraph style={{ marginBottom: 0 }}>
                  {detail.category === 'natural' ? (
                    <>
                      {detail.name}属于天然矿物颜料，主要成分为{detail.mineSource.formation}中形成的{detail.colorName}色矿物。其形成需要特定的地质条件，经过亿万年的地质作用，矿物结晶良好，色泽纯正。
                      优质的{detail.name}矿石多产于特定的地质层位中，开采难度较大，因此价值较高。
                    </>
                  ) : (
                    <>
                      {detail.name}是由多种天然原料经过传统工艺调配而成，传承了中国传统颜料调配技艺的精髓。
                      其配方经过千百年的实践验证，色彩稳定，品质优良。
                    </>
                  )}
                </Paragraph>
              </Card>
            </Col>
            <Col md={12}>
              <Title level={5} style={{ marginBottom: 16 }}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                矿源分布
              </Title>
              <div
                style={{
                  height: 200,
                  background: 'linear-gradient(135deg, #f5e6d3 0%, #d4c4a8 100%)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <EnvironmentOutlined style={{ fontSize: 48, color: '#8B4513' }} />
                  <p style={{ marginTop: 12, color: '#5D4037' }}>矿源位置示意图</p>
                  <p style={{ color: '#8B4513', fontSize: 12 }}>{detail.mineSource.location}</p>
                </div>
              </div>

              <Divider />

              <Title level={5} style={{ marginBottom: 16 }}>
                <HistoryOutlined style={{ marginRight: 8 }} />
                详细介绍
              </Title>
              <Paragraph style={{ color: '#666', lineHeight: 1.8 }}>
                {detail.detailedDescription}
              </Paragraph>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'master',
      label: '调配师介绍',
      children: detail?.master && (
        <Card>
          <Row gutter={24}>
            <Col md={8} style={{ textAlign: 'center' }}>
              <Avatar
                src={detail.master.avatar}
                size={140}
                style={{ marginBottom: 16 }}
              />
              <Title level={3} style={{ marginBottom: 8 }}>{detail.master.name}</Title>
              <Tag color="gold" style={{ fontSize: 14 }}>{detail.master.title}</Tag>
              <div style={{ marginTop: 16 }}>
                <Button
                  type={isFollowing ? 'default' : 'primary'}
                  onClick={handleFollowMaster}
                  size="large"
                >
                  {isFollowing ? '已关注' : '+ 关注调配师'}
                </Button>
              </div>
              <Button
                type="link"
                onClick={() => setMasterModal(true)}
                style={{ marginTop: 8 }}
              >
                查看详细履历 →
              </Button>
              <div style={{ marginTop: 16, color: '#666' }}>
                <div><ClockCircleOutlined style={{ marginRight: 4 }} /> 从业经验：{detail.master.experience} 年</div>
                <div><UserOutlined style={{ marginRight: 4 }} /> 粉丝数：{detail.master.followers}</div>
              </div>
            </Col>
            <Col md={16}>
              <Title level={5} style={{ marginBottom: 12 }}>个人简介</Title>
              <Paragraph style={{ color: '#666', lineHeight: 1.8, fontSize: 14 }}>
                {detail.master.bio}
              </Paragraph>
              <Divider />
              <Title level={5} style={{ marginBottom: 12 }}>擅长领域</Title>
              <Card size="small" style={{ background: '#faf5eb', marginBottom: 16 }}>
                <p style={{ color: '#666', marginBottom: 0 }}>{detail.master.specialty}</p>
              </Card>
              <Title level={5} style={{ marginBottom: 12 }}>代表作品</Title>
              <Row gutter={[16, 16]}>
                {detail.master.pigments?.map(pigmentId => {
                  const pigment = pigments.find(p => p.id === pigmentId)
                  return pigment ? (
                    <Col xs={12} key={pigmentId}>
                      <Card
                        size="small"
                        className="card-hover"
                        cover={
                          <div
                            style={{
                              height: 80,
                              backgroundColor: pigment.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 24,
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/pigment/${pigment.id}`)}
                          >
                            {pigment.chineseName}
                          </div>
                        }
                      >
                        <Meta title={pigment.name} />
                      </Card>
                    </Col>
                  ) : null
                })}
              </Row>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'process',
      label: '制作工艺',
      children: detail?.productionProcess && (
        <Card>
          <Title level={5} style={{ marginBottom: 24 }}>
            制作工艺流程
          </Title>
          <Steps
            direction="vertical"
            size="large"
            items={detail.productionProcess.map(step => ({
              title: (
                <Space align="center">
                  <strong>步骤 {step.step}：{step.name}</strong>
                  {getProcessPopover(step.name)}
                </Space>
              ),
              description: (
                <div>
                  <Paragraph style={{ marginBottom: 0 }}>{step.description}</Paragraph>
                </div>
              )
            }))}
          />
        </Card>
      )
    },
    {
      key: 'videos',
      label: '视频展示',
      children: detail?.videos && detail.videos.length > 0 ? (
        <Row gutter={[24, 24]}>
          {detail.videos.map(video => (
            <Col key={video.id} md={12}>
              <Card
                hoverable
                className="card-hover"
                cover={
                  <div
                    style={{
                      height: 200,
                      backgroundImage: `url(${video.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => handleVideoClick(video)}
                  >
                    <PlayCircleOutlined style={{ fontSize: 64, color: '#fff', zIndex: 1 }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12
                    }}>
                      {video.duration}
                    </div>
                  </div>
                }
              >
                <Meta title={video.title} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          暂无视频
        </div>
      )
    },
    {
      key: 'applications',
      label: '应用场景',
      children: detail?.applications && (
        <Card>
          <Title level={5} style={{ marginBottom: 16 }}>应用领域</Title>
          <Row gutter={[16, 16]}>
            {detail.applications.map((app, index) => (
              <Col key={index} md={12}>
                <Card size="small" className="card-hover">
                  <Space>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: detail.color
                    }} />
                    <span style={{ fontWeight: 600 }}>{app.field}</span>
                  </Space>
                  <p style={{ margin: '8px 0 0 20px', color: '#666' }}>
                    代表：{app.example}
                  </p>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )
    },
    {
      key: 'history',
      label: '历史案例',
      children: detail?.historicalExamples && detail.historicalExamples.length > 0 ? (
        <Card>
          <Title level={5} style={{ marginBottom: 16 }}>历史名画应用</Title>
          <List
            itemLayout="horizontal"
            dataSource={detail.historicalExamples}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Space>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <Tag color="blue">{item.dynasty}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ color: '#888', marginBottom: 4 }}>作者：{item.artist}</div>
                      <div>{item.description}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          暂无历史案例
        </div>
      )
    }
  ]

  if (loading) return <Loading tip="加载颜料详情..." />
  if (error) return <ErrorBlock message={error} onRetry={() => dispatch(fetchPigmentById(id))} />
  if (!detail) return null

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 24 }}
      >
        返回
      </Button>

      <Card
        style={{ marginBottom: 24 }}
        styles={{ body: { padding: 0 } }}
      >
        <Row gutter={0}>
          <Col md={10}>
            <div
              style={{
                height: 350,
                backgroundColor: detail.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <span style={{
                color: '#fff',
                fontSize: 72,
                fontWeight: 'bold',
                textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
              }}>
                {detail.chineseName}
              </span>
              {detail.isHot && (
                <Tag
                  icon={<FireOutlined />}
                  color="red"
                  style={{ position: 'absolute', top: 16, right: 16, fontSize: 14 }}
                >
                  热门
                </Tag>
              )}
            </div>
          </Col>
          <Col md={14}>
            <div style={{ padding: 32 }}>
              <Space style={{ marginBottom: 16 }} wrap>
                <Title level={2} style={{ margin: 0 }}>{detail.name}</Title>
                <Tag color={detail.category === 'natural' ? 'green' : 'orange'}>
                  {detail.category === 'natural' ? '天然矿物' : '古法调配'}
                </Tag>
              </Space>

              <Space size="large" style={{ marginBottom: 24, color: '#666' }}>
                <span><EnvironmentOutlined /> {detail.origin}</span>
                <span><EyeOutlined /> {detail.views} 浏览</span>
                <span><CalendarOutlined /> {detail.createTime}</span>
              </Space>

              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#555', marginBottom: 24 }}>
                {detail.description}
              </Paragraph>

              <Space wrap size="large" style={{ marginBottom: 24 }}>
                <Tag color="blue" style={{ padding: '4px 12px', fontSize: 14 }}>
                  色系：{detail.colorName}
                </Tag>
                <Tag style={{ padding: '4px 12px', fontSize: 14, background: detail.color, color: '#fff' }}>
                  色值：{detail.color}
                </Tag>
              </Space>

              {detail.properties && (
                <>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    颜料特性
                    <Tooltip title="点击查看详细说明">
                      <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff', fontSize: 14 }} />
                    </Tooltip>
                  </Title>
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    {Object.entries(detail.properties).map(([key, value]) => (
                      <Col span={12} key={key}>
                        <Card
                          size="small"
                          className="card-hover"
                          onClick={() => handleShowKnowledge(key)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Space>
                            {propertyKnowledge[key]?.icon}
                            <div>
                              <div style={{ color: '#888', fontSize: 12 }}>{propertyKnowledge[key]?.title}</div>
                              <div style={{ fontWeight: 600, color: '#5D4037' }}>{value}</div>
                            </div>
                            <InfoCircleOutlined style={{ color: '#1890ff', marginLeft: 'auto' }} />
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              <Space size="middle" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  style={{ background: isFavorite ? '#e74c3c' : undefined, borderColor: isFavorite ? '#e74c3c' : undefined }}
                >
                  {isFavorite ? '已收藏' : '收藏'} ({detail.likes})
                </Button>
                <Button
                  size="large"
                  icon={<ShareAltOutlined />}
                  onClick={handleShare}
                >
                  分享
                </Button>
                <Button size="large" onClick={() => navigate('/')}>
                  继续探索
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
        />
      </Card>

      {relatedPigments.length > 0 && (
        <div>
          <div className="section-title">相关颜料推荐</div>
          <Row gutter={[24, 24]}>
            {relatedPigments.map(pigment => (
              <Col key={pigment.id} xs={24} sm={12} md={8} lg={6}>
                <PigmentCard pigment={pigment} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      <Modal
        title={
          <Space>
            {propertyKnowledge[knowledgeModal.type]?.icon}
            {propertyKnowledge[knowledgeModal.type]?.title} 知识点
          </Space>
        }
        open={knowledgeModal.visible}
        onCancel={() => setKnowledgeModal({ visible: false, type: '' })}
        footer={null}
        width={600}
      >
        {knowledgeModal.type && propertyKnowledge[knowledgeModal.type] && (
          <div>
            <Paragraph style={{ fontSize: 14, lineHeight: 1.8 }}>
              {propertyKnowledge[knowledgeModal.type].content}
            </Paragraph>
            <Divider />
            <Title level={5}>等级说明</Title>
            {Object.entries(propertyKnowledge[knowledgeModal.type].levels).map(([level, desc]) => (
              <div key={level} style={{ marginBottom: 8 }}>
                <Tag color={detail.properties[knowledgeModal.type] === level ? 'green' : 'default'}>
                  {level}
                  {detail.properties[knowledgeModal.type] === level && ' (当前)'}
                </Tag>
                <Text style={{ marginLeft: 8 }}>{desc}</Text>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        title="分享颜料"
        open={shareModal}
        onCancel={() => setShareModal(false)}
        footer={null}
        width={500}
      >
        <div style={{ textAlign: 'center', padding: 20 }}>
          <div
            style={{
              width: 120,
              height: 120,
              backgroundColor: detail.color,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 36,
              fontWeight: 'bold',
              margin: '0 auto 16px'
            }}
          >
            {detail.chineseName}
          </div>
          <Title level={4} style={{ marginBottom: 8 }}>{detail.name}</Title>
          <Paragraph style={{ color: '#666', marginBottom: 24 }}>
            {detail.description}
          </Paragraph>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              block
              icon={<CopyOutlined />}
              onClick={handleCopyLink}
            >
              复制链接
            </Button>
            <Button
              block
              icon={<QrcodeOutlined />}
              onClick={() => message.info('生成分享图功能开发中...')}
            >
              生成分享海报
            </Button>
          </Space>
        </div>
      </Modal>

      <Modal
        title={
          <Space>
            <UserOutlined />
            调配师详细履历
          </Space>
        }
        open={masterModal}
        onCancel={() => setMasterModal(false)}
        footer={null}
        width={700}
      >
        {detail?.master && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar src={detail.master.avatar} size={100} />
              <Title level={4} style={{ marginTop: 16 }}>{detail.master.name}</Title>
              <Tag color="gold">{detail.master.title}</Tag>
            </div>
            <Divider />
            <Title level={5} style={{ marginBottom: 16 }}>
              <TrophyOutlined style={{ marginRight: 8 }} />
              从业经历
            </Title>
            <Timeline
              mode="left"
              items={masterAchievements.map((item, index) => ({
                color: index === masterAchievements.length - 1 ? 'green' : 'blue',
                label: item.year,
                children: item.title
              }))}
            />
            <Divider style={{ margin: '24px 0' }} />
            <Title level={5} style={{ marginBottom: 16 }}>
              <StarOutlined style={{ marginRight: 8 }} />
              个人简介
            </Title>
            <Paragraph style={{ lineHeight: 1.8 }}>
              {detail.master.bio}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PigmentDetail
