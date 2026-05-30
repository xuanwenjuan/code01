import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  message,
  Popconfirm,
  Image,
  Upload
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWorks } from '../../store/slices/worksSlice'
import { mockWorks } from '../../mock/data'
import Loading from '../../components/Loading'
import { validateRequired, getCategoryLabel } from '../../utils/validators'

const { TextArea } = Input
const { Option } = Select

const AdminWorks = () => {
  const dispatch = useDispatch()
  const { works, loading } = useSelector(state => state.works)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWork, setEditingWork] = useState(null)
  const [worksList, setWorksList] = useState(mockWorks)
  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchWorks())
  }, [dispatch])

  const handleAdd = () => {
    setEditingWork(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (work) => {
    setEditingWork(work)
    form.setFieldsValue(work)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setWorksList(worksList.filter(w => w.id !== id))
    message.success('删除成功')
  }

  const handleSubmit = (values) => {
    if (editingWork) {
      setWorksList(worksList.map(w =>
        w.id === editingWork.id ? { ...w, ...values } : w
      ))
      message.success('更新成功')
    } else {
      const newWork = {
        ...values,
        id: Date.now(),
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop',
        views: 0,
        likes: 0
      }
      setWorksList([newWork, ...worksList])
      message.success('添加成功')
    }
    setIsModalOpen(false)
  }

  const columns = [
    {
      title: '封面',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image) => (
        <Image src={image} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
      )
    },
    {
      title: '作品名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag className={`pottery-tag ${category === 'qimin' ? 'tag-qimin' : category === 'baijian' ? 'tag-baijian' : 'tag-wenchuang'}`}>
          {getCategoryLabel(category)}
        </Tag>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '窑口',
      dataIndex: 'kiln',
      key: 'kiln'
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price?.toLocaleString()}`
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views'
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个作品吗？"
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

  if (loading && works.length === 0) {
    return <Loading />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>🏺 作品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加作品
        </Button>
      </div>

      <Table
        dataSource={worksList}
        columns={columns}
        rowKey="id"
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingWork ? '编辑作品' : '添加作品'}
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
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="title"
              label="作品名称"
              rules={[validateRequired('请输入作品名称')]}
            >
              <Input placeholder="请输入作品名称" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[validateRequired('请选择分类')]}
            >
              <Select>
                <Option value="qimin">器皿类</Option>
                <Option value="baijian">摆件类</Option>
                <Option value="wenchuang">文创类</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="author"
              label="作者"
              rules={[validateRequired('请输入作者')]}
            >
              <Input placeholder="请输入作者" />
            </Form.Item>

            <Form.Item
              name="kiln"
              label="窑口"
              rules={[validateRequired('请输入窑口')]}
            >
              <Input placeholder="如：景德镇窑" />
            </Form.Item>

            <Form.Item
              name="year"
              label="年份"
              rules={[validateRequired('请输入年份')]}
            >
              <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="price"
              label="价格（元）"
              rules={[validateRequired('请输入价格')]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="作品描述"
            rules={[validateRequired('请输入作品描述')]}
          >
            <TextArea rows={4} placeholder="请输入作品描述" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            rules={[validateRequired('请输入标签')]}
          >
            <Select
              mode="tags"
              placeholder="输入标签后按回车"
              tokenSeparators={[',']}
            />
          </Form.Item>

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
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingWork ? '保存修改' : '添加作品'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminWorks
