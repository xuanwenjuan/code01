import React, { useState, useMemo } from 'react';
import {
  Card,
  Tabs,
  List,
  Tag,
  Button,
  Rate,
  Modal,
  message,
  Empty,
  Divider,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { updateOrderStatus } from '../store/modules/user';
import { getStatusText, formatPrice } from '../utils';
import type { Order } from '../types';
import EmptyState from '../components/common/EmptyState';

const { TabPane } = Tabs;

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('all');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'default',
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined />,
      confirmed: <CheckCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />,
    };
    return iconMap[status] || null;
  };

  const handleCancelOrder = (order: Order) => {
    Modal.confirm({
      title: '确认取消',
      content: '您确定要取消这个预约吗？',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId: order.id, status: 'cancelled' }));
        message.success('预约已取消');
      },
    });
  };

  const handleConfirmOrder = (order: Order) => {
    Modal.confirm({
      title: '确认完成',
      content: '请确认服务已完成',
      onOk: () => {
        dispatch(updateOrderStatus({ orderId: order.id, status: 'completed' }));
        message.success('订单已完成');
      },
    });
  };

  const handleReview = (order: Order) => {
    setSelectedOrder(order);
    setReviewModalVisible(true);
  };

  const submitReview = () => {
    if (!reviewContent.trim()) {
      message.warning('请输入评价内容');
      return;
    }
    message.success('评价提交成功');
    setReviewModalVisible(false);
    setReviewContent('');
    setRating(5);
  };

  const renderOrderCard = (order: Order) => (
    <Card style={{ marginBottom: '16px' }} key={order.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#999' }}>订单号：{order.id}</span>
        </div>
        <Tag color={getStatusColor(order.status)} icon={getStatusIcon(order.status)}>
          {getStatusText(order.status)}
        </Tag>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <img
          src={order.serviceImage}
          alt={order.serviceName}
          style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => navigate(`/service/${order.serviceId}`)}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', cursor: 'pointer' }} onClick={() => navigate(`/service/${order.serviceId}`)}>
            {order.serviceName}
          </div>
          <div style={{ color: '#666', marginBottom: '4px' }}>美甲师：{order.technicianName}</div>
          <div style={{ color: '#666', marginBottom: '4px' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            预约时间：{order.appointmentTime}
          </div>
          <div style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
            {formatPrice(order.price)}
          </div>
        </div>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ marginBottom: '12px' }}>
        <div style={{ color: '#666', marginBottom: '4px' }}>
          <EnvironmentOutlined style={{ marginRight: '4px' }} />
          {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
        </div>
        <div style={{ color: '#666' }}>
          <PhoneOutlined style={{ marginRight: '4px' }} />
          {order.address.name} {order.address.phone}
        </div>
        {order.remark && (
          <div style={{ color: '#999', marginTop: '4px' }}>备注：{order.remark}</div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {order.status === 'pending' && (
          <>
            <Button onClick={() => handleCancelOrder(order)}>取消预约</Button>
          </>
        )}
        {order.status === 'confirmed' && (
          <>
            <Button onClick={() => handleCancelOrder(order)}>取消预约</Button>
            <Button type="primary" onClick={() => handleConfirmOrder(order)}>
              确认完成
            </Button>
          </>
        )}
        {order.status === 'completed' && (
          <Button type="primary" onClick={() => handleReview(order)}>
            去评价
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Card title="我的订单" bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="待确认" key="pending" />
          <TabPane tab="已确认" key="confirmed" />
          <TabPane tab="已完成" key="completed" />
          <TabPane tab="已取消" key="cancelled" />
        </Tabs>

        {filteredOrders.length > 0 ? (
          <div>{filteredOrders.map(renderOrderCard)}</div>
        ) : (
          <EmptyState
            description={activeTab === 'all' ? '暂无订单' : `暂无${getStatusText(activeTab)}的订单`}
            actionText="去预约服务"
            actionPath="/services"
          />
        )}
      </Card>

      <Modal
        title="服务评价"
        open={reviewModalVisible}
        onOk={submitReview}
        onCancel={() => setReviewModalVisible(false)}
        okText="提交评价"
        cancelText="取消"
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <span style={{ marginRight: '8px' }}>服务评分：</span>
              <Rate value={rating} onChange={setRating} />
            </div>
            <div>
              <span style={{ display: 'block', marginBottom: '8px' }}>评价内容：</span>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="请分享您的服务体验..."
                style={{ width: '100%', height: '120px', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                maxLength={500}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
