import React from 'react'
import { Modal, Button, Space } from 'antd'
import { GiftOutlined } from '@ant-design/icons'

const NewUserModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={400}
      centered
      className="new-user-modal"
    >
      <div className="new-user-content">
        <div className="new-user-header">
          <GiftOutlined className="gift-icon" />
          <h2>新用户专享福利</h2>
        </div>
        <div className="new-user-body">
          <div className="coupon-card">
            <div className="coupon-amount">
              <span className="currency">¥</span>
              <span className="amount">50</span>
            </div>
            <div className="coupon-info">
              <p className="coupon-title">首单立减券</p>
              <p className="coupon-desc">满100元可用</p>
            </div>
          </div>
          <p className="tips">注册登录后即可使用，有效期至2024年12月31日</p>
        </div>
        <div className="new-user-footer">
          <Space>
            <Button onClick={onClose}>稍后再说</Button>
            <Button type="primary" onClick={onClose}>
              立即领取
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  )
}

export default NewUserModal
