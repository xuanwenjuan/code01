import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Layout,
  Menu,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Tag,
  InputNumber,
  Statistic,
  Row,
  Col,
  Card
} from 'antd'
import {
  AppstoreOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DashboardOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { addHeritage, updateHeritage, deleteHeritage } from '../store/slices/heritageSlice'

const { Sider, Content } = Layout

const Admin = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const { heritages, categories } = useSelector(state => state.heritage)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    } else if (currentUser.role !== 'admin') {
      message.warning('您没有管理员权限')
      navigate('/')
    }
  }, [currentUser, navigate])

  if (!currentUser || currentUser.role !== 'admin') {
    return null
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    dispatch(deleteHeritage(id))
    message.success('删除成功')
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingItem) {
        dispatch(updateHeritage({ id: editingItem.id, data: values }))
        message.success('更新成功')
      } else {
        const categoryInfo = categories.find(c => c.id === values.category)
        dispatch(addHeritage({
          ...values,
          categoryName: categoryInfo?.name || '未分类'
        }))
        message.success('添加成功')
      }
      setModalVisible(false)
    })
  }

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '数据概览' },
    { key: 'heritages', icon: <AppstoreOutlined />, label: '非遗项目管理' },
    { key: 'users', icon: <UserOutlined />, label: '用户管理' }
  ]

  const columns = [
    {
      title: '封面',
      dataIndex: 'cover',
      width: 80,
      render: (cover) => (
        <img src={cover} alt="" style={{ width: 50, height: 40, objectFit: 'cover', borderRadius: 4 }} />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/heritage/${record.id}`)} style={{ color: '#333' }}>
          {text}
        </a>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: (text) => (
        <Tag color={text === '世界级' ? 'red' : 'green'}>{text}</Tag>
      )
    },
    {
      title: '濒危',
      dataIndex: 'isEndangered',
      key: 'isEndangered',
      render: (text) => text ? <Tag color="warning">是</Tag> : '否'
    },
    {
      title: '热门',
      dataIndex: 'isHot',
      key: 'isHot',
      render: (text) => text ? <Tag color="orange">是</Tag> : '否'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => a.views - b.views
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
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

  const stats = [
    { title: '非遗项目总数', value: heritages.length, color: '#d4380d' },
    { title: '世界级非遗', value: heritages.filter(h => h.level === '世界级').length, color: '#1890ff' },
    { title: '濒危非遗', value: heritages.filter(h => h.isEndangered).length, color: '#fa8c16' },
    { title: '总浏览量', value: heritages.reduce((sum, h) => sum + h.views, 0), color: '#52c41a' }
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div>
            <h2 style={{ marginBottom: 24 }}>数据概览</h2>
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
              {stats.map((stat, index) => (
                <Col xs={12} md={6} key={index}>
                  <Card>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <Card title="最近添加">
              <Table
                dataSource={[...heritages].reverse().slice(0, 5)}
                columns={columns.slice(0, 6)}
                pagination={false}
                rowKey="id"
              />
            </Card>
          </div>
        )

      case 'heritages':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>非遗项目管理</h2>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加非遗项目
              </Button>
            </div>
            <Table
              dataSource={heritages}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条数据`
              }}
            />
          </div>
        )

      case 'users':
        return (
          <div>
            <h2 style={{ marginBottom: 20 }}>用户管理</h2>
            <Table
              dataSource={[
                { id: 1, name: '系统管理员', username: 'admin', role: 'admin', email: 'admin@heritage.com' },
                { id: 2, name: '文化爱好者', username: 'user', role: 'user', email: 'user@heritage.com' }
              ]}
              columns={[
                { title: '用户名', dataIndex: 'username', key: 'username' },
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '角色', dataIndex: 'role', key: 'role', render: (r) => r === 'admin' ? <Tag color="red">管理员</Tag> : <Tag color="blue">普通用户</Tag> },
                { title: '邮箱', dataIndex: 'email', key: 'email' }
              ]}
              rowKey="id"
            />
          </div>
        )

      default:
        return null
    }
  }

  const categoryOptions = categories
    .filter(c => c.id !== 'all')
    .map(c => ({ label: c.name, value: c.id }))

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={220} style={{ background: 'white' }}>
        <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#d4380d' }}>🏛️ 管理后台</h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={({ key }) => setActiveMenu(key)}
          items={menuItems}
          style={{ borderRight: 'none', paddingTop: 16 }}
        />
      </Sider>
      <Layout style={{ padding: 24 }}>
        <Content style={{ background: 'white', padding: 24, borderRadius: 8 }}>
          {renderContent()}
        </Content>
      </Layout>

      <Modal
        title={editingItem ? '编辑非遗项目' : '添加非遗项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            level: '国家级',
            isEndangered: false,
            isHot: false
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="非遗名称"
                rules={[{ required: true, message: '请输入非遗名称' }]}
              >
                <Input placeholder="请输入非遗名称" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select options={categoryOptions} placeholder="请选择分类" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="level"
                label="级别"
                rules={[{ required: true, message: '请选择级别' }]}
              >
                <Select
                  options={[
                    { label: '世界级', value: '世界级' },
                    { label: '国家级', value: '国家级' },
                    { label: '省级', value: '省级' }
                  ]}
                  placeholder="请选择级别"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="origin"
                label="发源地"
                rules={[{ required: true, message: '请输入发源地' }]}
              >
                <Input placeholder="请输入发源地" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="cover"
            label="封面图片"
            rules={[{ required: true, message: '请输入封面图片URL' }]}
          >
            <Input placeholder="请输入封面图片URL" />
          </Form.Item>
          <Form.Item
            name="description"
            label="简介"
            rules={[{ required: true, message: '请输入简介' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入简介" maxLength={200} showCount />
          </Form.Item>
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="heritageTime"
                label="产生年代"
                rules={[{ required: true, message: '请输入产生年代' }]}
              >
                <Input placeholder="如：唐代" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="isEndangered" label="是否濒危" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="isHot" label="是否热门" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  )
}

export default Admin
