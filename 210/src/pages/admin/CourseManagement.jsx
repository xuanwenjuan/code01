import React, { useState } from 'react'
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Popconfirm,
  Avatar,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const CourseManagement = () => {
  const { courses } = useSelector((state) => state.course)
  const { learningRecords } = useSelector((state) => state.learning)
  const [searchText, setSearchText] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [form] = Form.useForm()

  const filteredCourses = courses.filter((course) => {
    const matchSearch = !searchText ||
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.toLowerCase())
    const matchCategory = categoryFilter === 'all' || course.category === categoryFilter
    return matchSearch && matchCategory
  })

  const columns = [
    {
      title: '课程封面',
      dataIndex: 'cover',
      key: 'cover',
      width: 100,
      render: (cover) => (
        <Avatar shape="square" size={60} src={cover} style={{ borderRadius: '6px' }} />
      ),
    },
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={4}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description.substring(0, 50)}...
          </Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text, record) => {
        const colors = {
          skill: '#52c41a',
          management: '#1890ff',
          compliance: '#fa8c16',
        }
        return <Tag color={colors[record.category]}>{text}</Tag>
      },
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: '难度',
      dataIndex: 'levelName',
      key: 'levelName',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      render: (minutes) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}小时${mins > 0 ? mins + '分' : ''}` : `${mins}分钟`
      },
    },
    {
      title: '学习人数',
      dataIndex: 'students',
      key: 'students',
      render: (count) => `${count}人`,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          <Text style={{ color: '#faad14' }}>★</Text>
          <Text>{rating}</Text>
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个课程吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleEdit = (course) => {
    setEditingCourse(course)
    form.setFieldsValue(course)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    message.success('删除成功（模拟操作）')
  }

  const handleAdd = () => {
    setEditingCourse(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingCourse) {
        message.success('课程更新成功')
      } else {
        message.success('课程创建成功')
      }
      setModalVisible(false)
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ marginBottom: '4px' }}>
            课程管理
          </Title>
          <Text type="secondary">管理平台所有课程</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增课程
        </Button>
      </div>

      <Card style={{ marginBottom: '16px' }}>
        <Space wrap size={16}>
          <Input
            placeholder="搜索课程名称、讲师"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部分类</Option>
            <Option value="skill">技能类</Option>
            <Option value="management">管理类</Option>
            <Option value="compliance">合规类</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredCourses}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingCourse ? '编辑课程' : '新增课程'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {editingCourse ? '保存' : '创建'}
          </Button>,
        ]}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="课程名称"
                rules={[{ required: true, message: '请输入课程名称' }]}
              >
                <Input placeholder="请输入课程名称" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="课程描述"
                rules={[{ required: true, message: '请输入课程描述' }]}
              >
                <Input.TextArea rows={3} placeholder="请输入课程描述" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="课程分类"
                rules={[{ required: true, message: '请选择课程分类' }]}
              >
                <Select placeholder="请选择课程分类">
                  <Option value="skill">技能类</Option>
                  <Option value="management">管理类</Option>
                  <Option value="compliance">合规类</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="难度等级"
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select placeholder="请选择难度等级">
                  <Option value="beginner">初级</Option>
                  <Option value="intermediate">中级</Option>
                  <Option value="advanced">高级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="instructor"
                label="讲师"
                rules={[{ required: true, message: '请输入讲师姓名' }]}
              >
                <Input placeholder="请输入讲师姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="课程时长（分钟）"
                rules={[{ required: true, message: '请输入课程时长' }]}
              >
                <Input type="number" placeholder="请输入课程时长" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default CourseManagement
