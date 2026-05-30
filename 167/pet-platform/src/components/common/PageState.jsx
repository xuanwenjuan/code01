import React from 'react'
import { Empty, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const PageState = ({ loading, error, data, children, emptyText = '暂无数据' }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
      </div>
    )
  }

  if (error) {
    return (
      <Empty
        description={error.message || '加载失败'}
        style={{ padding: '60px 0' }}
      />
    )
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Empty
        description={emptyText}
        style={{ padding: '60px 0' }}
      />
    )
  }

  return children
}

export default PageState
