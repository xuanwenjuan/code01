import React from 'react';
import { Card, Tag, Rate, Avatar, Button } from 'antd';
import { EyeOutlined, ShoppingCartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Service, Technician } from '../../types';
import { formatPrice } from '../../utils';
import { mockTechnicians } from '../../mock';

interface ServiceCardProps {
  service: Service;
  showTechnician?: boolean;
}

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

const ServiceCard: React.FC<ServiceCardProps> = ({ service, showTechnician = true }) => {
  const navigate = useNavigate();
  const technician = mockTechnicians.find((t) => t.id === service.technicianId) as Technician;

  const handleClick = () => {
    navigate(`/service/${service.id}`);
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/service/${service.id}`);
  };

  return (
    <Card
      hoverable
      onClick={handleClick}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        height: '100%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
      }}
      bodyStyle={{ padding: '16px' }}
      cover={
        <div style={{ position: 'relative' }}>
          <img
            alt={service.name}
            src={service.images[0]}
            style={{ height: '200px', objectFit: 'cover', width: '100%' }}
          />
          <Tag
            color={categoryColors[service.category]}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              margin: 0,
              borderRadius: '4px',
            }}
          >
            {categoryLabels[service.category]}
          </Tag>
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {service.duration}分钟
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0,
              color: '#333',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {service.name}
          </h3>
        </div>

        <div style={{ marginBottom: '8px' }}>
          {service.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} style={{ marginRight: '4px', marginBottom: '4px' }}>
              {tag}
            </Tag>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Rate disabled value={service.rating} allowHalf style={{ fontSize: '12px' }} />
          <span style={{ marginLeft: '6px', color: '#ff85c0', fontSize: '12px', fontWeight: '500' }}>
            {service.rating}
          </span>
          <span style={{ marginLeft: '8px', color: '#999', fontSize: '12px' }}>
            {service.reviewCount}条评价
          </span>
          <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>
            已售 {service.salesCount}
          </span>
        </div>

        {showTechnician && technician && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <Avatar src={technician.avatar} size={24} />
            <span style={{ marginLeft: '8px', fontSize: '13px', color: '#666' }}>
              {technician.name}
            </span>
            <span style={{ marginLeft: '6px', color: '#999', fontSize: '12px' }}>
              {technician.title}
            </span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span
              style={{
                fontSize: '24px',
                color: '#ff4d4f',
                fontWeight: 'bold',
                lineHeight: 1,
              }}
            >
              {formatPrice(service.price)}
            </span>
            <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '12px' }}>
              {formatPrice(service.originalPrice)}
            </span>
            <Tag color="red" style={{ margin: 0, padding: '0 4px', fontSize: '11px' }}>
              省{service.originalPrice - service.price}元
            </Tag>
          </div>
          <Button
            type="primary"
            size="small"
            icon={<ShoppingCartOutlined />}
            onClick={handleBook}
            style={{
              background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
              border: 'none',
              borderRadius: '16px',
              height: '28px',
              padding: '0 12px',
            }}
          >
            预约
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
