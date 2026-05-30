import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Row, Col, Card, Tag, Avatar, Typography, Button, Space, 
  Image, Divider, Steps, message
} from 'antd'
import { 
  ArrowLeftOutlined, HeartOutlined, EditOutlined, 
  DeleteOutlined, EyeOutlined 
} from '@ant-design/icons'
import { setCurrentWork, likeWork, deleteWork } from '@/store/slices/worksSlice'
import { mockCategories } from '@/mock/data'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

const WorkDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { works } = useSelector(state => state.works)
  const { currentUser } = useSelector(state => state.user)
  
  const work = works.find(w => w.id === parseInt(id))

  useEffect(() => {
    if (work) {
      dispatch(setCurrentWork(work))
    }
  }, [dispatch, work])

  if (!work) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text type="secondary">作品不存在或已被删除</Text>
        <Button type="primary" onClick={() => navigate('/works')} style={{ marginTop: 16 }}>
          返回列表
        </Button>
      </div>
    )
  }

  const category = mockCategories.find(c => c.id === work.category)
  const isOwner = currentUser && currentUser.id === work.authorId
  const isAdmin = currentUser && currentUser.role === 'admin'

  const handleLike = () => {
    dispatch(likeWork(work.id))
    message.success('点赞成功')
  }

  const handleDelete = () => {
    if (isOwner || isAdmin) {
      dispatch(deleteWork(work.id))
      message.success('删除成功')
      navigate('/works')
    }
  }

  const getDifficultyColor = (diff) => {
    const colors = { '初级': 'green', '中级': 'orange', '高级': 'red' }
    return colors[diff] || 'default'
  }

  const getStatusText = (status) => {
    const texts = { approved: '已审核', pending: '待审核', rejected: '已拒绝' }
    const colors = { approved: 'green', pending: 'orange', rejected: 'red' }
    return <Tag color={colors[status]}>{texts[status]}</Tag>
  }

  return (
    <div>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/works')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Image.PreviewGroup>
              <Image 
                src={work.images[0]} 
                alt={work.title}
                style={{ width: '100%', borderRadius: 8 }}
              />
            </Image.PreviewGroup>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space style={{ marginBottom: 12 }} wrap>
                  {category && <Tag color="green">{category.icon} {category.name}</Tag>}
                  <Tag color={getDifficultyColor(work.difficulty)}>{work.difficulty}</Tag>
                  {work.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  {getStatusText(work.status)}
                </Space>
                <Title level={2} style={{ marginTop: 0, marginBottom: 12 }}>
                  {work.title}
                </Title>
                <Paragraph style={{ color: '#666', fontSize: 14 }}>
                  {work.description}
                </Paragraph>
              </div>

              <Space size="large">
                <Space>
                  <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${work.author}`} size={40} />
                  <div>
                    <div style={{ fontWeight: 500 }}>{work.author}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>创作者</Text>
                  </div>
                </Space>
              </Space>

              <Space size="large">
                <Space>
                  <EyeOutlined />
                  <Text type="secondary">浏览</Text>
                  <Text strong>{work.views}</Text>
                </Space>
                <Space>
                  <HeartOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="secondary">点赞</Text>
                  <Text strong>{work.likes}</Text>
                </Space>
                <Text type="secondary">发布于 {work.createTime}</Text>
              </Space>

              <Space>
                <Button type="primary" icon={<HeartOutlined />} onClick={handleLike}>
                  点赞
                </Button>
                {isOwner && (
                  <Button icon={<EditOutlined />} onClick={() => navigate(`/works/${work.id}/edit`)}>
                    编辑
                  </Button>
                )}
                {(isOwner || isAdmin) && (
                  <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                    删除
                  </Button>
                )}
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {work.creationProcess && work.creationProcess.length > 0 && (
        <Card title="创作过程">
          <Steps
            direction="vertical"
            items={work.creationProcess.map((step, index) => ({
              title: `第${step.step}步：${step.title}`,
              description: (
                <div style={{ marginTop: 12 }}>
                  <Paragraph>{step.description}</Paragraph>
                  {step.image && (
                    <Image 
                      src={step.image} 
                      alt={step.title}
                      style={{ width: '100%', maxWidth: 400, borderRadius: 8, marginTop: 12 }}
                    />
                  )}
                </div>
              )
            }))}
          />
        </Card>
      )}
    </div>
  )
}

export default WorkDetail
