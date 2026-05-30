import React from 'react'
import { Empty, Spin } from 'antd'

const PageContainer = ({ loading, children, empty, emptyText = '暂无数据' }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (empty) {
    return (
      <div style={{ padding: '60px 0' }}>
        <Empty description={emptyText} />
      </div>
    )
  }

  return children
}

export default PageContainer
