import React, { useState } from 'react'
import {
  Table, Button, Space, Tag, Input, Select, Modal, Form,
  message, Popconfirm
} from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { pigments as initialPigments } from '@/mock'

const { Option } = Select

function AdminPigments() {
  const navigate = useNavigate()
  const [pigments, setPigments] = useState(initialPigments)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPigment, setEditingPigment] = useState(null)
  const [form] = Form.useForm()

  const filteredPigments = pigments.filter(p => {
    const matchSearch = p.name.includes(searchText) || p.chineseName.includes(searchText)
    const matchCategory = !categoryFilter || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  const handleEdit = (pigment) => {
    setEditingPigment(pigment)
    form.setFieldsValue(pigment)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setPigments(pigments.filter(p => p.id !== id))
    message.success('删除成功')
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingPigment) {
        setPigments(pigments.map(p => p.id === editingPigment.id ? { ...p, ...values } : p))
        message.success('更新成功')
      } else {
        const newPigment = {
          ...values,
          id: Math.max(...pigments.map(p => p.id)) + 1,
          createTime: new Date().toISOString().split('T')[0]
        }
        setPigments([...pigments, newPigment])
        message.success('添加成功')
      }
      setIsModalOpen(false)
      setEditingPigment(null)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 80,
      render: (color, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              backgroundColor: color
            }}
          />
          <span>{color}</span>
        </div>
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <span style={{ fontWeight: 600 }}>{text}</span>
          <span style={{ color: '#999' }}>({record.chineseName})</span>
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => (
        <Tag color={category === 'natural' ? 'green' : 'orange'}>
          {category === 'natural' ? '天然矿物' : '古法调配'}
        </Tag>
      )
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => a.views - b.views
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      width: 80,
      sorter: (a, b) => a.likes - b.likes
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/pigment/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个颜料吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Space size="middle">
          <Input
            placeholder="搜索颜料名称"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="分类筛选"
            style={{ width: 150 }}
            value={categoryFilter || undefined}
            onChange={setCategoryFilter}
            allowClear
          >
            <Option value="natural">天然矿物</Option>
            <Option value="compound">古法调配</Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPigment(null)
            form.resetFields()
            setIsModalOpen(true)
          }}
        >
          添加颜料
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPigments}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingPigment ? '编辑颜料' : '添加颜料'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingPigment(null)
          form.resetFields()
        }}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: 'natural' }}
        >
          <Form.Item
            name="name"
            label="颜料名称"
            rules={[{ required: true, message: '请输入颜料名称' }]}
          >
            <Input placeholder="如：石青" />
          </Form.Item>
          <Form.Item
            name="chineseName"
            label="中文名称"
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input placeholder="如：石青" />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              <Option value="natural">天然矿物颜料</Option>
              <Option value="compound">古法调配颜料</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="color"
            label="颜色值"
            rules={[{ required: true, message: '请输入颜色值' }]}
          >
            <Input placeholder="如：#1E90FF" />
          </Form.Item>
          <Form.Item
            name="colorName"
            label="颜色名称"
            rules={[{ required: true, message: '请输入颜色名称' }]}
          >
            <Input placeholder="如：蓝色" />
          </Form.Item>
          <Form.Item
            name="origin"
            label="产地"
            rules={[{ required: true, message: '请输入产地' }]}
          >
            <Input placeholder="如：云南昆明" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea rows={3} placeholder="颜料描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AdminPigments
