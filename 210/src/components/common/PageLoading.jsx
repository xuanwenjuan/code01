import React from 'react'
import { Spin, Typography } from 'antd'

const { Text } = Typography

const PageLoading = ({ tip = '加载中...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: '16px',
    }}>
      <Spin size="large" />
      <Text type="secondary">{tip}</Text>
    </div>
  )
}

export default PageLoading
