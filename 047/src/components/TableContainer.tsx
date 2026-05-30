import React from 'react'
import { Table, TableProps, Spin, Empty } from 'antd'

interface TableContainerProps<T> extends TableProps<T> {
  loading?: boolean
  emptyText?: string
  virtual?: boolean
  scrollY?: number
}

function TableContainer<T extends Record<string, unknown>>({
  loading = false,
  emptyText = '暂无数据',
  virtual = false,
  scrollY = 500,
  columns,
  dataSource,
  pagination,
  ...rest
}: TableContainerProps<T>) {
  return (
    <Spin spinning={loading} tip="加载中...">
      <Table<T>
        columns={columns}
        dataSource={dataSource}
        pagination={pagination || {
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          size: 'default',
          showLessItems: true,
        }}
        locale={{
          emptyText: <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        size="small"
        scroll={{
          x: 1000,
          y: virtual ? scrollY : undefined,
        }}
        virtual={virtual}
        {...rest}
      />
    </Spin>
  )
}

export default TableContainer
