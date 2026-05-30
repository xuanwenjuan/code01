import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Descriptions
} from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BarChartOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import { allMortises } from '@/mock/mortises'
import { users, designers } from '@/mock/users'

const { Option } = Select

const Admin = () => {
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const userList = Object.values(users).filter(u => u.role !== 'admin')
  const designerList = designers

  const handleEdit = (record, type) => {
    setEditingItem({ ...record, type })
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleAdd = (type) => {
    setEditingItem({ type })
    form.resetFields()
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    message.success('删除成功')
  }

  const handleModalOk = async () => {
    try {
      await form.validateFields()
      message.success(editingItem?.id ? '更新成功' : '创建成功')
      setModalVisible(false)
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  const statistics = [
    { title: '榫卯设计总数', value: allMortises.length, icon: <AppstoreOutlined />, color: '#1890ff' },
    { title: '注册用户数', value: userList.length, icon: <UserOutlined />, color: '#52c41a' },
    { title: '设计师数量', value: designerList.length, icon: <UserAddOutlined />, color: '#722ed1' },
    { title: '总浏览量', value: '125.6K', icon: <EyeOutlined />, color: '#faad14' }
  ]

  const mortiseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const colors = {
          classic: 'gold',
          innovative: 'blue',
          furniture: 'green',
          architecture: 'purple',
          decoration: 'magenta'
        }
        const names = {
          classic: '经典',
          innovative: '创新',
          furniture: '家具',
          architecture: '建筑',
          decoration: '装饰'
        }
        return <Tag color={colors[cat]}>{names[cat]}</Tag>
      }
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (v) => v.toLocaleString()
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
      render: (v) => v.toLocaleString()
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (d) => `${d}/5`
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, 'mortise')}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个榫卯设计？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'}>
          {role === 'admin' ? '管理员' : '工艺师'}
        </Tag>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, 'user')}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个用户？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const designerColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '职称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '从业经验',
      dataIndex: 'experience',
      key: 'experience'
    },
    {
      title: '粉丝数',
      dataIndex: 'followers',
      key: 'followers',
      render: (v) => v.toLocaleString()
    },
    {
      title: '作品数',
      dataIndex: 'worksCount',
      key: 'worksCount'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, 'designer')}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个设计师？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const menuItems = [
    { key: 'dashboard', label: '数据概览', icon: <BarChartOutlined /> },
    { key: 'mortises', label: '榫卯管理', icon: <AppstoreOutlined /> },
    { key: 'users', label: '用户管理', icon: <UserOutlined /> },
    { key: 'designers', label: '设计师管理', icon: <UserAddOutlined /> }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {statistics.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card>
                    <Statistic
                      title={
                        <span>
                          {stat.icon} {stat.title}
                        </span>
                      }
                      value={stat.value}
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <Card title="管理员信息">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
                <Descriptions.Item label="姓名">{user?.name}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
                <Descriptions.Item label="部门">{user?.department}</Descriptions.Item>
                <Descriptions.Item label="权限" span={2}>
                  {user?.permissions?.map((p, i) => (
                    <Tag key={i} color="purple" style={{ margin: 2 }}>{p}</Tag>
                  ))}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )
      case 'mortises':
        return (
          <Card
            title="榫卯设计列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('mortise')}>
                新增榫卯
              </Button>
            }
          >
            <Table
              columns={mortiseColumns}
              dataSource={allMortises}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case 'users':
        return (
          <Card
            title="用户列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('user')}>
                新增用户
              </Button>
            }
          >
            <Table
              columns={userColumns}
              dataSource={userList}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      case 'designers':
        return (
          <Card
            title="设计师列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('designer')}>
                新增设计师
              </Button>
            }
          >
            <Table
              columns={designerColumns}
              dataSource={designerList}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100%', padding: '24px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <Card
          style={{ borderRadius: 12 }}
          tabList={menuItems}
          activeTabKey={activeTab}
          onTabChange={setActiveTab}
          tabProps={{ size: 'large' }}
        >
          {renderContent()}
        </Card>
      </div>

      <Modal
        title={editingItem?.id ? '编辑' : '新增'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          {editingItem?.type === 'mortise' && (
            <>
              <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select>
                  <Option value="classic">经典榫卯</Option>
                  <Option value="innovative">创新榫卯</Option>
                  <Option value="furniture">家具榫卯</Option>
                  <Option value="architecture">建筑榫卯</Option>
                  <Option value="decoration">装饰榫卯</Option>
                </Select>
              </Form.Item>
              <Form.Item name="description" label="描述" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="difficulty" label="难度">
                <Select>
                  {[1, 2, 3, 4, 5].map(d => (
                    <Option key={d} value={d}>{d}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          {editingItem?.type === 'user' && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </>
          )}
          {editingItem?.type === 'designer' && (
            <>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="title" label="职称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="experience" label="从业经验" rules={[{ required: true }]}>
                <Input placeholder="例如：10年" />
              </Form.Item>
              <Form.Item name="bio" label="简介" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default Admin
