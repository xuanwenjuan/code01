import React from 'react'
import { Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

function ErrorBlock({ message = '加载失败', onRetry }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      padding: '40px'
    }}>
      <Result
        status="error"
        title="错误"
        subTitle={message}
        extra={onRetry && (
          <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
            重试
          </Button>
        )}
      />
    </div>
  )
}

export default ErrorBlock
