import React from 'react'
import { Spin } from 'antd'

const LoadingState = ({ tip = '加载中...' }) => {
  return (
    <div className="loading-state">
      <div style={{ textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 12, color: '#999' }}>{tip}</div>
      </div>
    </div>
  )
}

export default React.memo(LoadingState)
