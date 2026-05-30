import React from 'react'
import { Spin } from 'antd'

const LoadingState = ({ text = '加载中...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 0'
    }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, color: '#666' }}>{text}</div>
    </div>
  )
}

export default LoadingState
