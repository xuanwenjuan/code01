import { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Button, Empty, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Orders = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
      return;
    }
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, [isLoggedIn, navigate]);

  const viewDetail = (order) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: '商品信息',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 4 }} />
              <div>
                <div style={{ fontSize: 12 }}>{item.name}</div>
                <div style={{ color: '#999', fontSize: 11 }}>x{item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      render: (price) => <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{price.toFixed(2)}</span>,
    },
    {
      title: '收货人',
      dataIndex: ['address', 'name'],
      key: 'name',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: ['address', 'phone'],
      key: 'phone',
      width: 130,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
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
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" icon={<EyeOutlined />} onClick={() => viewDetail(record)}>
          详情
        </Button>
      ),
    },
  ];

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        我的订单
      </Title>

      <Card style={{ borderRadius: 8 }}>
        {orders.length > 0 ? (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
          />
        ) : (
          <Empty description="暂无订单" buttonText="去购物" onClick={() => navigate('/')} />
        )}
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentOrder && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>订单号：</strong>{currentOrder.id}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>订单状态：</strong>
              <Tag color={currentOrder.status === '待发货' ? 'orange' : 'green'}>
                {currentOrder.status}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>商品信息：</strong>
              {currentOrder.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                  <img src={item.image} alt="" style={{ width: 60, height: 60, borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div>{item.name}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>
                      {Object.entries(item.selectedSpecs || {}).map(([k, v]) => `${k}: ${v}`).join('，')}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ color: '#ff4d4f' }}>¥{item.price}</span>
                      <span style={{ marginLeft: 16, color: '#999' }}>x{item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>收货信息：</strong>
              <div style={{ marginTop: 8, padding: 12, background: '#fafafa', borderRadius: 4 }}>
                <div>收货人：{currentOrder.address.name}</div>
                <div>联系电话：{currentOrder.address.phone}</div>
                <div>收货地址：{currentOrder.address.address}</div>
              </div>
            </div>
            <div style={{ padding: 16, background: '#fff7e6', borderRadius: 8, textAlign: 'right' }}>
              <span style={{ fontSize: 16 }}>订单金额：</span>
              <span style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 'bold' }}>
                ¥{currentOrder.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
