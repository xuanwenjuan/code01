import React from 'react'
import { Empty } from 'antd'

const EmptyState = ({ description = '暂无数据', image }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '60px 0'
    }}>
      <Empty description={description} image={image} />
    </div>
  )
}

export default EmptyState
