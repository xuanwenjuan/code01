import React from 'react'
import { Table, Pagination } from 'antd'
import Loading from './Loading'
import EmptyState from './EmptyState'

const DataTable = ({
  columns,
  dataSource,
  loading = false,
  pagination,
  onChange,
  emptyText = '暂无数据',
  ...rest
}) => {
  if (loading) {
    return <Loading tip="加载数据中..." />
  }

  if (!dataSource || dataSource.length === 0) {
    return <EmptyState description={emptyText} />
  }

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={pagination || false}
      onChange={onChange}
      rowKey="id"
      {...rest}
    />
  )
}

export default DataTable
