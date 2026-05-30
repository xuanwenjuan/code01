import React from 'react'
import { Result, Button } from 'antd'
import { WarningOutlined } from '@ant-design/icons'

const ErrorState = ({
  status = 'error',
  title = '加载失败',
  subTitle = '抱歉，数据加载出现问题，请稍后重试',
  showRetry = true,
  retryText = '重试',
  onRetry
}) => {
  return (
    <Result
      status={status}
      icon={<WarningOutlined />}
      title={title}
      subTitle={subTitle}
      extra={
        showRetry && (
          <Button type="primary" onClick={onRetry}>
            {retryText}
          </Button>
        )
      }
    />
  )
}

export default ErrorState
