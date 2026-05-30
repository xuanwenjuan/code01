import React from 'react'
import { Empty as AntEmpty, Button } from 'antd'
import './index.scss'

const Empty = ({
  description = '暂无数据',
  image,
  action,
  actionText,
  onActionClick,
  fullHeight = true,
  className = ''
}) => {
  return (
    <div className={`empty-wrapper ${fullHeight ? 'full-height' : ''} ${className}`}>
      <AntEmpty
        description={description}
        image={image || AntEmpty.PRESENTED_IMAGE_SIMPLE}
      >
        {action && actionText && onActionClick && (
          <Button type="primary" onClick={onActionClick}>
            {actionText}
          </Button>
        )}
      </AntEmpty>
    </div>
  )
}

export default React.memo(Empty)
