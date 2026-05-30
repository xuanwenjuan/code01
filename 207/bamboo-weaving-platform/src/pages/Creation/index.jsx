import React, { useState, useEffect } from 'react'
import { 
  Form, Input, Select, Upload, Button, Card, Typography, 
  Space, message, Tabs, List, Image, Modal, Row, Col, 
  Statistic, Tag, Tooltip, Popconfirm, Empty, Alert
} from 'antd'
import { 
  PlusOutlined, UploadOutlined, DeleteOutlined, 
  EditOutlined, SaveOutlined, EyeOutlined, HeartOutlined,
  ExclamationCircleOutlined, PlusCircleOutlined, CloseCircleOutlined,
  CheckOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  addWork, fetchWorks, deleteWork, 
  addCustomTag, deleteCustomTag, incrementViews 
} from '@/store/slices/worksSlice'
import { mockCategories } from '@/mock/data'
import StatusHandler from '@/components/StatusHandler'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const Creation = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [form] = Form.useForm()
  const [stepForm] = Form.useForm()
  const [tagForm] = Form.useForm()
  
  const [creationSteps, setCreationSteps] = useState([])
  const [stepModalVisible, setStepModalVisible] = useState(false)
  const [tagModalVisible, setTagModalVisible] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [fileList, setFileList] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('create')
  
  const { currentUser } = useSelector(state => state.user)
  const { works, customTags, status, error } = useSelector(state => state.works)

  useEffect(() => {
    if (!currentUser) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    dispatch(fetchWorks())
  }, [dispatch, currentUser, navigate])

  const isAdmin = currentUser?.role === 'admin'
  const myWorks = isAdmin ? works : works.filter(w => w.authorId === currentUser?.id)
  const approvedWorks = myWorks.filter(w => w.status === 'approved')
  const pendingWorks = myWorks.filter(w => w.status === 'pending')
  const totalViews = myWorks.reduce((sum, w) => sum + w.views, 0)
  const totalLikes = myWorks.reduce((sum, w) => sum + w.likes, 0)

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('❌ 只能上传图片文件！')
      return Upload.LIST_IGNORE
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('❌ 图片大小不能超过5MB！')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
    if (newFileList.length > 0) {
      form.setFieldsValue({ images: newFileList })
    }
  }

  const handlePreview = (file) => {
    setPreviewImage(file.url || file.preview)
    setPreviewVisible(true)
  }

  const handleStepImageUpload = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const file = newFileList[0]
      if (file.originFileObj) {
        stepForm.setFieldsValue({ 
          imageFile: file.originFileObj,
          imagePreview: URL.createObjectURL(file.originFileObj)
        })
      }
    }
  }

  const handleAddStep = () => {
    setEditingStep(null)
    stepForm.resetFields()
    setStepModalVisible(true)
  }

  const handleEditStep = (step) => {
    setEditingStep(step)
    stepForm.setFieldsValue({
      title: step.title,
      description: step.description,
      imagePreview: step.image
    })
    setStepModalVisible(true)
  }

  const handleDeleteStep = (stepId) => {
    const newSteps = creationSteps.filter(s => s.step !== stepId)
    const reindexedSteps = newSteps.map((s, index) => ({ ...s, step: index + 1 }))
    setCreationSteps(reindexedSteps)
    message.success('✅ 步骤删除成功')
  }

  const handleSaveStep = () => {
    stepForm.validateFields().then(values => {
      let imageUrl = values.imagePreview || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300&h=200&fit=crop'
      if (values.imageFile) {
        imageUrl = URL.createObjectURL(values.imageFile)
      }

      const stepData = {
        step: editingStep ? editingStep.step : creationSteps.length + 1,
        title: values.title,
        description: values.description,
        image: imageUrl
      }
      
      if (editingStep) {
        setCreationSteps(creationSteps.map(s => 
          s.step === editingStep.step ? stepData : s
        ))
        message.success('✅ 步骤更新成功')
      } else {
        setCreationSteps([...creationSteps, stepData])
        message.success('✅ 步骤添加成功')
      }
      
      setStepModalVisible(false)
    }).catch(() => {
      message.error('❌ 请填写完整的步骤信息')
    })
  }

  const handleAddTag = () => {
    tagForm.validateFields().then(values => {
      const tagName = values.tagName.trim()
      if (customTags.includes(tagName)) {
        message.warning('⚠️ 该标签已存在')
        return
      }
      dispatch(addCustomTag(tagName))
      message.success('✅ 标签添加成功')
      tagForm.resetFields()
    }).catch(() => {
      message.error('❌ 请输入有效的标签名称')
    })
  }

  const handleDeleteTag = (tagName) => {
    Modal.confirm({
      title: '确认删除标签',
      content: `确定要删除标签"${tagName}"吗？`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteCustomTag(tagName))
        message.success('✅ 标签删除成功')
      }
    })
  }

  const handleViewWork = (workId) => {
    dispatch(incrementViews(workId))
    navigate(`/works/${workId}`)
  }

  const handleDeleteWork = (workId) => {
    Modal.confirm({
      title: '确认删除作品',
      content: '删除后无法恢复，确定要删除该作品吗？',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        dispatch(deleteWork(workId)).then(() => {
          message.success('✅ 作品删除成功')
        })
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (fileList.length === 0) {
        message.error('❌ 请至少上传一张作品图片')
        return
      }

      const imageUrls = fileList.map(file => 
        file.url || 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=400&h=300&fit=crop'
      )
      
      const workData = {
        title: values.title,
        category: values.category,
        author: currentUser.nickname,
        authorId: currentUser.id,
        description: values.description,
        images: imageUrls,
        tags: values.tags,
        difficulty: values.difficulty,
        creationProcess: creationSteps.sort((a, b) => a.step - b.step)
      }

      await dispatch(addWork(workData)).unwrap()
      message.success('✅ 作品上传成功，等待审核')
      form.resetFields()
      setCreationSteps([])
      setFileList([])
      setActiveTab('myworks')
    } catch (error) {
      if (error.errorFields) {
        const firstError = error.errorFields[0]
        message.error(`❌ ${firstError.errors[0]}`)
      } else {
        message.error('❌ 上传失败，请重试')
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = { approved: 'green', pending: 'orange', rejected: 'red' }
    return colors[status] || 'default'
  }

  const getStatusText = (status) => {
    const texts = { approved: '已通过', pending: '审核中', rejected: '已拒绝' }
    return texts[status] || status
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  )

  const validateTagName = (_, value) => {
    if (!value || !value.trim()) {
      return Promise.reject(new Error('请输入标签名称'))
    }
    if (value.trim().length < 2 || value.trim().length > 10) {
      return Promise.reject(new Error('标签长度需在2-10个字符之间'))
    }
    const specialChars = /[!@#$%^&*()+=<>?/:;"'`~{}[\]\\|]/.test(value)
    if (specialChars) {
      return Promise.reject(new Error('标签名称不能包含特殊字符'))
    }
    return Promise.resolve()
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        {isAdmin ? '作品管理' : '作品创作'}
      </Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="📝 上传新作品" key="create">
          {error && (
            <Alert
              message="操作异常"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Card>
            <Form
              form={form}
              layout="vertical"
              size="large"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="title"
                    label="作品名称"
                    rules={[
                      { required: true, message: '请输入作品名称' },
                      { min: 2, max: 50, message: '作品名称长度需在2-50个字符之间' },
                      { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_\s]+$/, message: '作品名称只能包含中文、字母、数字、空格和下划线' }
                    ]}
                  >
                    <Input placeholder="请输入作品名称" maxLength={50} showCount />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label="作品品类"
                    rules={[{ required: true, message: '请选择作品品类' }]}
                  >
                    <Select placeholder="请选择作品品类">
                      {mockCategories.map(cat => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="difficulty"
                    label="难度等级"
                    rules={[{ required: true, message: '请选择难度等级' }]}
                  >
                    <Select placeholder="请选择难度等级">
                      <Option value="初级">🌱 初级</Option>
                      <Option value="中级">🌿 中级</Option>
                      <Option value="高级">🎋 高级</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="tags"
                    label={
                      <Space>
                        作品标签
                        <Button 
                          type="link" 
                          size="small" 
                          icon={<PlusCircleOutlined />}
                          onClick={() => setTagModalVisible(true)}
                        >
                          管理标签
                        </Button>
                      </Space>
                    }
                    rules={[{ required: true, message: '请选择至少一个标签' }]}
                  >
                    <Select
                      mode="tags"
                      placeholder="选择或输入标签（最多5个）"
                      tokenSeparators={[',']}
                      maxTagCount={5}
                    >
                      {customTags.map(tag => (
                        <Option key={tag} value={tag}>{tag}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="作品描述"
                rules={[
                  { required: true, message: '请输入作品描述' },
                  { min: 10, max: 500, message: '描述长度需在10-500个字符之间' }
                ]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="请详细描述你的作品，包括创作灵感、技法特点等..." 
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    作品图片
                    <Text type="secondary" style={{ fontSize: 12 }}>（最多5张，支持预览和删除）</Text>
                  </Space>
                }
                required
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={beforeUpload}
                  onChange={handleUploadChange}
                  onPreview={handlePreview}
                  maxCount={5}
                  accept="image/*"
                >
                  {fileList.length >= 5 ? null : uploadButton}
                </Upload>
              </Form.Item>

              <Card 
                title={
                  <Space>
                    创作过程记录
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>（图文记录你的创作过程）</Text>
                  </Space>
                }
                extra={
                  <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddStep}>
                    添加步骤
                  </Button>
                }
                style={{ marginBottom: 24 }}
              >
                {creationSteps.length === 0 ? (
                  <Empty 
                    description="暂无创作步骤，点击上方按钮添加" 
                    style={{ padding: '40px 0' }}
                  />
                ) : (
                  <List
                    dataSource={creationSteps.sort((a, b) => a.step - b.step)}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Tooltip key="edit" title="编辑">
                            <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStep(item)} />
                          </Tooltip>,
                          <Tooltip key="delete" title="删除">
                            <Popconfirm
                              title="确认删除该步骤？"
                              onConfirm={() => handleDeleteStep(item.step)}
                              okText="删除"
                              cancelText="取消"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="link" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </Tooltip>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{ 
                              width: 40, height: 40, 
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', 
                              color: 'white', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontWeight: 'bold' 
                            }}>
                              {item.step}
                            </div>
                          }
                          title={<Text strong>{item.title}</Text>}
                          description={
                            <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
                              {item.description}
                            </Paragraph>
                          }
                        />
                        {item.image && (
                          <Image 
                            src={item.image} 
                            width={80} 
                            height={60} 
                            style={{ borderRadius: 4, objectFit: 'cover' }}
                          />
                        )}
                      </List.Item>
                    )}
                  />
                )}
              </Card>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<SaveOutlined />} 
                    onClick={handleSubmit} 
                    loading={status === 'loading'}
                  >
                    提交审核
                  </Button>
                  <Button 
                    size="large" 
                    onClick={() => {
                      form.resetFields()
                      setCreationSteps([])
                      setFileList([])
                    }}
                  >
                    重置表单
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={`📚 ${isAdmin ? '全部作品集' : '我的作品集'} (${myWorks.length})`} key="myworks">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic 
                  title="作品总数" 
                  value={myWorks.length} 
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<EyeOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic 
                  title="已通过" 
                  value={approvedWorks.length} 
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic 
                  title="审核中" 
                  value={pendingWorks.length} 
                  valueStyle={{ color: '#faad14' }}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic 
                  title="总浏览量" 
                  value={totalViews} 
                  valueStyle={{ color: '#722ed1' }}
                  prefix={<EyeOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <StatusHandler 
            status={status} 
            error={error} 
            data={myWorks} 
            emptyText={isAdmin ? '暂无作品' : '暂无作品，快去上传你的第一个作品吧！'}
          >
            <Row gutter={[16, 16]}>
              {myWorks.map(work => (
                <Col xs={24} sm={12} lg={6} key={work.id}>
                  <Card
                    hoverable
                    className="card-hover"
                    cover={
                      <div style={{ position: 'relative' }}>
                        <img 
                          alt={work.title} 
                          src={work.images[0]} 
                          style={{ height: 150, objectFit: 'cover' }} 
                        />
                        {isAdmin && work.authorId !== currentUser?.id && (
                          <Tag 
                            color="blue" 
                            style={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            {work.author}
                          </Tag>
                        )}
                      </div>
                    }
                    actions={[
                      <Tooltip key="view" title="查看详情">
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />} 
                          onClick={() => handleViewWork(work.id)}
                        >
                          查看
                        </Button>
                      </Tooltip>,
                      <Tooltip key="stats" title={`浏览${work.views} / 点赞${work.likes}`}>
                        <span style={{ color: '#999', fontSize: 12 }}>
                          👁 {work.views} ❤️ {work.likes}
                        </span>
                      </Tooltip>,
                      <Tooltip key="delete" title="删除">
                        <Popconfirm
                          title="确认删除该作品？"
                          onConfirm={() => handleDeleteWork(work.id)}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button type="link" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Tooltip>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Text ellipsis style={{ fontWeight: 500 }}>
                          {work.title}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space wrap size={4}>
                            {work.tags.slice(0, 3).map(tag => (
                              <Tag key={tag} color="green" style={{ margin: 0 }}>
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                            <Tag color={getStatusColor(work.status)} style={{ margin: 0 }}>
                              {getStatusText(work.status)}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {work.createTime}
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </StatusHandler>
        </TabPane>
      </Tabs>

      <Modal
        title={editingStep ? '✏️ 编辑创作步骤' : '➕ 添加创作步骤'}
        open={stepModalVisible}
        onOk={handleSaveStep}
        onCancel={() => setStepModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={stepForm} layout="vertical">
          <Form.Item
            name="title"
            label="步骤标题"
            rules={[
              { required: true, message: '请输入步骤标题' },
              { min: 2, max: 30, message: '标题长度需在2-30个字符之间' }
            ]}
          >
            <Input placeholder="例如：选材准备" maxLength={30} />
          </Form.Item>
          <Form.Item
            name="description"
            label="步骤描述"
            rules={[
              { required: true, message: '请输入步骤描述' },
              { min: 10, max: 300, message: '描述长度需在10-300个字符之间' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="详细描述这一步的操作要点..." 
              maxLength={300}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="步骤图片（可选）"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                listType="picture"
                beforeUpload={beforeUpload}
                onChange={handleStepImageUpload}
                maxCount={1}
                accept="image/*"
                fileList={stepForm.getFieldValue('imagePreview') ? [
                  {
                    uid: '-1',
                    name: 'preview',
                    status: 'done',
                    url: stepForm.getFieldValue('imagePreview')
                  }
                ] : []}
              >
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              {stepForm.getFieldValue('imagePreview') && (
                <Image 
                  src={stepForm.getFieldValue('imagePreview')} 
                  width={120} 
                  height={90}
                  style={{ borderRadius: 4, objectFit: 'cover' }}
                />
              )}
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="🏷️ 标签管理"
        open={tagModalVisible}
        onCancel={() => setTagModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small" title="添加新标签">
            <Form form={tagForm} layout="inline">
              <Form.Item
                name="tagName"
                rules={[{ validator: validateTagName }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="输入标签名称（2-10个字符）" maxLength={10} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
                  添加
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card size="small" title={`现有标签 (${customTags.length})`}>
            {customTags.length === 0 ? (
              <Empty description="暂无标签" style={{ padding: '20px 0' }} />
            ) : (
              <Space wrap size={[8, 8]}>
                {customTags.map(tag => (
                  <Tag
                    key={tag}
                    color="green"
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      handleDeleteTag(tag)
                    }}
                    style={{ fontSize: 14, padding: '4px 12px' }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
            )}
          </Card>
        </Space>
      </Modal>

      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage && (
          <img 
            src={previewImage} 
            alt="预览" 
            style={{ width: '100%', height: 'auto' }} 
          />
        )}
      </Modal>
    </div>
  )
}

export default Creation
