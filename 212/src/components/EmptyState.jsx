import React from 'react'
import { Empty, Button } from 'antd'

const EmptyState = ({
  description = '暂无数据',
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  showAction = false,
  actionText = '刷新',
  onAction
}) => {
  return (
    <Empty
      image={image}
      description={description}
      style={{ padding: '60px 0' }}
    >
      {showAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  )
}

export default EmptyState
