import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Button, Empty, Modal, Form, Input, Select, message, Popconfirm, Tag, Statistic, Row as AntRow, Col as AntCol, Tabs } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, HeartOutlined, CommentOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { fetchWorks, addWork, updateWork, deleteWork } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'

const { TextArea } = Input
const { Meta } = Card

const statusConfig = {
  pending: { label: '审核中', color: 'orange', icon: <ClockCircleOutlined /> },
  approved: { label: '已通过', color: 'green', icon: <CheckCircleOutlined /> },
  rejected: { label: '未通过', color: 'red', icon: <CloseCircleOutlined /> }
}

const MyWorks = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { works, comments, loading } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingWork, setEditingWork] = useState(null)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    dispatch(fetchWorks())
  }, [dispatch])

  const myWorks = works.filter(w => currentUser?.myWorks?.includes(w.id))

  const getWorksByStatus = (status) => {
    if (status === 'all') return myWorks
    return myWorks.filter(w => w.status === status)
  }

  const getStatistics = () => {
    const totalWorks = myWorks.length
    const totalViews = myWorks.reduce((sum, w) => sum + (w.views || 0), 0)
    const totalLikes = myWorks.reduce((sum, w) => sum + (w.likes || 0), 0)
    const totalComments = myWorks.reduce((sum, w) => {
      const workComments = comments.works[w.id] || []
      return sum + workComments.length
    }, 0)
    return { totalWorks, totalViews, totalLikes, totalComments }
  }

  const stats = getStatistics()

  const handleAdd = () => {
    setEditingWork(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (work) => {
    setEditingWork(work)
    form.setFieldsValue(work)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    dispatch(deleteWork(id))
    message.success('删除成功')
  }

  const handleSubmit = async (values) => {
    if (editingWork) {
      dispatch(updateWork({ id: editingWork.id, data: { ...values, status: 'pending' } }))
      message.success('修改成功，作品已重新提交审核')
    } else {
      const newWork = {
        ...values,
        id: works.length + 1,
        author: currentUser?.name || '匿名',
        authorId: currentUser?.id,
        colors: ['#2d5a27', '#4a7c43'],
        createTime: new Date().toISOString().split('T')[0],
        likes: 0,
        views: 0,
        image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=400&fit=crop',
        status: 'pending',
        reviewMessage: ''
      }
      dispatch(addWork(newWork))
      message.success('发布成功，作品已提交审核')
    }
    setModalVisible(false)
  }

  const getWorkCommentsCount = (workId) => {
    return (comments.works[workId] || []).length
  }

  if (loading.works) {
    return <LoadingState />
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty description="请先登录查看作品" />
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          去登录
        </Button>
      </div>
    )
  }

  const displayWorks = getWorksByStatus(activeTab)

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>我的作品</h1>
              <p>共 {myWorks.length} 个作品</p>
            </div>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              发布作品
            </Button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 24 }}>
        <Card style={{ marginBottom: 24 }}>
          <AntRow gutter={16}>
            <AntCol span={6}>
              <Statistic 
                title="作品总数" 
                value={stats.totalWorks}
                valueStyle={{ color: '#2d5a27' }}
              />
            </AntCol>
            <AntCol span={6}>
              <Statistic 
                title="总浏览量" 
                value={stats.totalViews}
                prefix={<EyeOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </AntCol>
            <AntCol span={6}>
              <Statistic 
                title="总点赞数" 
                value={stats.totalLikes}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </AntCol>
            <AntCol span={6}>
              <Statistic 
                title="总评论数" 
                value={stats.totalComments}
                prefix={<CommentOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </AntCol>
          </AntRow>
        </Card>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: 'all', label: `全部 (${myWorks.length})` },
              { key: 'pending', label: `审核中 (${myWorks.filter(w => w.status === 'pending').length})` },
              { key: 'approved', label: `已通过 (${myWorks.filter(w => w.status === 'approved').length})` },
              { key: 'rejected', label: `未通过 (${myWorks.filter(w => w.status === 'rejected').length})` }
            ]}
          />

          {displayWorks.length > 0 ? (
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {displayWorks.map(work => (
                <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                  <Card
                    cover={
                      <div style={{
                        height: 200,
                        background: `url(${work.image}) center/cover`,
                        position: 'relative'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12 
                        }}>
                          <Tag 
                            color={statusConfig[work.status]?.color}
                            icon={statusConfig[work.status]?.icon}
                          >
                            {statusConfig[work.status]?.label}
                          </Tag>
                        </div>
                        <div style={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12,
                          display: 'flex',
                          gap: 8
                        }}>
                          <Button 
                            type="default" 
                            size="small" 
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(work)}
                          />
                          <Popconfirm
                            title="确定删除这个作品吗？"
                            onConfirm={() => handleDelete(work.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button 
                              type="default" 
                              size="small" 
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '8px 12px',
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          justifyContent: 'space-around',
                          color: 'white',
                          fontSize: 12
                        }}>
                          <span><EyeOutlined style={{ marginRight: 4 }} />{work.views}</span>
                          <span><HeartOutlined style={{ marginRight: 4 }} />{work.likes}</span>
                          <span><CommentOutlined style={{ marginRight: 4 }} />{getWorkCommentsCount(work.id)}</span>
                        </div>
                      </div>
                    }
                    onClick={() => navigate(`/work/${work.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Meta
                      title={work.title}
                      description={
                        <div>
                          <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                            {work.technique}
                          </div>
                          <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
                            {work.createTime}
                          </div>
                          {work.status === 'rejected' && work.reviewMessage && (
                            <div style={{ 
                              color: '#f5222d', 
                              fontSize: 12, 
                              background: '#fff1f0',
                              padding: '4px 8px',
                              borderRadius: 4
                            }}>
                              审核意见：{work.reviewMessage}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description={
                activeTab === 'all' 
                  ? '还没有发布任何作品' 
                  : `暂无${statusConfig[activeTab]?.label}的作品`
              } 
              style={{ padding: '60px 0' }} 
            />
          )}
        </Card>
      </div>

      <Modal
        title={editingWork ? '编辑作品' : '发布作品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="作品名称"
            rules={[{ required: true, message: '请输入作品名称' }]}
          >
            <Input placeholder="请输入作品名称" />
          </Form.Item>

          <Form.Item
            name="type"
            label="作品类型"
            rules={[{ required: true, message: '请选择作品类型' }]}
          >
            <Select placeholder="请选择作品类型">
              <Select.Option value="classic">经典作品</Select.Option>
              <Select.Option value="innovation">创新作品</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="material"
            label="使用染材"
            rules={[{ required: true, message: '请输入使用染材' }]}
          >
            <Input placeholder="请输入使用染材" />
          </Form.Item>

          <Form.Item
            name="technique"
            label="所用技法"
            rules={[{ required: true, message: '请输入所用技法' }]}
          >
            <Input placeholder="请输入所用技法" />
          </Form.Item>

          <Form.Item
            name="description"
            label="作品描述"
            rules={[{ required: true, message: '请输入作品描述' }]}
          >
            <TextArea rows={4} placeholder="请描述你的作品" />
          </Form.Item>

          {editingWork && (
            <div style={{ 
              background: '#fffbe6', 
              padding: 12, 
              borderRadius: 8, 
              marginBottom: 16,
              border: '1px solid #ffe58f'
            }}>
              <p style={{ margin: 0, color: '#d48806', fontSize: 12 }}>
                💡 提示：编辑后的作品需要重新提交审核
              </p>
            </div>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingWork ? '保存修改' : '发布作品'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyWorks
