import React, { useEffect, useMemo } from 'react'
import { Row, Col, Select, Slider, Radio, Pagination, Space, Button } from 'antd'
import { FilterOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import ServiceCard from '@/components/Common/ServiceCard'
import EmptyState from '@/components/Common/EmptyState'
import { setFilters, setCurrentPage } from '@/store/slices/serviceSlice'
import { categories } from '@/mock/data'
import { useNavigate } from 'react-router-dom'

const { Option } = Select

const ServiceList = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { filteredServices, filters, pagination } = useSelector((state) => state.service)

  useEffect(() => {
    if (location.state?.category) {
      dispatch(setFilters({ category: location.state.category }))
    }
  }, [location.state, dispatch])

  const handleCategoryChange = (value) => {
    dispatch(setFilters({ category: value }))
  }

  const handlePriceChange = (value) => {
    dispatch(setFilters({ priceRange: value }))
  }

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }))
  }

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page))
  }

  const handleReset = () => {
    dispatch(
      setFilters({
        category: 'all',
        priceRange: [0, 10000],
        sortBy: 'default'
      })
    )
  }

  const paginatedServices = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredServices.slice(start, end)
  }, [filteredServices, pagination.current, pagination.pageSize])

  const marks = {
    0: '¥0',
    200: '¥200',
    500: '¥500',
    1000: '¥1000',
    2000: '¥2000',
    5000: '¥5000',
    10000: '¥10000+'
  }

  return (
    <div className="service-list-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">维修服务列表</h1>
          <p className="page-subtitle">共找到 {pagination.total} 个服务</p>
        </div>

        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">
              <FilterOutlined /> 服务类型：
            </span>
            <Select
              value={filters.category}
              onChange={handleCategoryChange}
              style={{ width: 200 }}
            >
              <Option value="all">全部</Option>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-row">
            <span className="filter-label">价格区间：</span>
            <div className="price-slider">
              <Slider
                range
                min={0}
                max={10000}
                step={50}
                marks={marks}
                value={filters.priceRange}
                onChange={handlePriceChange}
                style={{ width: 500 }}
              />
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">
              <SortAscendingOutlined /> 排序方式：
            </span>
            <Radio.Group value={filters.sortBy} onChange={handleSortChange}>
              <Radio.Button value="default">默认排序</Radio.Button>
              <Radio.Button value="price-asc">价格从低到高</Radio.Button>
              <Radio.Button value="price-desc">价格从高到低</Radio.Button>
              <Radio.Button value="rating">好评优先</Radio.Button>
              <Radio.Button value="distance">距离最近</Radio.Button>
            </Radio.Group>
            <Button onClick={handleReset} style={{ marginLeft: 16 }}>
              重置筛选
            </Button>
          </div>
        </div>

        {filteredServices.length > 0 ? (
          <>
            <Row gutter={[16, 16]} className="service-grid">
              {paginatedServices.map((service) => (
                <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>

            <div className="pagination-wrapper">
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total) => `共 ${total} 条记录`}
              />
            </div>
          </>
        ) : (
          <EmptyState
            description="没有找到符合条件的服务"
            actionText="去首页看看"
            onAction={() => navigate('/')}
          />
        )}
      </div>
    </div>
  )
}

export default ServiceList
