import { useState } from 'react'
import { Row, Col, Typography, Card, Table, Button, Tag, Tabs, Statistic, Avatar, Modal, Form, Input, Select, message } from 'antd'
import {
  UserOutlined,
  BookOutlined,
  PictureOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { mockUsers, mockTypes, mockWorks, mockArtisans } from '@/mock'

const { Title } = Typography
const { Option } = Select

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState(mockUsers)
  const [types, setTypes] = useState(mockTypes)
  const [works, setWorks] = useState(mockWorks)
  const [artisans, setArtisans] = useState(mockArtisans)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const stats = [
    { title: '用户总数', value: users.length, icon: <UserOutlined />, color: '#1890ff' },
    { title: '活字品类', value: types.length, icon: <BookOutlined />, color: '#52c41a' },
    { title: '作品数量', value: works.length, icon: <PictureOutlined />, color: '#fa8c16' },
    { title: '传承人数', value: artisans.length, icon: <TeamOutlined />, color: '#eb2f96' }
  ]

  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: role => (
      <Tag color={role === 'admin' ? 'red' : 'blue'}>{role === 'admin' ? '管理员' : '研究者'}</Tag>
    )},
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="small" icon={<EditOutlined />} onClick={() => openModal('user', record)}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete('user', record.id)}>删除</Button>
      </div>
    )}
  ]

  const typeColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category', render: cat => <Tag color="blue">{cat}</Tag> },
    { title: '年代', dataIndex: 'era', key: 'era' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    { title: '浏览量', dataIndex: 'views', key: 'views' },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="small" icon={<EyeOutlined />}>查看</Button>
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </div>
    )}
  ]

  const workColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '作品名称', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: 'type', key: 'type', render: t => <Tag color="green">{t}</Tag> },
    { title: '传承人', dataIndex: 'artisan', key: 'artisan' },
    { title: '年代', dataIndex: 'year', key: 'year' },
    { title: '浏览量', dataIndex: 'views', key: 'views' },
    { title: '操作', key: 'action', render: () => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="small" icon={<EyeOutlined />}>查看</Button>
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </div>
    )}
  ]

  const artisanColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '头衔', dataIndex: 'title', key: 'title', render: t => <Tag color="gold">{t}</Tag> },
    { title: '地区', dataIndex: 'region', key: 'region' },
    { title: '从业年限', dataIndex: 'experience', key: 'experience', render: e => `${e}年` },
    { title: '浏览量', dataIndex: 'views', key: 'views' },
    { title: '操作', key: 'action', render: () => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="small" icon={<EyeOutlined />}>查看</Button>
        <Button size="small" icon={<EditOutlined />}>编辑</Button>
        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
      </div>
    )}
  ]

  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      form.setFieldsValue(item)
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const handleDelete = (type, id) => {
    if (type === 'user') {
      setUsers(users.filter(u => u.id !== id))
    }
    message.success('删除成功')
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingItem) {
        if (modalType === 'user') {
          setUsers(users.map(u => u.id === editingItem.id ? { ...u, ...values } : u))
        }
        message.success('更新成功')
      } else {
        if (modalType === 'user') {
          const newUser = {
            ...values,
            id: Date.now(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
            createdAt: new Date().toISOString().split('T')[0]
          }
          setUsers([...users, newUser])
        }
        message.success('添加成功')
      }
      setModalVisible(false)
    })
  }

  const tabItems = [
    {
      key: 'dashboard',
      label: '数据概览',
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            {stats.map((stat, index) => (
              <Col key={index} xs={12} sm={6}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Statistic title={stat.title} value={stat.value} />
                    <div style={{ fontSize: '32px', color: stat.color }}>{stat.icon}</div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          <Card title="最近用户">
            <Table
              dataSource={users.slice(0, 5)}
              columns={userColumns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </>
      )
    },
    {
      key: 'users',
      label: '用户管理',
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('user')}>
              添加用户
            </Button>
          }
        >
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'types',
      label: '活字管理',
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              添加活字
            </Button>
          }
        >
          <Table
            dataSource={types}
            columns={typeColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'works',
      label: '作品管理',
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              添加作品
            </Button>
          }
        >
          <Table
            dataSource={works}
            columns={workColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'artisans',
      label: '传承人管理',
      children: (
        <Card
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              添加传承人
            </Button>
          }
        >
          <Table
            dataSource={artisans}
            columns={artisanColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>管理后台</Title>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      <Modal
        title={`${editingItem ? '编辑' : '添加'}${modalType === 'user' ? '用户' : ''}`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {modalType === 'user' && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="role" label="角色" rules={[{ required: true }]}>
                <Select>
                  <Option value="admin">管理员</Option>
                  <Option value="researcher">研究者</Option>
                </Select>
              </Form.Item>
              {!editingItem && (
                <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                  <Input.Password />
                </Form.Item>
              )}
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default Admin
