import React, { useMemo } from 'react';
import { Carousel, Row, Col, Card, Tag, Button, Statistic } from 'antd';
import { RightOutlined, FireOutlined, StarOutlined, UserOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import NewUserModal from '../components/business/NewUserModal';
import ServiceCard from '../components/common/ServiceCard';
import TechnicianCard from '../components/common/TechnicianCard';
import { mockBanners, mockCategories, mockServices, mockTechnicians, mockActivities } from '../mock';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const hotServices = useMemo(() => {
    return [...mockServices].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);
  }, []);

  const topTechnicians = useMemo(() => {
    return [...mockTechnicians].sort((a, b) => b.rating - a.rating).slice(0, 4);
  }, []);

  const stats = useMemo(() => {
    return {
      services: mockServices.length,
      technicians: mockTechnicians.length,
      orders: 98765,
      rating: 4.9,
    };
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <NewUserModal />

      <Carousel
        autoplay
        effect="fade"
        style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
      >
        {mockBanners.map((banner) => (
          <div key={banner.id}>
            <img
              src={banner.image}
              alt={banner.title}
              style={{ width: '100%', height: '360px', objectFit: 'cover' }}
            />
          </div>
        ))}
      </Carousel>

      <Card
        style={{ marginBottom: '32px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[16, 16]}>
          {mockCategories.map((category) => (
            <Col xs={12} sm={6} key={category.id}>
              <Card
                hoverable
                style={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '24px 16px' }}
                onClick={() => navigate(`/services?category=${category.type}`)}
              >
                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                    lineHeight: 1,
                  }}
                >
                  {category.icon}
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    color: '#333',
                    marginBottom: '4px',
                  }}
                >
                  {category.name}
                </div>
                <div style={{ color: '#999', fontSize: '12px' }}>
                  {category.name === '美甲' && '专业美甲服务'}
                  {category.name === '美睫' && '精致美睫护理'}
                  {category.name === '手足护理' && '全方位手足SPA'}
                  {category.name === '美甲师' && '查看更多美甲师'}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        style={{
          marginBottom: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          background: 'linear-gradient(135deg, #fff0f6 0%, #fff 100%)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: '#ff85c0',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <ThunderboltOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <Statistic title="精选服务" value={stats.services} suffix="个" valueStyle={{ color: '#ff85c0' }} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: '#9254de',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <Statistic title="专业美甲师" value={stats.technicians} suffix="位" valueStyle={{ color: '#9254de' }} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: '#52c41a',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <StarOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <Statistic title="用户好评率" value={stats.rating} precision={1} suffix="分" valueStyle={{ color: '#52c41a' }} />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  background: '#fa8c16',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <FireOutlined style={{ fontSize: '24px', color: '#fff' }} />
              </div>
              <Statistic title="已服务订单" value={stats.orders} valueStyle={{ color: '#fa8c16' }} />
            </div>
          </Col>
        </Row>
      </Card>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#333',
            }}
          >
            <FireOutlined style={{ color: '#ff4d4f' }} />
            限时优惠活动
          </h2>
          <Button
            type="text"
            onClick={() => navigate('/services')}
            style={{ color: '#ff85c0', fontSize: '14px' }}
          >
            查看全部活动 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {mockActivities.map((activity) => (
            <Col xs={24} sm={12} md={8} key={activity.id}>
              <Card
                hoverable
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                bodyStyle={{ padding: '0' }}
              >
                <img
                  src={activity.image}
                  alt={activity.title}
                  style={{ height: '180px', objectFit: 'cover', width: '100%' }}
                />
                <div style={{ padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: '#333',
                    }}
                  >
                    {activity.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag
                      color="red"
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        padding: '2px 8px',
                      }}
                    >
                      {activity.discount}
                    </Tag>
                    <span style={{ color: '#999', fontSize: '12px' }}>
                      截止至 {activity.endTime}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
            🔥 热门服务推荐
          </h2>
          <Button
            type="text"
            onClick={() => navigate('/services')}
            style={{ color: '#ff85c0', fontSize: '14px' }}
          >
            查看更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {hotServices.map((service) => (
            <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
              <ServiceCard service={service} />
            </Col>
          ))}
        </Row>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#333' }}>
            👩‍🎨 优质美甲师
          </h2>
          <Button
            type="text"
            onClick={() => navigate('/services')}
            style={{ color: '#ff85c0', fontSize: '14px' }}
          >
            查看更多 <RightOutlined />
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {topTechnicians.map((technician) => (
            <Col xs={24} sm={12} md={8} lg={6} key={technician.id}>
              <TechnicianCard technician={technician} />
            </Col>
          ))}
        </Row>
      </div>

      <Card
        style={{
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
          boxShadow: '0 4px 16px rgba(255, 133, 192, 0.3)',
        }}
        bodyStyle={{ padding: '32px', textAlign: 'center' }}
      >
        <h2
          style={{
            color: '#fff',
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '12px',
          }}
        >
          专业美甲美睫 · 上门服务
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', marginBottom: '24px' }}>
          专业美甲师上门服务，省时省力，品质保证
        </p>
        <Button
          size="large"
          onClick={() => navigate('/services')}
          style={{
            background: '#fff',
            color: '#ff6b9d',
            border: 'none',
            borderRadius: '24px',
            height: '44px',
            padding: '0 32px',
            fontSize: '15px',
            fontWeight: 'bold',
          }}
        >
          立即预约服务
        </Button>
      </Card>
    </div>
  );
};

export default Home;
