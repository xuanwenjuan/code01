import React from 'react'
import { Result, Button } from 'antd'

const ErrorMessage = ({
  status = 'error',
  title = '操作失败',
  subTitle = '请稍后重试或联系管理员',
  actionText = '重试',
  onAction,
}) => {
  return (
    <Result
      status={status}
      title={title}
      subTitle={subTitle}
      extra={
        actionText && onAction ? (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        ) : null
      }
    />
  )
}

export default ErrorMessage
