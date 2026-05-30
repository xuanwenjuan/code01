import React from 'react'
import { Spin } from 'antd'

const Loading = ({ tip = '加载中...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px'
    }}>
      <Spin size="large" />
      <p style={{ marginTop: 16, color: '#999' }}>{tip}</p>
    </div>
  )
}

export default Loading
