import React from 'react'
import { Result, Button } from 'antd'

const ErrorState = ({ message = '加载失败', onRetry }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '60px 0'
    }}>
      <Result
        status="error"
        title="错误"
        subTitle={message}
        extra={onRetry && (
          <Button type="primary" onClick={onRetry}>
            重新加载
          </Button>
        )}
      />
    </div>
  )
}

export default ErrorState
