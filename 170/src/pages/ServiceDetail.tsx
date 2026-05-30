import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Carousel,
  Tag,
  Rate,
  Button,
  Card,
  Steps,
  Avatar,
  List,
  DatePicker,
  TimePicker,
  message,
  Modal,
  Descriptions,
  Divider,
} from 'antd';
import {
  HeartOutlined,
  HeartFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { mockServices, mockTechnicians, mockReviews } from '../mock';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleFavorite } from '../store/modules/user';
import { formatPrice, formatTime } from '../utils';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../hooks/useAuth';
import type { Dayjs } from 'dayjs';

const categoryColors: Record<string, string> = {
  nail: 'pink',
  eyelash: 'purple',
  care: 'green',
};

const categoryLabels: Record<string, string> = {
  nail: '美甲',
  eyelash: '美睫',
  care: '手足护理',
};

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30',
];

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoggedIn } = useAuth();
  const { favorites } = useAppSelector((state) => state.user);

  const service = useMemo(() => {
    return mockServices.find((s) => s.id === id);
  }, [id]);

  const technician = useMemo(() => {
    if (!service) return null;
    return mockTechnicians.find((t) => t.id === service.technicianId);
  }, [service]);

  const serviceReviews = useMemo(() => {
    return mockReviews.filter((r) => r.serviceName === service?.name);
  }, [service]);

  const isFavorite = useMemo(() => {
    return favorites.includes(id || '');
  }, [favorites, id]);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!service) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <EmptyState
          description="服务不存在或已下架"
          actionText="返回服务列表"
          actionPath="/services"
        />
      </div>
    );
  }

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    dispatch(toggleFavorite(service.id));
    message.success(isFavorite ? '已取消收藏' : '已加入收藏');
  };

  const handleBooking = () => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const confirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      message.warning('请选择预约日期和时间');
      return;
    }
    setShowBookingModal(false);
    navigate(
      `/booking/${service.id}?date=${selectedDate.format('YYYY-MM-DD')}&time=${selectedTime}`
    );
  };

  const isTimeDisabled = (time: string) => {
    if (!selectedDate) return false;
    const now = dayjs();
    const selectedDateTime = selectedDate.format('YYYY-MM-DD') + ' ' + time;
    return dayjs(selectedDateTime).isBefore(now);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <Button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        ← 返回
      </Button>

      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: '0' }}
      >
        <Row gutter={0}>
          <Col xs={24} md={10}>
            <div style={{ position: 'relative' }}>
              <Carousel
                autoplay
                effect="fade"
                beforeChange={(from, to) => setCurrentImageIndex(to)}
                style={{ borderRadius: '12px 0 0 12px', overflow: 'hidden' }}
              >
                {service.images.map((img, idx) => (
                  <div key={idx}>
                    <img
                      src={img}
                      alt={`${service.name}-${idx + 1}`}
                      style={{ width: '100%', height: '450px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </Carousel>
              <Tag
                color={categoryColors[service.category]}
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  fontSize: '14px',
                  padding: '4px 12px',
                }}
              >
                {categoryLabels[service.category]}
              </Tag>
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                }}
              >
                {currentImageIndex + 1}/{service.images.length}
              </div>
            </div>
          </Col>

          <Col xs={24} md={14}>
            <div style={{ padding: '32px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h1
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    margin: '0 0 12px 0',
                    color: '#333',
                    lineHeight: '1.3',
                  }}
                >
                  {service.name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {service.tags.map((tag) => (
                    <Tag key={tag} style={{ fontSize: '13px', padding: '2px 10px' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Rate disabled value={service.rating} allowHalf style={{ fontSize: '16px' }} />
                    <span style={{ color: '#ff85c0', fontWeight: 'bold', fontSize: '16px' }}>
                      {service.rating}
                    </span>
                  </div>
                  <span style={{ color: '#999' }}>{service.reviewCount}条评价</span>
                  <span style={{ color: '#999' }}>
                    <StarOutlined style={{ marginRight: '4px' }} />
                    已售{service.salesCount}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '12px',
                    marginBottom: '24px',
                    padding: '16px',
                    background: '#fff0f6',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '36px', color: '#ff4d4f', fontWeight: 'bold' }}>
                    {formatPrice(service.price)}
                  </span>
                  <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '16px' }}>
                    {formatPrice(service.originalPrice)}
                  </span>
                  <Tag color="red" style={{ fontSize: '13px', margin: 0 }}>
                    限时立省{service.originalPrice - service.price}元
                  </Tag>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    color: '#666',
                    marginBottom: '24px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <span>
                    <ClockCircleOutlined style={{ marginRight: '6px', color: '#ff85c0' }} />
                    服务时长：约{service.duration}分钟
                  </span>
                  {technician && (
                    <span>
                      <EnvironmentOutlined style={{ marginRight: '6px', color: '#ff85c0' }} />
                      距您约{technician.distance}km
                    </span>
                  )}
                </div>
              </div>

              {technician && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px',
                    background: '#fafafa',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/services?technician=${technician.id}`)}
                >
                  <Avatar src={technician.avatar} size={64} />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '18px',
                        marginBottom: '6px',
                        color: '#333',
                      }}
                    >
                      {technician.name}
                      <Tag color="purple" style={{ marginLeft: '8px' }}>
                        {technician.title}
                      </Tag>
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                      <Rate disabled value={technician.rating} allowHalf style={{ fontSize: '12px' }} />
                      <span style={{ marginLeft: '8px' }}>{technician.rating}分</span>
                      <span style={{ marginLeft: '16px' }}>接单{technician.orderCount}单</span>
                      <span style={{ marginLeft: '16px' }}>{technician.experience}年经验</span>
                    </div>
                    <div style={{ color: '#999', fontSize: '13px' }}>
                      {technician.description}
                    </div>
                  </div>
                  <Button type="link" style={{ color: '#ff85c0' }}>
                    查看TA的服务 →
                  </Button>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  onClick={handleBooking}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                    border: 'none',
                    height: '52px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderRadius: '26px',
                    boxShadow: '0 4px 12px rgba(255, 133, 192, 0.4)',
                  }}
                >
                  立即预约
                </Button>
                <Button
                  size="large"
                  icon={
                    isFavorite ? (
                      <HeartFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />
                    ) : (
                      <HeartOutlined style={{ fontSize: '20px' }} />
                    )
                  }
                  onClick={handleToggleFavorite}
                  style={{
                    height: '52px',
                    minWidth: '120px',
                    borderRadius: '26px',
                    border: isFavorite ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
                    color: isFavorite ? '#ff4d4f' : '#666',
                  }}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card
            title="服务介绍"
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            headStyle={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            <p style={{ color: '#666', lineHeight: '1.8', margin: 0, fontSize: '14px' }}>
              {service.description}
            </p>
          </Card>

          <Card
            title="服务流程"
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            headStyle={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            <Steps
              direction="vertical"
              size="small"
              items={service.process.map((step) => ({
                title: (
                  <span style={{ fontWeight: '500', color: '#333' }}>
                    步骤{step.step}：{step.title}
                  </span>
                ),
                description: <span style={{ color: '#666' }}>{step.desc}</span>,
              }))}
            />
          </Card>

          <Card
            title="收费标准"
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            headStyle={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="服务费用">
                <span style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '18px' }}>
                  {formatPrice(service.price)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="原价">
                <span style={{ textDecoration: 'line-through', color: '#999' }}>
                  {formatPrice(service.originalPrice)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="服务时长">
                约{service.duration}分钟
              </Descriptions.Item>
              <Descriptions.Item label="上门费用">免费</Descriptions.Item>
              <Descriptions.Item label="服务包含">
                专业美甲师上门服务、品牌甲油胶、基础修手护理
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title={`用户评价 (${serviceReviews.length})`}
            style={{ marginBottom: '24px', borderRadius: '12px' }}
            headStyle={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            {serviceReviews.length > 0 ? (
              <List
                dataSource={serviceReviews}
                renderItem={(review) => (
                  <List.Item
                    style={{
                      padding: '20px 0',
                      borderBottom: '1px solid #f0f0f0',
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={review.userAvatar} icon={<UserOutlined />} size={48} />}
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>{review.userName}</span>
                          <Rate disabled value={review.rating} allowHalf style={{ fontSize: '12px' }} />
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ color: '#333', margin: '12px 0', lineHeight: '1.6' }}>
                            {review.content}
                          </p>
                          {review.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              {review.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt="评价图片"
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          <div style={{ color: '#999', fontSize: '12px' }}>
                            {review.createTime}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <EmptyState description="暂无评价，快来成为第一个评价的人吧~" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title="预约须知"
            style={{
              borderRadius: '12px',
              position: 'sticky',
              top: '80px',
            }}
            headStyle={{ fontWeight: 'bold', fontSize: '16px' }}
          >
            <List
              size="small"
              dataSource={[
                '预约成功后，美甲师将提前15分钟到达指定地点',
                '如需取消预约，请提前2小时联系客服',
                '服务包含免费修手和基础护理',
                '特殊款式可能需要额外收费，详情请咨询美甲师',
                '服务过程中如有任何不满意，请立即反馈',
              ]}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                  <span style={{ color: '#666', fontSize: '13px', lineHeight: '1.6' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '6px' }} />
                    {item}
                  </span>
                </List.Item>
              )}
            />
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '12px' }}>
                有任何疑问请联系客服
              </p>
              <Button
                type="primary"
                block
                style={{
                  background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
                  border: 'none',
                  borderRadius: '20px',
                }}
              >
                在线咨询
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
            选择预约时间
          </div>
        }
        open={showBookingModal}
        onOk={confirmBooking}
        onCancel={() => setShowBookingModal(false)}
        okText="确认预约"
        cancelText="取消"
        width={500}
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
            border: 'none',
            borderRadius: '20px',
            height: '40px',
            padding: '0 32px',
          },
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '500',
                color: '#333',
                fontSize: '14px',
              }}
            >
              选择预约日期：
            </label>
            <DatePicker
              style={{ width: '100%', height: '44px' }}
              disabledDate={disabledDate}
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="请选择预约日期"
              size="large"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '12px',
                fontWeight: '500',
                color: '#333',
                fontSize: '14px',
              }}
            >
              选择上门时间：
            </label>
            {selectedDate ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {timeSlots.map((time) => {
                  const disabled = isTimeDisabled(time);
                  return (
                    <Button
                      key={time}
                      type={selectedTime === time ? 'primary' : 'default'}
                      disabled={disabled}
                      onClick={() => handleTimeSelect(time)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        background:
                          selectedTime === time
                            ? 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)'
                            : disabled
                            ? '#f5f5f5'
                            : '#fff',
                        border: selectedTime === time ? 'none' : '1px solid #d9d9d9',
                        color: selectedTime === time ? '#fff' : disabled ? '#bfbfbf' : '#333',
                      }}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: '#999',
                  background: '#fafafa',
                  borderRadius: '8px',
                }}
              >
                请先选择预约日期
              </div>
            )}
          </div>

          {selectedDate && selectedTime && (
            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                background: '#fff0f6',
                borderRadius: '8px',
              }}
            >
              <p style={{ margin: 0, color: '#333' }}>
                您已选择：
                <span style={{ fontWeight: 'bold', color: '#ff85c0', marginLeft: '8px' }}>
                  {selectedDate.format('YYYY年MM月DD日')} {selectedTime}
                </span>
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetail;
