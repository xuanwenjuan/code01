import React from 'react'
import { Empty, Spin, Alert } from 'antd'

const StatusPage = ({ type, message, description }) => {
  if (type === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '100px 0',
        background: '#fff',
        borderRadius: 8
      }}>
        <Spin size="large" tip={message || '加载中...'} />
      </div>
    )
  }

  if (type === 'empty') {
    return (
      <div style={{ 
        background: '#fff', 
        padding: '60px 0', 
        borderRadius: 8,
        textAlign: 'center'
      }}>
        <Empty description={description || '暂无数据'} />
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message={message || '加载失败'}
          description={description || '请稍后重试'}
          type="error"
          showIcon
        />
      </div>
    )
  }

  return null
}

export default StatusPage
