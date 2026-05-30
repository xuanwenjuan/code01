import React from 'react'
import { Empty } from 'antd'

function EmptyData({ description = '暂无数据', image }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      padding: '40px'
    }}>
      <Empty
        description={description}
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  )
}

export default EmptyData
