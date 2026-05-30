import { useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  Tag,
  Space,
  Image,
  message,
  Popconfirm,
  Timeline,
  DatePicker,
  Avatar,
  Statistic,
  Empty,
  Alert,
  Result
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  CalendarOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TagOutlined,
  FireOutlined,
  FileTextOutlined,
  EyeFilled,
  UserOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchCreationRecords,
  fetchAllCreationRecords,
  addCreationRecord,
  updateCreationRecord,
  deleteCreationRecord,
  incrementViews,
  fetchTags,
  clearError
} from '../store/slices/creationSlice'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import TagManager from '../components/TagManager'
import { validateRequired } from '../utils/validators'
import dayjs from 'dayjs'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const Creation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { records, allRecords, tags, loading, error } = useSelector(state => state.creation)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [form] = Form.useForm()
  const [processForm] = Form.useForm()
  const [filterTag, setFilterTag] = useState(null)
  const [filterStatus, setFilterStatus] = useState(null)
  const [viewMode, setViewMode] = useState('personal')

  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (user) {
      dispatch(fetchCreationRecords({ userId: user.id, isAdmin: false }))
      dispatch(fetchTags())
      if (isAdmin) {
        dispatch(fetchAllCreationRecords())
      }
    }
  }, [dispatch, user, isAdmin])

  useEffect(() => {
    if (error) {
      message.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const displayRecords = isAdmin && viewMode === 'all' ? allRecords : records
  const allTags = [...new Set(displayRecords.flatMap(r => r.tags || []))]
  const filteredRecords = displayRecords
    .filter(r => !filterTag || r.tags?.includes(filterTag))
    .filter(r => !filterStatus || r.status === filterStatus)

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    setFilterTag(null)
    setFilterStatus(null)
  }

  const handleAdd = () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    if (!isAdmin && record.userId !== user.id) {
      message.error('您没有权限编辑此记录')
      return
    }
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      tags: record.tags
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCreationRecord(id)).unwrap()
      message.success('删除成功')
    } catch (err) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const recordData = {
        ...values,
        userId: user.id,
        coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
        status: values.status || 'in_progress',
        process: editingRecord?.process || []
      }

      if (editingRecord) {
        await dispatch(updateCreationRecord({
          id: editingRecord.id,
          updates: recordData
        })).unwrap()
        message.success('更新成功')
      } else {
        await dispatch(addCreationRecord(recordData)).unwrap()
        message.success('创建成功')
      }
      setIsModalOpen(false)
    } catch (err) {
      message.error(err?.message || '操作失败')
    }
  }

  const handleAddProcess = () => {
    if (!selectedRecord) return
    if (!isAdmin && selectedRecord.userId !== user.id) {
      message.error('您没有权限编辑此记录')
      return
    }
    processForm.validateFields().then(values => {
      const newProcess = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        images: ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=200&fit=crop']
      }
      const updatedProcess = [...(selectedRecord.process || []), newProcess]
      dispatch(updateCreationRecord({
        id: selectedRecord.id,
        updates: { process: updatedProcess }
      })).unwrap().then(() => {
        message.success('记录添加成功')
        processForm.resetFields()
        setSelectedRecord({ ...selectedRecord, process: updatedProcess })
      }).catch(() => {
        message.error('添加失败')
      })
    })
  }

  const viewRecordDetail = (record) => {
    dispatch(incrementViews(record.id))
    setSelectedRecord(record)
    setIsProcessModalOpen(true)
  }

  const getStatusTag = (status) => {
    if (status === 'completed') {
      return <Tag icon={<CheckCircleOutlined />} color="success">已完成</Tag>
    }
    return <Tag icon={<ClockCircleOutlined />} color="processing">进行中</Tag>
  }

  const getTagColor = (tagName) => {
    const tag = tags.find(t => t.name === tagName)
    return tag?.color || 'default'
  }

  const stats = {
    total: displayRecords.length,
    completed: displayRecords.filter(r => r.status === 'completed').length,
    inProgress: displayRecords.filter(r => r.status === 'in_progress').length,
    totalViews: displayRecords.reduce((sum, r) => sum + (r.views || 0), 0)
  }

  if (loading && displayRecords.length === 0) {
    return <Loading />
  }

  if (error) {
    return <ErrorState onRetry={() => dispatch(fetchCreationRecords({ userId: user?.id, isAdmin }))} />
  }

  return (
    <div>
      <div className="page-header">
        <h1>✍️ 创作记录</h1>
        <p>记录您的陶艺创作历程，见证每一件作品的诞生</p>
      </div>

      <div style={{ padding: '0 24px 48px', maxWidth: 1400, margin: '0 auto' }}>
        {isAdmin && (
          <Space style={{ marginBottom: 24 }}>
            <Button
              type={viewMode === 'personal' ? 'primary' : 'default'}
              onClick={() => handleViewModeChange('personal')}
            >
              我的创作
            </Button>
            <Button
              type={viewMode === 'all' ? 'primary' : 'default'}
              onClick={() => handleViewModeChange('all')}
            >
              所有用户创作
            </Button>
          </Space>
        )}

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="创作总数"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="已完成"
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="进行中"
                value={stats.inProgress}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title="总浏览量"
                value={stats.totalViews}
                prefix={<EyeFilled />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Title level={3} style={{ margin: 0 }}>
              {viewMode === 'all' ? '所有创作档案' : '我的创作'}
            </Title>
            <Space>
              <Tag
                color={filterStatus === null ? 'brown' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setFilterStatus(null)}
              >
                全部状态
              </Tag>
              <Tag
                color={filterStatus === 'in_progress' ? 'processing' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setFilterStatus(filterStatus === 'in_progress' ? null : 'in_progress')}
              >
                进行中
              </Tag>
              <Tag
                color={filterStatus === 'completed' ? 'success' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')}
              >
                已完成
              </Tag>
            </Space>
            <Space wrap>
              <Tag
                color={filterTag === null ? 'brown' : 'default'}
                style={{ cursor: 'pointer', padding: '4px 12px' }}
                onClick={() => setFilterTag(null)}
              >
                全部标签
              </Tag>
              {allTags.map(tag => (
                <Tag
                  key={tag}
                  color={filterTag === tag ? getTagColor(tag) : 'default'}
                  style={{ cursor: 'pointer', padding: '4px 12px' }}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
          <Space>
            <Button
              icon={<TagOutlined />}
              onClick={() => setIsTagManagerOpen(true)}
            >
              管理标签
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAdd}
              style={{
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                border: 'none'
              }}
            >
              新建创作记录
            </Button>
          </Space>
        </div>

        {filteredRecords.length === 0 ? (
          <EmptyState description="暂无创作记录，点击上方按钮开始记录您的创作历程">
            <Button type="primary" onClick={handleAdd}>创建第一条记录</Button>
          </EmptyState>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredRecords.map(record => (
              <Col xs={24} md={12} lg={8} key={record.id}>
                <Card
                  className="pottery-card"
                  cover={
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => viewRecordDetail(record)}>
                      <Image
                        src={record.coverImage}
                        alt={record.title}
                        height={200}
                        style={{ objectFit: 'cover' }}
                        preview={false}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        gap: 8
                      }}>
                        {getStatusTag(record.status)}
                      </div>
                      {isAdmin && (
                        <div style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12
                        }}>
                          <Space>
                            <Avatar size={16} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userId}`} />
                            <span>用户{record.userId}</span>
                          </Space>
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <span key="view" onClick={() => viewRecordDetail(record)}>
                      <EyeOutlined /> 查看
                    </span>,
                    (!isAdmin || record.userId === user?.id) && (
                      <span key="edit" onClick={() => handleEdit(record)}>
                        <EditOutlined /> 编辑
                      </span>
                    ),
                    (!isAdmin || record.userId === user?.id) && (
                      <Popconfirm
                        title="确定删除这条记录吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span key="delete">
                          <DeleteOutlined /> 删除
                        </span>
                      </Popconfirm>
                    )
                  ].filter(Boolean)}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{record.title}</span>
                        <Space style={{ fontSize: 12, color: '#999' }}>
                          <EyeOutlined /> {record.views || 0}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        <Paragraph style={{
                          margin: '8px 0',
                          color: '#666',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 44
                        }}>
                          {record.description}
                        </Paragraph>
                        <div style={{ marginBottom: 8 }}>
                          {record.tags?.map((tag, i) => (
                            <Tag key={i} color={getTagColor(tag)} style={{ marginBottom: 4 }}>{tag}</Tag>
                          ))}
                        </div>
                        <Space style={{ color: '#999', fontSize: 13 }}>
                          <span><CalendarOutlined style={{ marginRight: 4 }} />
                            {dayjs(record.createdAt).format('YYYY-MM-DD')}
                          </span>
                          <span>{record.process?.length || 0} 条记录</span>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title={editingRecord ? '编辑创作记录' : '新建创作记录'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'in_progress' }}
        >
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="title"
                label="作品名称"
                rules={[
                  validateRequired('请输入作品名称'),
                  { min: 2, max: 50, message: '名称长度应为2-50个字符' }
                ]}
              >
                <Input placeholder="请输入作品名称" maxLength={50} showCount />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="作品描述"
                rules={[
                  validateRequired('请输入作品描述'),
                  { min: 5, max: 500, message: '描述长度应为5-500个字符' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请描述这件作品的创作灵感、特点等"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="tags"
                label="标签"
                rules={[validateRequired('请至少选择一个标签')]}
              >
                <Select
                  mode="tags"
                  placeholder="输入标签后按回车，可自定义或选择已有标签"
                  tokenSeparators={[',']}
                  optionLabelProp="label"
                >
                  {tags.map(tag => (
                    <Option key={tag.id} value={tag.name} label={tag.name}>
                      <Tag color={tag.color}>{tag.name}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="创作状态"
                rules={[validateRequired('请选择状态')]}
              >
                <Select>
                  <Option value="in_progress">进行中</Option>
                  <Option value="completed">已完成</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="封面图片">
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传</div>
                  </div>
                </Upload>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  * 当前为模拟上传，实际使用时请配置真实上传接口
                </Text>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '保存修改' : '创建记录'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创作历程详情"
        open={isProcessModalOpen}
        onCancel={() => {
          setIsProcessModalOpen(false)
          setSelectedRecord(null)
        }}
        footer={null}
        width={900}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
        destroyOnClose
      >
        {selectedRecord && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Title level={3} style={{ margin: 0 }}>{selectedRecord.title}</Title>
                  {getStatusTag(selectedRecord.status)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <Space>
                    <Avatar size={20} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRecord.userId}`} />
                    <Text type="secondary">用户{selectedRecord.userId}</Text>
                  </Space>
                  <Space style={{ color: '#999' }}>
                    <CalendarOutlined /> {dayjs(selectedRecord.createdAt).format('YYYY-MM-DD')}
                  </Space>
                  <Space style={{ color: '#999' }}>
                    <EyeOutlined /> {selectedRecord.views || 0} 次浏览
                  </Space>
                </div>
                <Paragraph style={{ fontSize: 15, color: '#333', marginBottom: 12 }}>
                  {selectedRecord.description}
                </Paragraph>
                <div style={{ marginBottom: 16 }}>
                  {selectedRecord.tags?.map((tag, i) => (
                    <Tag key={i} color={getTagColor(tag)}>{tag}</Tag>
                  ))}
                </div>
              </div>
              <Image
                src={selectedRecord.coverImage}
                alt={selectedRecord.title}
                width={200}
                height={150}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            </div>

            {(!isAdmin || selectedRecord.userId === user?.id) && (
              <Alert
                message="创作过程记录"
                description="记录您的每一步创作历程，添加图片和文字描述"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {(!isAdmin || selectedRecord.userId === user?.id) && (
              <div style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
                <Title level={5} style={{ margin: '0 0 16px' }}>添加创作记录</Title>
                <Form
                  form={processForm}
                  layout="vertical"
                  onFinish={handleAddProcess}
                  size="small"
                >
                  <Row gutter={12}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        name="date"
                        label="日期"
                        rules={[validateRequired('请选择日期')]}
                        style={{ marginBottom: 8 }}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Form.Item
                        name="title"
                        label="步骤标题"
                        rules={[
                          validateRequired('请输入标题'),
                          { min: 2, max: 30, message: '标题长度应为2-30个字符' }
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <Input placeholder="如：第一次拉坯" maxLength={30} />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name="content"
                        label="记录内容"
                        rules={[
                          validateRequired('请输入内容'),
                          { min: 5, max: 500, message: '内容长度应为5-500个字符' }
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <TextArea rows={3} placeholder="记录今天的创作过程和心得..." maxLength={500} showCount />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="上传图片/视频" style={{ marginBottom: 8 }}>
                        <Upload
                          listType="picture-card"
                          maxCount={9}
                          beforeUpload={() => false}
                        >
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>上传</div>
                          </div>
                        </Upload>
                      </Form.Item>
                    </Col>
                    <Col xs={24} style={{ textAlign: 'right' }}>
                      <Button type="primary" htmlType="submit" size="small">
                        添加记录
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            )}

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Title level={5} style={{ margin: '0 0 16px' }}>
                <FireOutlined style={{ color: '#fa8c16' }} /> 创作历程
              </Title>
              {selectedRecord.process?.length > 0 ? (
                <Timeline
                  mode="left"
                  items={selectedRecord.process.map((step, index) => ({
                    color: index === selectedRecord.process.length - 1 ? '#8B4513' : 'gray',
                    label: <Text strong>{step.date}</Text>,
                    children: (
                      <div className="creation-record" style={{ marginBottom: 0 }}>
                        <Title level={5} style={{ margin: '0 0 8px' }}>{step.title}</Title>
                        <Paragraph style={{ margin: '0 0 12px', color: '#666' }}>
                          {step.content}
                        </Paragraph>
                        {step.images?.length > 0 && (
                          <Image.PreviewGroup>
                            <Space wrap>
                              {step.images.map((img, i) => (
                                <Image
                                  key={i}
                                  width={120}
                                  height={90}
                                  src={img}
                                  style={{ objectFit: 'cover', borderRadius: 4 }}
                                />
                              ))}
                            </Space>
                          </Image.PreviewGroup>
                        )}
                      </div>
                    )
                  }))}
                />
              ) : (
                <Empty
                  description={
                    (!isAdmin || selectedRecord.userId === user?.id)
                      ? "还没有创作过程记录，添加第一条记录吧"
                      : "暂无创作过程记录"
                  }
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      <TagManager
        open={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </div>
  )
}

export default Creation
