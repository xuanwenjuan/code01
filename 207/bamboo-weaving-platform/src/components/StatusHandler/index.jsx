import React from 'react'
import { Spin, Empty, Result, Button } from 'antd'

const StatusHandler = ({ 
  status, 
  error, 
  data, 
  children, 
  emptyText = '暂无数据', 
  loadingText = '加载中...',
  onRetry 
}) => {
  if (status === 'loading') {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        gap: '16px'
      }}>
        <Spin size="large" />
        <div style={{ color: '#666' }}>{loadingText}</div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error || '请稍后重试'}
        extra={onRetry && (
          <Button type="primary" onClick={onRetry}>
            重新加载
          </Button>
        )}
      />
    )
  }

  if (status === 'succeeded' && (!data || (Array.isArray(data) && data.length === 0))) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        <Empty description={emptyText} />
      </div>
    )
  }

  return children
}

export default StatusHandler
