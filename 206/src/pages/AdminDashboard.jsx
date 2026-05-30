import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Avatar,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  UserOutlined,
  AppstoreOutlined,
  BookOutlined,
  HeartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { mockEmbroideries, mockTutorials, mockUsers, mockMasters } from '../data/mockData';
import dayjs from 'dayjs';

const { Option } = Select;

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [embroideries, setEmbroideries] = useState(mockEmbroideries);
  const [tutorials, setTutorials] = useState(mockTutorials);
  const [users, setUsers] = useState(mockUsers);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();

  const statistics = [
    {
      title: '用户总数',
      value: users.length,
      icon: <UserOutlined />,
      color: '#1890ff',
    },
    {
      title: '绣品总数',
      value: embroideries.length,
      icon: <AppstoreOutlined />,
      color: '#722ed1',
    },
    {
      title: '教程总数',
      value: tutorials.length,
      icon: <BookOutlined />,
      color: '#13c2c2',
    },
    {
      title: '大师数量',
      value: mockMasters.length,
      icon: <HeartOutlined />,
      color: '#eb2f96',
    },
  ];

  const userColumns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_, record) => <Avatar src={record.avatar} icon={<UserOutlined />} />,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colorMap = {
          admin: 'red',
          inheritor: 'gold',
          enthusiast: 'blue',
        };
        const labelMap = {
          admin: '管理员',
          inheritor: '传承人',
          enthusiast: '爱好者',
        };
        return <Tag color={colorMap[role]}>{labelMap[role]}</Tag>;
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个用户？"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const embroideryColumns = [
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img src={image} alt="" className="h-12 w-12 rounded object-cover" />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '题材',
      dataIndex: 'theme',
      key: 'theme',
      render: (theme) => <Tag color="gold">{theme}</Tag>,
    },
    {
      title: '大师',
      dataIndex: 'masterName',
      key: 'masterName',
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditEmbroidery(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个绣品？"
            onConfirm={() => handleDeleteEmbroidery(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tutorialColumns = [
    {
      title: '封面',
      dataIndex: 'cover',
      key: 'cover',
      render: (cover) => (
        <img src={cover} alt="" className="h-12 w-16 rounded object-cover" />
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag color="blue">{cat}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Tag color="green">{level}</Tag>,
    },
    {
      title: '讲师',
      dataIndex: 'instructor',
      key: 'instructor',
    },
    {
      title: '学习人数',
      dataIndex: 'students',
      key: 'students',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTutorial(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个教程？"
            onConfirm={() => handleDeleteTutorial(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEditUser = (user) => {
    setEditingItem(user);
    setModalType('user');
    form.setFieldsValue({
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      email: user.email,
    });
    setModalVisible(true);
  };

  const handleEditEmbroidery = (embroidery) => {
    setEditingItem(embroidery);
    setModalType('embroidery');
    form.setFieldsValue({
      name: embroidery.name,
      theme: embroidery.theme,
      masterName: embroidery.masterName,
      description: embroidery.description,
    });
    setModalVisible(true);
  };

  const handleEditTutorial = (tutorial) => {
    setEditingItem(tutorial);
    setModalType('tutorial');
    form.setFieldsValue({
      title: tutorial.title,
      category: tutorial.category,
      level: tutorial.level,
      instructor: tutorial.instructor,
      description: tutorial.description,
    });
    setModalVisible(true);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    message.success('用户删除成功');
  };

  const handleDeleteEmbroidery = (id) => {
    setEmbroideries(embroideries.filter((e) => e.id !== id));
    message.success('绣品删除成功');
  };

  const handleDeleteTutorial = (id) => {
    setTutorials(tutorials.filter((t) => t.id !== id));
    message.success('教程删除成功');
  };

  const handleSave = (values) => {
    if (modalType === 'user') {
      if (editingItem) {
        setUsers(
          users.map((u) => (u.id === editingItem.id ? { ...u, ...values } : u))
        );
      }
      message.success('用户信息更新成功');
    } else if (modalType === 'embroidery') {
      if (editingItem) {
        setEmbroideries(
          embroideries.map((e) =>
            e.id === editingItem.id ? { ...e, ...values } : e
          )
        );
      }
      message.success('绣品信息更新成功');
    } else if (modalType === 'tutorial') {
      if (editingItem) {
        setTutorials(
          tutorials.map((t) =>
            t.id === editingItem.id ? { ...t, ...values } : t
          )
        );
      }
      message.success('教程信息更新成功');
    }
    setModalVisible(false);
  };

  const tabItems = [
    {
      key: 'overview',
      label: '数据概览',
      children: (
        <div>
          <Row gutter={[16, 16]} className="mb-8">
            {statistics.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card>
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: stat.color }}
                    >
                      {stat.icon}
                    </div>
                    <Statistic title={stat.title} value={stat.value} />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Card title="最近注册用户" className="mb-8">
            <Table
              dataSource={users.slice(0, 5)}
              columns={userColumns.slice(0, 6)}
              pagination={false}
              rowKey="id"
            />
          </Card>

          <Card title="热门绣品">
            <Table
              dataSource={[...embroideries].sort((a, b) => b.views - a.views).slice(0, 5)}
              columns={embroideryColumns.slice(0, 6)}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'users',
      label: '用户管理',
      children: (
        <Card
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-amber-600"
              onClick={() => {
                setEditingItem(null);
                setModalType('user');
                form.resetFields();
                setModalVisible(true);
              }}
            >
              添加用户
            </Button>
          }
        >
          <Table
            dataSource={users}
            columns={userColumns}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Card>
      ),
    },
    {
      key: 'embroideries',
      label: '绣品管理',
      children: (
        <Card
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-amber-600"
              onClick={() => {
                setEditingItem(null);
                setModalType('embroidery');
                form.resetFields();
                setModalVisible(true);
              }}
            >
              添加绣品
            </Button>
          }
        >
          <Table
            dataSource={embroideries}
            columns={embroideryColumns}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Card>
      ),
    },
    {
      key: 'tutorials',
      label: '教程管理',
      children: (
        <Card
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-amber-600"
              onClick={() => {
                setEditingItem(null);
                setModalType('tutorial');
                form.resetFields();
                setModalVisible(true);
              }}
            >
              添加教程
            </Button>
          }
        >
          <Table
            dataSource={tutorials}
            columns={tutorialColumns}
            pagination={{ pageSize: 10 }}
            rowKey="id"
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">管理后台</h1>
        <p className="mt-2 text-gray-500">平台管理员专属功能</p>
      </div>

      <Tabs defaultActiveKey="overview" activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title={
          editingItem
            ? `编辑${modalType === 'user' ? '用户' : modalType === 'embroidery' ? '绣品' : '教程'}`
            : `添加${modalType === 'user' ? '用户' : modalType === 'embroidery' ? '绣品' : '教程'}`
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="mt-4">
          {modalType === 'user' && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">管理员</Option>
                  <Option value="inheritor">传承人</Option>
                  <Option value="enthusiast">爱好者</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </>
          )}
          {modalType === 'embroidery' && (
            <>
              <Form.Item
                name="name"
                label="绣品名称"
                rules={[{ required: true, message: '请输入绣品名称' }]}
              >
                <Input placeholder="请输入绣品名称" />
              </Form.Item>
              <Form.Item
                name="theme"
                label="题材"
                rules={[{ required: true, message: '请选择题材' }]}
              >
                <Select placeholder="请选择题材">
                  <Option value="山水">山水</Option>
                  <Option value="花鸟">花鸟</Option>
                  <Option value="人物">人物</Option>
                  <Option value="动物">动物</Option>
                  <Option value="静物">静物</Option>
                  <Option value="书法">书法</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="masterName"
                label="大师"
                rules={[{ required: true, message: '请输入大师名称' }]}
              >
                <Input placeholder="请输入大师名称" />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} placeholder="请输入描述" />
              </Form.Item>
            </>
          )}
          {modalType === 'tutorial' && (
            <>
              <Form.Item
                name="title"
                label="教程标题"
                rules={[{ required: true, message: '请输入教程标题' }]}
              >
                <Input placeholder="请输入教程标题" />
              </Form.Item>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  <Option value="入门">入门</Option>
                  <Option value="进阶">进阶</Option>
                  <Option value="创新">创新</Option>
                  <Option value="传统">传统</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="level"
                label="难度"
                rules={[{ required: true, message: '请选择难度' }]}
              >
                <Select placeholder="请选择难度">
                  <Option value="初级">初级</Option>
                  <Option value="中级">中级</Option>
                  <Option value="高级">高级</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="instructor"
                label="讲师"
                rules={[{ required: true, message: '请输入讲师名称' }]}
              >
                <Input placeholder="请输入讲师名称" />
              </Form.Item>
              <Form.Item name="description" label="描述">
                <Input.TextArea rows={4} placeholder="请输入描述" />
              </Form.Item>
            </>
          )}
          <Form.Item className="mb-0">
            <div className="flex justify-end gap-2">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" className="bg-amber-600">
                保存
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
