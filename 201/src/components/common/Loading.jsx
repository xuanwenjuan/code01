import React from 'react'
import { Spin } from 'antd'

function Loading({ size = 'large', tip = '加载中...' }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <Spin size={size} tip={tip} />
    </div>
  )
}

export default Loading
