import React from 'react'
import { Spin } from 'antd'

const LoadingWrapper = ({ loading, children, tip = '加载中...' }) => {
  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <Spin tip={tip} size="large" />
      </div>
    )
  }
  return children
}

export default LoadingWrapper
