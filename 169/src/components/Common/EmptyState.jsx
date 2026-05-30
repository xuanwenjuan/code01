import React from 'react'
import { Empty, Button } from 'antd'

const EmptyState = ({ description = '暂无数据', onAction, actionText = '去看看' }) => {
  return (
    <div className="empty-state">
      <Empty
        description={description}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        {onAction && (
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  )
}

export default EmptyState
