import React from 'react'
import { Empty, Button } from 'antd'

const EmptyState = ({
  description = '暂无数据',
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  actionText,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      padding: '40px',
    }}>
      <Empty
        image={image}
        description={description}
      >
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
