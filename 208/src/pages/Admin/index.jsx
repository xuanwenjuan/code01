import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Typography, Table, Button, Tag, Avatar, Popconfirm, message, Card, Row, Col, Statistic } from 'antd';
import { DesktopOutlined, UserOutlined, CommentOutlined, QuestionCircleOutlined, DeleteOutlined, HomeOutlined, TeamOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { deleteWork, deleteComment, deleteQuestion } from '../../store/slices/adminSlice';
import './Admin.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Admin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector(state => state.auth);
  const { works, comments } = useSelector(state => state.works);
  const { users } = useSelector(state => state.auth);
  const { questions } = useSelector(state => state.community);
  const [activeKey, setActiveKey] = useState('dashboard');

  if (!currentUser || currentUser.role !== 'admin') {
    navigate('/');
    return null;
  }

  const menuItems = [
    { key: 'dashboard', icon: <DesktopOutlined />, label: '数据概览' },
    { key: 'works', icon: <FileTextOutlined />, label: '作品管理' },
    { key: 'users', icon: <UserOutlined />, label: '用户管理' },
    { key: 'comments', icon: <CommentOutlined />, label: '评论管理' },
    { key: 'qa', icon: <QuestionCircleOutlined />, label: '问答管理' },
  ];

  const handleDeleteWork = async (workId) => {
    await dispatch(deleteWork(workId));
    message.success('删除成功');
  };

  const handleDeleteComment = async (commentId) => {
    await dispatch(deleteComment(commentId));
    message.success('删除成功');
  };

  const handleDeleteQuestion = async (questionId) => {
    await dispatch(deleteQuestion(questionId));
    message.success('删除成功');
  };

  const categoryMap = {
    folk: { label: '民俗类', color: 'red' },
    flower: { label: '花鸟类', color: 'green' },
    figure: { label: '人物类', color: 'blue' },
  };

  const workColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '作品',
      key: 'work',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={record.image} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
          <Text strong>{record.title}</Text>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat) => categoryMap[cat] && <Tag color={categoryMap[cat].color}>{categoryMap[cat].label}</Tag>,
    },
    { title: '作者', dataIndex: 'author', key: 'author', width: 120 },
    { title: '点赞', dataIndex: 'likes', key: 'likes', width: 80 },
    { title: '浏览', dataIndex: 'views', key: 'views', width: 80 },
    { title: '发布时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定删除这个作品吗？"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => handleDeleteWork(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '用户',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={record.avatar} />
          <div>
            <Text strong>{record.nickname}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '作品数',
      key: 'works',
      width: 100,
      render: (_, record) => works.filter(w => w.authorId === record.id).length,
    },
  ];

  const commentColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size="small" src={record.avatar} />
          <Text>{record.username}</Text>
        </div>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    { title: '作品ID', dataIndex: 'workId', key: 'workId', width: 80 },
    { title: '发布时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定删除这条评论吗？"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => handleDeleteComment(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  const qaColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '提问者',
      key: 'user',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size="small" src={record.avatar} />
          <Text>{record.author}</Text>
        </div>
      ),
    },
    { title: '标题', dataIndex: 'title', key: 'title', width: 200 },
    {
      title: '问题内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    { title: '回答数', key: 'answers', width: 80, render: (_, r) => r.answers?.length || 0 },
    { title: '浏览量', dataIndex: 'views', key: 'views', width: 80 },
    { title: '发布时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确定删除这个问题吗？"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => handleDeleteQuestion(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  const renderDashboard = () => (
    <div>
      <Title level={3}>数据概览</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="作品总数"
              value={works.length}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={users.length}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="评论总数"
              value={comments.length}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="问题总数"
              value={questions.length}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Title level={4}>最新作品</Title>
      <Table
        dataSource={[...works].reverse().slice(0, 5)}
        columns={workColumns}
        pagination={false}
        rowKey="id"
      />
    </div>
  );

  return (
    <Layout className="admin-layout">
      <Sider className="admin-sider" width={220}>
        <div className="admin-logo">
          <span className="logo-icon">✂️</span>
          <span className="logo-text">管理后台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => setActiveKey(key)}
        />
        <Button
          type="link"
          icon={<HomeOutlined />}
          onClick={() => navigate('/')}
          className="back-home"
        >
          返回首页
        </Button>
      </Sider>
      <Layout>
        <Header className="admin-header">
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {menuItems.find(item => item.key === activeKey)?.label}
          </Title>
          <div className="admin-user">
            <Avatar src={currentUser.avatar} />
            <span>{currentUser.nickname}</span>
          </div>
        </Header>
        <Content className="admin-content">
          {activeKey === 'dashboard' && renderDashboard()}
          {activeKey === 'works' && (
            <div>
              <Title level={3}>作品管理</Title>
              <Table dataSource={works} columns={workColumns} rowKey="id" />
            </div>
          )}
          {activeKey === 'users' && (
            <div>
              <Title level={3}>用户管理</Title>
              <Table dataSource={users} columns={userColumns} rowKey="id" />
            </div>
          )}
          {activeKey === 'comments' && (
            <div>
              <Title level={3}>评论管理</Title>
              <Table dataSource={comments} columns={commentColumns} rowKey="id" />
            </div>
          )}
          {activeKey === 'qa' && (
            <div>
              <Title level={3}>问答管理</Title>
              <Table dataSource={questions} columns={qaColumns} rowKey="id" />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
