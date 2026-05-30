import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Layout, Menu, Card, Table, Button, Tag, Typography, Statistic, Row, Col, Avatar, List, Modal, Form, Input, InputNumber, Select, message, Space } from 'antd'
import { SettingOutlined, UserOutlined, ShoppingOutlined, TeamOutlined, BarChartOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { mockIncenses, categories } from '@/mock/incenses'
import { mockInheritors } from '@/mock/inheritors'
import { mockUsers } from '@/mock/users'
import './index.css'

const { Content, Sider } = Layout
const { Title, Text } = Typography
const { Option } = Select

const Admin = () => {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.user.currentUser)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [incenses, setIncenses] = useState(mockIncenses)
  const [users, setUsers] = useState(mockUsers)
  const [inheritors, setInheritors] = useState(mockInheritors)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingIncense, setEditingIncense] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: { pathname: '/admin' } } })
      return
    }
    if (currentUser.role !== 'admin') {
      message.error('您没有权限访问此页面')
      navigate('/')
    }
  }, [currentUser, navigate])

  if (!currentUser || currentUser.role !== 'admin') return null

  const menuItems = [
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      label: '数据概览'
    },
    {
      key: 'incenses',
      icon: <ShoppingOutlined />,
      label: '香品管理'
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理'
    },
    {
      key: 'inheritors',
      icon: <TeamOutlined />,
      label: '传承人管理'
    }
  ]

  const handleAddIncense = () => {
    setEditingIncense(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditIncense = (incense) => {
    setEditingIncense(incense)
    form.setFieldsValue(incense)
    setIsModalVisible(true)
  }

  const handleDeleteIncense = (id) => {
    Modal.confirm({
      title: '确定删除此香品吗？',
      content: '删除后无法恢复',
      onOk: () => {
        setIncenses(incenses.filter(i => i.id !== id))
        message.success('删除成功')
      }
    })
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingIncense) {
        setIncenses(incenses.map(i => i.id === editingIncense.id ? { ...i, ...values } : i))
        message.success('修改成功')
      } else {
        const newIncense = {
          ...values,
          id: Date.now(),
          coverImage: values.images?.[0] || 'https://picsum.photos/400/300',
          createTime: new Date().toISOString().split('T')[0]
        }
        setIncenses([newIncense, ...incenses])
        message.success('添加成功')
      }
      setIsModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const incenseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '香品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <img src={record.coverImage} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (text) => {
        const cat = categories.find(c => c.id === text)
        return <Tag color="blue">{cat ? cat.name : text}</Tag>
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Tag color={text === 'ancient' ? 'gold' : 'red'}>
          {text === 'ancient' ? '古法' : '新品'}
        </Tag>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span style={{ color: '#f5222d', fontWeight: 600 }}>¥{text}</span>
    },
    {
      title: '产地',
      dataIndex: 'origin',
      key: 'origin'
    },
    {
      title: '上架时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditIncense(record)}>编辑</Button>
          <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteIncense(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '用户',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text) => (
        <Tag color={text === 'admin' ? 'red' : 'blue'}>
          {text === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '收藏数',
      dataIndex: 'favorites',
      key: 'favorites',
      render: (text) => text?.length || 0
    },
    {
      title: '关注数',
      dataIndex: 'following',
      key: 'following',
      render: (text) => text?.length || 0
    }
  ]

  const inheritorColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '传承人',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size="small" />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '头衔',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Tag color="gold">{text}</Tag>
    },
    {
      title: '经验',
      dataIndex: 'experience',
      key: 'experience'
    },
    {
      title: '籍贯',
      dataIndex: 'origin',
      key: 'origin'
    }
  ]

  return (
    <div className="admin-page">
      <Layout className="admin-layout">
        <Sider width={220} className="admin-sider">
          <div className="admin-logo">
            <SettingOutlined />
            <span>管理后台</span>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            className="admin-menu"
            theme="dark"
          />
        </Sider>
        <Content className="admin-content">
          {selectedKey === 'dashboard' && (
            <div className="dashboard">
              <Title level={3}>数据概览</Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="香品总数"
                      value={incenses.length}
                      prefix={<ShoppingOutlined />}
                      valueStyle={{ color: '#d4af37' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="用户总数"
                      value={users.length}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="传承人"
                      value={inheritors.length}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Card>
                    <Statistic
                      title="总浏览量"
                      value={users.reduce((sum, u) => sum + (u.history?.length || 0), 0)}
                      prefix={<BarChartOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                  <Card title="最新香品">
                    <List
                      dataSource={incenses.slice(0, 5)}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<img src={item.coverImage} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />}
                            title={item.name}
                            description={`¥${item.price} · ${item.origin}`}
                          />
                          <Tag color={item.type === 'ancient' ? 'gold' : 'red'}>
                            {item.type === 'ancient' ? '古法' : '新品'}
                          </Tag>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="活跃用户">
                    <List
                      dataSource={users.slice(0, 5)}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={item.nickname}
                            description={`收藏 ${item.favorites?.length || 0} · 浏览 ${item.history?.length || 0}`}
                          />
                          <Tag color={item.role === 'admin' ? 'red' : 'blue'}>
                            {item.role === 'admin' ? '管理员' : '用户'}
                          </Tag>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {selectedKey === 'incenses' && (
            <Card
              title="香品管理"
              extra={
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddIncense}>
                  添加香品
                </Button>
              }
            >
              <Table
                columns={incenseColumns}
                dataSource={incenses}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {selectedKey === 'users' && (
            <Card title="用户管理">
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {selectedKey === 'inheritors' && (
            <Card title="传承人管理">
              <Table
                columns={inheritorColumns}
                dataSource={inheritors}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
        </Content>
      </Layout>

      <Modal
        title={editingIncense ? '编辑香品' : '添加香品'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="香品名称"
            rules={[{ required: true, message: '请输入香品名称' }]}
          >
            <Input placeholder="请输入香品名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="品类"
                rules={[{ required: true, message: '请选择品类' }]}
              >
                <Select placeholder="请选择品类">
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: '请选择类型' }]}
              >
                <Select placeholder="请选择类型">
                  <Option value="ancient">古法</Option>
                  <Option value="new">新品</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber placeholder="请输入价格" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="origin"
                label="产地"
                rules={[{ required: true, message: '请输入产地' }]}
              >
                <Input placeholder="请输入产地" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea placeholder="请输入描述" rows={3} />
          </Form.Item>
          <Form.Item
            name="usage"
            label="适用场景"
          >
            <Input placeholder="请输入适用场景" />
          </Form.Item>
          <Form.Item
            name="effect"
            label="功效"
          >
            <Input placeholder="请输入功效" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Admin
