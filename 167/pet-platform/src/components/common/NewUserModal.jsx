import React, { useState } from 'react'
import { Modal, Button, Carousel, Space } from 'antd'
import { GiftOutlined, CloseOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { closeNewUserModal } from '@/store/slices/appSlice'

const NewUserModal = () => {
  const dispatch = useDispatch()
  const { showNewUserModal } = useSelector((state) => state.app)

  const handleClose = () => {
    dispatch(closeNewUserModal())
  }

  const coupons = [
    { id: 1, value: 50, min: 200, desc: '满200可用' },
    { id: 2, value: 30, min: 100, desc: '满100可用' },
    { id: 3, value: 20, min: 0, desc: '无门槛' },
  ]

  return (
    <Modal
      open={showNewUserModal}
      footer={null}
      closable={false}
      width={420}
      centered
      styles={{
        mask: { backgroundColor: 'rgba(0,0,0,0.7)' },
        body: { padding: 0 },
      }}
    >
      <div style={{ position: 'relative', background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)', borderRadius: '8px' }}>
        <Button
          type="text"
          icon={<CloseOutlined style={{ color: '#fff', fontSize: '20px' }} />}
          onClick={handleClose}
          style={{ position: 'absolute', right: 8, top: 8, zIndex: 10 }}
        />

        <div style={{ padding: '30px 24px 24px', textAlign: 'center', color: '#fff' }}>
          <GiftOutlined style={{ fontSize: '48px', marginBottom: 16 }} />
          <h2 style={{ color: '#fff', marginBottom: 8, fontSize: '24px' }}>新用户专享福利</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>注册即送100元优惠券礼包</p>

          <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff6b35' }}>¥{coupon.value}</span>
                  <span style={{ color: '#666', marginLeft: 8 }}>{coupon.desc}</span>
                </div>
                <Button type="primary" size="small" style={{ background: '#ff6b35', borderColor: '#ff6b35' }}>
                  领取
                </Button>
              </div>
            ))}
          </Space>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleClose}
            style={{
              background: '#fff',
              borderColor: '#fff',
              color: '#ff6b35',
              fontWeight: 'bold',
              height: '44px',
              fontSize: '16px',
            }}
          >
            立即领取
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default NewUserModal
