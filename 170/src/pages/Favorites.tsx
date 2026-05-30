import React, { useMemo } from 'react';
import { Row, Col, Button, Empty, message } from 'antd';
import { HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { toggleFavorite } from '../store/modules/user';
import { mockServices } from '../mock';
import ServiceCard from '../components/common/ServiceCard';
import EmptyState from '../components/common/EmptyState';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { favorites } = useAppSelector((state) => state.user);

  const favoriteServices = useMemo(() => {
    return mockServices.filter((service) => favorites.includes(service.id));
  }, [favorites]);

  const handleRemoveFavorite = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavorite(serviceId));
    message.success('已取消收藏');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>我的收藏</h2>
        <span style={{ color: '#999' }}>共 {favoriteServices.length} 个收藏</span>
      </div>

      {favoriteServices.length > 0 ? (
        <Row gutter={[16, 16]}>
          {favoriteServices.map((service) => (
            <Col span={6} key={service.id} style={{ position: 'relative' }}>
              <ServiceCard service={service} />
              <Button
                type="text"
                icon={<HeartFilled style={{ color: '#ff4d4f', fontSize: '20px' }} />}
                onClick={(e) => handleRemoveFavorite(service.id, e)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          description="暂无收藏的服务"
          actionText="去逛逛"
          actionPath="/services"
        />
      )}
    </div>
  );
};

export default Favorites;
