import React from 'react'
import { Empty, Button } from 'antd'

const EmptyState = ({ description = '暂无数据', actionText, onAction }) => {
  return (
    <div className="empty-state">
      <Empty
        description={description}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
      {actionText && onAction && (
        <Button type="primary" onClick={onAction} style={{ marginTop: 16 }}>
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
