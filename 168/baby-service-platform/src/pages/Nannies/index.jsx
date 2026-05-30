import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Row, Col, Pagination, Card } from 'antd'
import NannyCard from '@/components/Common/NannyCard'
import EmptyState from '@/components/Common/EmptyState'
import { usePagination } from '@/hooks/usePagination'

const Nannies = () => {
  const { nannies } = useSelector(state => state.service)
  const { paginatedData, currentPage, total, pageSize, handlePageChange } = usePagination(nannies, 8)

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>找阿姨</h1>
          <p>为您精选优质母婴师</p>
        </div>
      </div>

      <div className="container page-content">
        {paginatedData.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {paginatedData.map(nanny => (
                <Col xs={24} sm={12} md={6} key={nanny.id}>
                  <NannyCard nanny={nanny} />
                </Col>
              ))}
            </Row>

            {total > pageSize && (
              <div style={{ marginTop: 32, textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 位母婴师`}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState description="暂无母婴师信息" />
        )}
      </div>
    </div>
  )
}

export default Nannies
