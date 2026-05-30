import { useState, useEffect } from 'react';
import { Layout, Menu, Card, Table, Typography, Tag, Button, Statistic, Row, Col, Empty } from 'antd';
import {
  ShoppingOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { products, categories } from '../../mock';

const { Content, Sider } = Layout;
const { Title } = Typography;

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn } = useAuth();
  const [activeKey, setActiveKey] = useState('dashboard');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/admin' } } });
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, [isLoggedIn, isAdmin, navigate]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      label: '数据概览',
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: '商品管理',
    },
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
  ];

  const orderColumns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <div key={index} style={{ fontSize: 12, marginBottom: 4 }}>
              {item.name} x{item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '收货人',
      dataIndex: ['address', 'name'],
      key: 'name',
    },
    {
      title: '联系电话',
      dataIndex: ['address', 'phone'],
      key: 'phone',
    },
    {
      title: '金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <span style={{ color: '#ff4d4f' }}>¥{price.toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '待发货': 'orange',
          '已发货': 'blue',
          '已完成': 'green',
          '已取消': 'red',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" size="small">
          {record.status === '待发货' ? '发货' : '查看'}
        </Button>
      ),
    },
  ];

  const productColumns = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img src={image} alt="" style={{ width: 50, height: 50, borderRadius: 4 }} />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span style={{ color: '#ff4d4f' }}>¥{price}</span>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: '标签',
      key: 'tags',
      render: (_, record) => (
        <div>
          {record.isHot && <Tag color="red">热卖</Tag>}
          {record.isNew && <Tag color="blue">新品</Tag>}
        </div>
      ),
    },
  ];

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === '待发货').length;

  return (
    <Layout style={{ minHeight: 'calc(100vh - 134px)', background: '#fff' }}>
      <Sider width={200} style={{ background: '#001529' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => setActiveKey(key)}
          style={{ height: '100%', borderRight: 0 }}
          theme="dark"
        />
      </Sider>
      <Layout style={{ padding: '24px' }}>
        <Content>
          {activeKey === 'dashboard' && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                数据概览
              </Title>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="商品总数"
                      value={products.length}
                      prefix={<ShoppingOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="订单总数"
                      value={orders.length}
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="销售总额"
                      value={totalSales}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="待发货订单"
                      value={pendingOrders}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="商品分类统计" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  {categories.map((category) => {
                    const categoryProducts = products.filter((p) => p.categoryId === category.id);
                    return (
                      <Col span={6} key={category.id}>
                        <Card size="small">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 24 }}>{category.icon}</span>
                            <div>
                              <div style={{ fontWeight: 500 }}>{category.name}</div>
                              <div style={{ color: '#999', fontSize: 12 }}>
                                {categoryProducts.length} 件商品
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            </div>
          )}

          {activeKey === 'products' && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                商品管理
              </Title>
              <Card>
                <Table
                  columns={productColumns}
                  dataSource={products}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </div>
          )}

          {activeKey === 'orders' && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                订单管理
              </Title>
              <Card>
                {orders.length > 0 ? (
                  <Table
                    columns={orderColumns}
                    dataSource={orders}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="暂无订单" />
                )}
              </Card>
            </div>
          )}

          {activeKey === 'users' && (
            <div>
              <Title level={3} style={{ marginBottom: 24 }}>
                用户管理
              </Title>
              <Card>
                <Empty description="暂无用户数据" />
              </Card>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;
