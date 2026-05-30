import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Row, Col, Card, Tag, Avatar, Button, Steps, Descriptions, 
  Tabs, message, Modal, Space, Divider, List, Typography,
  FloatButton, Carousel, Tooltip
} from 'antd'
import { 
  ArrowLeftOutlined, HeartOutlined, HeartFilled, 
  PlayCircleOutlined, EyeOutlined, StarOutlined,
  BulbOutlined, DownloadOutlined, FolderOpenOutlined
} from '@ant-design/icons'
import { 
  fetchTutorials, fetchInheritors, fetchWorks, 
  fetchTutorialMaterials, fetchFavorites,
  addTutorialToFolder
} from '../store/slices/dataSlice'
import { toggleFavorite, addBrowseHistory } from '../store/slices/userSlice'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import CommentSection from '../components/CommentSection'
import EcoKnowledgeModal from '../components/EcoKnowledgeModal'
import DownloadModal from '../components/DownloadModal'
import FavoriteFolderModal from '../components/FavoriteFolderModal'

const { Step } = Steps
const { TabPane } = Tabs
const { Title, Text } = Typography

const TutorialDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tutorials, inheritors, works, loading, tutorialMaterials, favorites } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  
  const [videoModal, setVideoModal] = useState({ visible: false, type: '', title: '' })
  const [ecoModalVisible, setEcoModalVisible] = useState(false)
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [folderModalVisible, setFolderModalVisible] = useState(false)

  useEffect(() => {
    if (tutorials.length === 0) {
      dispatch(fetchTutorials())
    }
    if (inheritors.length === 0) {
      dispatch(fetchInheritors())
    }
    if (works.length === 0) {
      dispatch(fetchWorks())
    }
    if (currentUser && favorites.length === 0) {
      dispatch(fetchFavorites(currentUser.id))
    }
  }, [dispatch, tutorials.length, inheritors.length, works.length, currentUser, favorites.length])

  useEffect(() => {
    dispatch(fetchTutorialMaterials(parseInt(id)))
  }, [dispatch, id])

  useEffect(() => {
    if (currentUser && tutorial) {
      dispatch(addBrowseHistory({ tutorialId: tutorial.id, userId: currentUser.id }))
    }
  }, [currentUser, dispatch, id])

  const tutorial = tutorials.find(t => t.id === parseInt(id))
  const inheritor = inheritors.find(i => i.name === tutorial?.author)
  const inheritorWorks = works.filter(w => 
    inheritor?.representativeWorks?.includes(w.id)
  )

  const isFavorite = currentUser?.favorites?.includes(tutorial?.id) || false

  const handleFavorite = () => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(toggleFavorite({ tutorialId: tutorial.id, userId: currentUser.id }))
    message.success(isFavorite ? '已取消收藏' : '收藏成功')
  }

  const openVideo = (type) => {
    const titles = {
      soak: '浸料视频',
      dye: '染色视频',
      fix: '固色视频'
    }
    setVideoModal({ visible: true, type, title: titles[type] })
  }

  if (loading.tutorials || loading.inheritors) {
    return <LoadingState />
  }

  if (!tutorial) {
    return <EmptyState description="教程不存在" />
  }

  return (
    <div>
      <div 
        className="page-header"
        style={{
          backgroundImage: `linear-gradient(rgba(45, 90, 39, 0.9), rgba(26, 58, 23, 0.95)), url(${tutorial.cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/tutorials')}
            style={{ color: 'white', marginBottom: 16, paddingLeft: 0 }}
          >
            返回教程列表
          </Button>
          <h1 style={{ color: 'white', marginBottom: 12 }}>{tutorial.title}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <Space>
              <Avatar src={inheritor?.avatar} size={32} />
              <span style={{ color: 'rgba(255,255,255,0.9)' }}>{tutorial.author}</span>
            </Space>
            <Tag color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}>
              {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
            </Tag>
            <Tag color="blue">{tutorial.duration}</Tag>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              <EyeOutlined style={{ marginRight: 4 }} />{tutorial.views} 次浏览
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              所需染材：{tutorial.material}
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
                <Space wrap>
                  <Tooltip title="学习环保知识">
                    <Button 
                      icon={<span>🌿</span>}
                      onClick={() => setEcoModalVisible(true)}
                    >
                      环保知识
                    </Button>
                  </Tooltip>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => setDownloadModalVisible(true)}
                  >
                    下载素材
                  </Button>
                  <Button 
                    icon={<FolderOpenOutlined />}
                    onClick={() => {
                      if (!currentUser) {
                        message.warning('请先登录')
                        navigate('/login')
                        return
                      }
                      setFolderModalVisible(true)
                    }}
                  >
                    加入收藏夹
                  </Button>
                  <Button 
                    type={isFavorite ? 'primary' : 'default'}
                    icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFavorite}
                    danger={isFavorite}
                  >
                    {isFavorite ? '已收藏' : '收藏教程'}
                  </Button>
                </Space>
              }
            >
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>
                {tutorial.description}
              </p>
            </Card>

            <Card title="染色完整流程" style={{ marginBottom: 24 }}>
              <Tabs defaultActiveKey="steps">
                <TabPane tab="图文步骤" key="steps">
                  <Card 
                    type="inner" 
                    style={{ 
                      marginBottom: 16, 
                      background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      borderColor: '#b7eb8f'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>💡</span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#389e0d', marginBottom: 4 }}>
                          操作要点
                        </div>
                        <Text style={{ color: '#5b8c00', lineHeight: 1.6 }}>
                          染色过程中请保持耐心，每一步都要充分完成。天然染色需要时间和经验，多多练习就能掌握技巧。染色后的废水可以安全倒入土壤，不会污染环境。
                        </Text>
                      </div>
                    </div>
                  </Card>

                  <Steps
                    direction="vertical"
                    current={tutorial.steps.length}
                    items={tutorial.steps.map((step, index) => ({
                      title: (
                        <Space>
                          <span style={{ fontWeight: 500 }}>{step.title}</span>
                          <Tag color="green" style={{ margin: 0 }}>
                            第 {index + 1} 步
                          </Tag>
                        </Space>
                      ),
                      description: (
                        <Card size="small" style={{ marginTop: 8, marginBottom: 8 }}>
                          <Text type="secondary" style={{ lineHeight: 1.6 }}>
                            {step.desc}
                          </Text>
                        </Card>
                      )
                    }))}
                  />
                </TabPane>
                <TabPane tab="视频教程" key="videos">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Card 
                        hoverable
                        className="card-hover"
                        cover={
                          <div 
                            className="video-placeholder"
                            onClick={() => openVideo('soak')}
                          >
                            <PlayCircleOutlined />
                          </div>
                        }
                        onClick={() => openVideo('soak')}
                      >
                        <Card.Meta title="浸料视频" description="学习如何正确浸泡布料和染材" />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card 
                        hoverable
                        className="card-hover"
                        cover={
                          <div 
                            className="video-placeholder"
                            style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}
                            onClick={() => openVideo('dye')}
                          >
                            <PlayCircleOutlined />
                          </div>
                        }
                        onClick={() => openVideo('dye')}
                      >
                        <Card.Meta title="染色视频" description="掌握染色的关键技巧和注意事项" />
                      </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Card 
                        hoverable
                        className="card-hover"
                        cover={
                          <div 
                            className="video-placeholder"
                            style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}
                            onClick={() => openVideo('fix')}
                          >
                            <PlayCircleOutlined />
                          </div>
                        }
                        onClick={() => openVideo('fix')}
                      >
                        <Card.Meta title="固色视频" description="了解如何固色让颜色更持久" />
                      </Card>
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
            </Card>

            {inheritor && (
              <Card 
                title={
                  <Space>
                    <span>传承人介绍</span>
                    <Tooltip title="了解传承人的技艺特色">
                      <StarOutlined style={{ color: '#faad14' }} />
                    </Tooltip>
                  </Space>
                } 
                style={{ marginBottom: 24 }}
              >
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                    <Avatar size={100} src={inheritor.avatar} />
                    <div style={{ flex: 1 }}>
                      <Title level={4} style={{ marginBottom: 4 }}>{inheritor.name}</Title>
                      <Tag color="gold" style={{ marginBottom: 8 }}>{inheritor.title}</Tag>
                      <p style={{ color: '#666', marginBottom: 8 }}>
                        从业 {inheritor.experience} · 擅长 {inheritor.specialty}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {inheritor.achievements.map((a, i) => (
                          <Tag key={i} color="gold" style={{ fontSize: 11 }}>{a}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Divider />
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: '#333' }}>
                    {inheritor.bio}
                  </p>
                </div>

                <Card 
                  type="inner" 
                  title="技艺特色"
                  style={{ marginBottom: 16 }}
                >
                  <List
                    grid={{ gutter: 12, column: 2 }}
                    dataSource={inheritor.skills || []}
                    renderItem={skill => (
                      <List.Item>
                        <Card size="small" style={{ textAlign: 'center', background: '#fafafa' }}>
                          <span style={{ color: '#2d5a27' }}>✦</span> {skill}
                        </Card>
                      </List.Item>
                    )}
                  />
                </Card>

                {inheritor.style && (
                  <Card 
                    type="inner" 
                    title="艺术风格"
                    style={{ marginBottom: 16 }}
                  >
                    <Text style={{ lineHeight: 1.8 }}>{inheritor.style}</Text>
                  </Card>
                )}

                {inheritorWorks.length > 0 && (
                  <Card type="inner" title="代表作品">
                    <Row gutter={[12, 12]}>
                      {inheritorWorks.map(work => (
                        <Col xs={12} sm={8} key={work.id}>
                          <Card 
                            hoverable
                            cover={
                              <div style={{
                                height: 120,
                                background: `url(${work.image}) center/cover`,
                                borderRadius: 4
                              }} />
                            }
                            size="small"
                            className="card-hover"
                            onClick={() => navigate(`/work/${work.id}`)}
                          >
                            <Card.Meta title={work.title} description={work.technique} />
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}
              </Card>
            )}

            <CommentSection type="tutorials" itemId={tutorial.id} />
          </Col>

          <Col xs={24} lg={8}>
            <Card title="教程信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="难度">
                  <Tag color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}>
                    {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="时长">{tutorial.duration}</Descriptions.Item>
                <Descriptions.Item label="所需染材">{tutorial.material}</Descriptions.Item>
                <Descriptions.Item label="浏览量">{tutorial.views}</Descriptions.Item>
                <Descriptions.Item label="发布时间">{tutorial.createTime}</Descriptions.Item>
                <Descriptions.Item label="步骤数">{tutorial.steps.length} 步</Descriptions.Item>
              </Descriptions>
            </Card>

            {inheritor && (
              <Card title="联系方式" style={{ marginBottom: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={64} src={inheritor.avatar} style={{ marginBottom: 12 }} />
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{inheritor.name}</p>
                  <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
                    {inheritor.title}
                  </p>
                  <Button type="primary" block>
                    联系传承人
                  </Button>
                </div>
              </Card>
            )}

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
                <span style={{ fontSize: 32 }}>♻️</span>
                <div>
                  <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
                    草木染使用天然染料，染色过程产生的废水可自然降解，不会污染环境。染材废渣还可以作为有机肥料使用。
                  </p>
                </div>
              </div>
            </Card>

            <Card title="相关推荐">
              <List
                size="small"
                dataSource={tutorials.filter(t => t.id !== tutorial.id).slice(0, 3)}
                renderItem={item => (
                  <List.Item 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tutorial/${item.id}`)}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <Space>
                          <Tag 
                            color={item.level === 'beginner' ? 'green' : item.level === 'intermediate' ? 'orange' : 'red'}
                            style={{ margin: 0 }}
                          >
                            {item.level === 'beginner' ? '入门' : item.level === 'intermediate' ? '进阶' : '高级'}
                          </Tag>
                          <span style={{ color: '#999', fontSize: 12 }}>{item.duration}</span>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={videoModal.title}
        open={videoModal.visible}
        onCancel={() => setVideoModal({ ...videoModal, visible: false })}
        footer={null}
        width={800}
      >
        <div className="video-placeholder" style={{ height: 450 }}>
          <div style={{ textAlign: 'center' }}>
            <PlayCircleOutlined style={{ fontSize: 80, marginBottom: 16 }} />
            <p style={{ fontSize: 18 }}>视频演示：{videoModal.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>（视频演示区域）</p>
          </div>
        </div>
      </Modal>

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

      <DownloadModal
        visible={downloadModalVisible}
        onClose={() => setDownloadModalVisible(false)}
        materials={tutorialMaterials}
        tutorialTitle={tutorial?.title}
      />

      <FavoriteFolderModal
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        folders={favorites}
        tutorials={tutorials}
        tutorialId={tutorial?.id}
        onAddToFolder={(folderId, tutorialId) => {
          dispatch(addTutorialToFolder({ folderId, tutorialId }))
          message.success('已添加到收藏夹')
          setFolderModalVisible(false)
        }}
      />
    </div>
  )
}

export default TutorialDetail
