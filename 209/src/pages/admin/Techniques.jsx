import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  InputNumber,
  Card,
  Row,
  Col,
  Typography,
  Divider
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, ToolOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTechniques, fetchTools, fetchVideos } from '../../store/slices/techniquesSlice'
import { mockTechniques, mockTools, mockVideos } from '../../mock/data'
import Loading from '../../components/Loading'
import { validateRequired } from '../../utils/validators'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

const AdminTechniques = () => {
  const dispatch = useDispatch()
  const { techniques, tools, videos, loading } = useSelector(state => state.techniques)
  const [activeTab, setActiveTab] = useState('techniques')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [techniquesList, setTechniquesList] = useState(mockTechniques)
  const [toolsList, setToolsList] = useState(mockTools)
  const [videosList, setVideosList] = useState(mockVideos)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchTechniques())
    dispatch(fetchTools())
    dispatch(fetchVideos())
  }, [dispatch])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (activeTab === 'techniques') {
      setTechniquesList(techniquesList.filter(t => t.id !== id))
    } else if (activeTab === 'tools') {
      setToolsList(toolsList.filter(t => t.id !== id))
    } else {
      setVideosList(videosList.filter(v => v.id !== id))
    }
    message.success('删除成功')
  }

  const handleSubmit = (values) => {
    if (editingItem) {
      if (activeTab === 'techniques') {
        setTechniquesList(techniquesList.map(t =>
          t.id === editingItem.id ? { ...t, ...values } : t
        ))
      } else if (activeTab === 'tools') {
        setToolsList(toolsList.map(t =>
          t.id === editingItem.id ? { ...t, ...values } : t
        ))
      } else {
        setVideosList(videosList.map(v =>
          v.id === editingItem.id ? { ...v, ...values } : v
        ))
      }
      message.success('更新成功')
    } else {
      const newItem = {
        ...values,
        id: Date.now()
      }
      if (activeTab === 'techniques') {
        setTechniquesList([newItem, ...techniquesList])
      } else if (activeTab === 'tools') {
        setToolsList([newItem, ...toolsList])
      } else {
        setVideosList([newItem, ...videosList])
      }
      message.success('添加成功')
    }
    setIsModalOpen(false)
  }

  const techniqueColumns = [
    {
      title: '技法名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (d) => (
        <Tag color={d === '入门' ? 'green' : d === '中级' ? 'orange' : 'red'}>
          {d}
        </Tag>
      )
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个技法吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const toolColumns = [
    {
      title: '工具名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (c) => <Tag color="blue">{c}</Tag>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个工具吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const videoColumns = [
    {
      title: '视频标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '相关技法',
      dataIndex: 'technique',
      key: 'technique',
      render: (t) => <Tag color="purple">{t}</Tag>
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor'
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
      render: (l) => (
        <Tag color={l === '入门' ? 'green' : l === '进阶' ? 'blue' : 'orange'}>
          {l}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个视频吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (loading && techniques.length === 0) {
    return <Loading />
  }

  const getTitle = () => {
    if (activeTab === 'techniques') return '技法管理'
    if (activeTab === 'tools') return '工具管理'
    return '视频管理'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>📚 {getTitle()}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加
        </Button>
      </div>

      <Card
        tabList={[
          { key: 'techniques', label: (<span><BookOutlined /> 技法管理</span>) },
          { key: 'tools', label: (<span><ToolOutlined /> 工具管理</span>) },
          { key: 'videos', label: (<span><PlayCircleOutlined /> 视频管理</span>) }
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === 'techniques' && (
          <Table
            dataSource={techniquesList}
            columns={techniqueColumns}
            rowKey="id"
          />
        )}
        {activeTab === 'tools' && (
          <Table
            dataSource={toolsList}
            columns={toolColumns}
            rowKey="id"
          />
        )}
        {activeTab === 'videos' && (
          <Table
            dataSource={videosList}
            columns={videoColumns}
            rowKey="id"
          />
        )}
      </Card>

      <Modal
        title={editingItem ? `编辑${activeTab === 'techniques' ? '技法' : activeTab === 'tools' ? '工具' : '视频'}` : `添加${activeTab === 'techniques' ? '技法' : activeTab === 'tools' ? '工具' : '视频'}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {activeTab === 'techniques' && (
            <>
              <Form.Item name="name" label="技法名称" rules={[validateRequired()]}>
                <Input />
              </Form.Item>
              <Form.Item name="difficulty" label="难度" rules={[validateRequired()]}>
                <Select>
                  <Option value="入门">入门</Option>
                  <Option value="中级">中级</Option>
                  <Option value="高级">高级</Option>
                </Select>
              </Form.Item>
              <Form.Item name="duration" label="耗时" rules={[validateRequired()]}>
                <Input placeholder="如：2-3小时" />
              </Form.Item>
              <Form.Item name="description" label="描述" rules={[validateRequired()]}>
                <TextArea rows={4} />
              </Form.Item>
            </>
          )}

          {activeTab === 'tools' && (
            <>
              <Form.Item name="name" label="工具名称" rules={[validateRequired()]}>
                <Input />
              </Form.Item>
              <Form.Item name="category" label="分类" rules={[validateRequired()]}>
                <Select>
                  <Option value="成型工具">成型工具</Option>
                  <Option value="修整工具">修整工具</Option>
                  <Option value="装饰工具">装饰工具</Option>
                  <Option value="施釉工具">施釉工具</Option>
                  <Option value="辅助工具">辅助工具</Option>
                  <Option value="烧制设备">烧制设备</Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="描述" rules={[validateRequired()]}>
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item name="usage" label="使用方法" rules={[validateRequired()]}>
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          {activeTab === 'videos' && (
            <>
              <Form.Item name="title" label="视频标题" rules={[validateRequired()]}>
                <Input />
              </Form.Item>
              <Form.Item name="technique" label="相关技法" rules={[validateRequired()]}>
                <Input placeholder="如：拉坯" />
              </Form.Item>
              <Form.Item name="instructor" label="讲师" rules={[validateRequired()]}>
                <Input />
              </Form.Item>
              <Form.Item name="duration" label="时长" rules={[validateRequired()]}>
                <Input placeholder="如：15:30" />
              </Form.Item>
              <Form.Item name="level" label="难度等级" rules={[validateRequired()]}>
                <Select>
                  <Option value="入门">入门</Option>
                  <Option value="进阶">进阶</Option>
                  <Option value="高级">高级</Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="视频描述" rules={[validateRequired()]}>
                <TextArea rows={3} />
              </Form.Item>
            </>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? '保存修改' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminTechniques
