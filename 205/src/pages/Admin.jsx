import { useState } from 'react';
import { Card, Table, Tag, Typography, Button, Space, Modal, Form, Input, message, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, UserOutlined, EyeOutlined as EyeIcon, DownloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { logOperation } from '@/store/platformSlice';
import './Admin.css';

const { Title } = Typography;

const Admin = () => {
  const dispatch = useDispatch();
  const { list: works } = useSelector(state => state.works);
  const { list: artisans } = useSelector(state => state.artisans);
  const { list: cases } = useSelector(state => state.cases);
  const { operationLogs, viewCounts, favoriteCounts, downloadHistory } = useSelector(state => state.platform);
  const [activeTab, setActiveTab] = useState('works');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const totalViews = Object.values(viewCounts).reduce((sum, count) => sum + count, 0);
  const totalFavorites = Object.values(favoriteCounts).reduce((sum, count) => sum + count, 0);

  const workColumns = [
    {
      title: '作品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '作者',
      dataIndex: 'artist',
      key: 'artist',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: text => <span style={{ color: '#d4af37', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: '状态',
      key: 'featured',
      dataIndex: 'featured',
      render: featured => (
        <Tag color={featured ? 'gold' : 'default'}>
          {featured ? '精选' : '普通'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  const artisanColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '头衔',
      dataIndex: 'title',
      key: 'title',
      render: text => <Tag color="gold">{text}</Tag>,
    },
    {
      title: '从业经验',
      dataIndex: 'experience',
      key: 'experience',
    },
    {
      title: '擅长领域',
      dataIndex: 'specialty',
      key: 'specialty',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  const caseColumns = [
    {
      title: '项目名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '项目时间',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: status => {
        const statusMap = {
          completed: { color: 'success', text: '已完成' },
          ongoing: { color: 'processing', text: '进行中' },
          upcoming: { color: 'default', text: '即将开始' },
        };
        const config = statusMap[status] || { color: 'default', text: '未知' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  const logColumns = [
    {
      title: '操作时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: action => {
        const actionMap = {
          search: { color: 'blue', text: '搜索' },
          view_work: { color: 'green', text: '查看作品' },
          favorite_work: { color: 'gold', text: '收藏作品' },
          unfavorite_work: { color: 'default', text: '取消收藏' },
          download_material: { color: 'purple', text: '下载素材' },
          login: { color: 'cyan', text: '登录' },
          logout: { color: 'default', text: '登出' },
          add_tag: { color: 'orange', text: '添加标签' },
          delete_tag: { color: 'red', text: '删除标签' },
          set_item_tag: { color: 'geekblue', text: '设置标签' },
          view_notification: { color: 'magenta', text: '查看通知' },
          click_search_result: { color: 'lime', text: '点击搜索结果' },
          search_enter: { color: 'blue', text: '搜索跳转' },
          view_search_results: { color: 'blue', text: '查看搜索结果' },
        };
        const config = actionMap[action] || { color: 'default', text: action };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作详情',
      dataIndex: 'detail',
      key: 'detail',
    },
  ];

  const downloadColumns = [
    {
      title: '下载时间',
      dataIndex: 'time',
      key: 'time',
      width: 180,
    },
    {
      title: '素材名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '素材类型',
      dataIndex: 'itemType',
      key: 'itemType',
      render: type => <Tag color="purple">{type === 'work' ? '作品' : type}</Tag>,
    },
  ];

  const tabItems = [
    { key: 'works', label: '作品管理' },
    { key: 'artisans', label: '传承人管理' },
    { key: 'cases', label: '案例管理' },
    { key: 'logs', label: '操作日志' },
    { key: 'downloads', label: '下载记录' },
  ];

  const handleAdd = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      message.success('添加成功');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getColumns = () => {
    switch (activeTab) {
      case 'works':
        return workColumns;
      case 'artisans':
        return artisanColumns;
      case 'cases':
        return caseColumns;
      case 'logs':
        return logColumns;
      case 'downloads':
        return downloadColumns;
      default:
        return workColumns;
    }
  };

  const getData = () => {
    switch (activeTab) {
      case 'works':
        return works;
      case 'artisans':
        return artisans;
      case 'cases':
        return cases;
      case 'logs':
        return operationLogs;
      case 'downloads':
        return downloadHistory;
      default:
        return works;
    }
  };

  const handleTabChange = key => {
    setActiveTab(key);
    dispatch(logOperation({
      action: 'admin_view',
      detail: `查看管理后台: ${tabItems.find(t => t.key === key)?.label}`,
    }));
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Title level={3} className="page-title">
          管理后台
        </Title>
        {['works', 'artisans', 'cases'].includes(activeTab) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]} className="stats-cards">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总作品数"
              value={works.length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总浏览量"
              value={totalViews}
              prefix={<EyeIcon style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总收藏量"
              value={totalFavorites}
              prefix={<UserOutlined style={{ color: '#d4af37' }} />}
              valueStyle={{ color: '#d4af37' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="总下载数"
              value={downloadHistory.length}
              prefix={<DownloadOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        tabList={tabItems}
        activeTabKey={activeTab}
        onTabChange={handleTabChange}
        className="admin-card"
      >
        <Table
          columns={getColumns()}
          dataSource={getData()}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新增"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
