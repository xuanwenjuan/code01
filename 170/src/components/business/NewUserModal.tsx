import React from 'react';
import { Modal, Button, Card } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../store';
import { setShowNewUserModal } from '../../store/modules/app';

const NewUserModal: React.FC = () => {
  const { showNewUserModal } = useAppSelector((state) => state.app);
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(setShowNewUserModal(false));
  };

  return (
    <Modal
      open={showNewUserModal}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      closeIcon={null}
    >
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎀</div>
        <h2 style={{ marginBottom: '8px', color: '#ff85c0' }}>新用户专享福利</h2>
        <p style={{ color: '#999', marginBottom: '24px' }}>注册即送50元优惠券，首单立减</p>

        <Card
          style={{
            background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
            borderRadius: '12px',
            border: 'none',
            marginBottom: '24px',
          }}
          bodyStyle={{ padding: '24px', color: '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>¥50</div>
              <div style={{ opacity: 0.9 }}>新人专享优惠券</div>
            </div>
            <GiftOutlined style={{ fontSize: '48px', opacity: 0.8 }} />
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.8 }}>
            满199元可用 | 有效期至2026年12月31日
          </div>
        </Card>

        <Button
          type="primary"
          size="large"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)',
            border: 'none',
            height: '48px',
            fontSize: '16px',
            borderRadius: '24px',
          }}
          onClick={handleClose}
        >
          立即领取
        </Button>

        <div
          style={{ marginTop: '16px', color: '#999', cursor: 'pointer' }}
          onClick={handleClose}
        >
          稍后再说
        </div>
      </div>
    </Modal>
  );
};

export default NewUserModal;
