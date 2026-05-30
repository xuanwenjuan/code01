import React from 'react'
import { Empty, Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const EmptyState = ({ 
  description = '暂无数据', 
  showAction = false, 
  actionText = '去看看',
  actionPath = '/'
}) => {
  const navigate = useNavigate()

  return (
    <Empty
      description={description}
      style={{ padding: '60px 0' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    >
      {showAction && (
        <Button type="primary" onClick={() => navigate(actionPath)}>
          {actionText}
        </Button>
      )}
    </Empty>
  )
}

export default EmptyState
