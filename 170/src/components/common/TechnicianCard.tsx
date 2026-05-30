import React from 'react';
import { Card, Tag, Rate, Button } from 'antd';
import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Technician } from '../../types';
import { formatPrice } from '../../utils';

interface TechnicianCardProps {
  technician: Technician;
  showAction?: boolean;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({ technician, showAction = true }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/services?technician=${technician.id}`);
  };

  return (
    <Card hoverable onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <img
          src={technician.avatar}
          alt={technician.name}
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{technician.name}</span>
            <Tag color="purple" style={{ marginLeft: '8px' }}>
              {technician.title}
            </Tag>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Rate disabled value={technician.rating} allowHalf style={{ fontSize: '12px' }} />
            <span style={{ marginLeft: '8px', color: '#999' }}>
              {technician.rating} ({technician.orderCount}单)
            </span>
          </div>
          <div style={{ marginBottom: '8px', color: '#666' }}>
            <UserOutlined style={{ marginRight: '4px' }} />
            {technician.experience}年经验
            <EnvironmentOutlined style={{ marginLeft: '16px', marginRight: '4px' }} />
            {technician.distance}km
          </div>
          <div style={{ marginBottom: '8px' }}>
            {technician.tags.map(tag => (
              <Tag key={tag} color="blue" style={{ marginRight: '4px' }}>
                {tag}
              </Tag>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ff4d4f', fontSize: '18px', fontWeight: 'bold' }}>
              起 {formatPrice(technician.price)}
            </span>
            {showAction && (
              <Button type="primary" size="small" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
                查看服务
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TechnicianCard;
