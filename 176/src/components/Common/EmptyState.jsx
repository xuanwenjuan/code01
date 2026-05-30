import React from 'react'
import { Empty, Button } from 'antd'

const EmptyState = ({
  description = '暂无数据',
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
      }}
    >
      <Empty description={description} image={image}>
        {actionText && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
