import React from 'react'
import { Spin } from 'antd'

const Loading = ({ text = '加载中...', size = 'large' }) => {
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
      <Spin size={size} />
      <p style={{ marginTop: '16px', color: '#999' }}>{text}</p>
    </div>
  )
}

export default Loading
