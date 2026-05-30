import React, { useState, useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Row, Col, Card, Radio, Slider, Pagination, Input, Button, Space, Tag, Breadcrumb, Divider,
} from 'antd'
import {
  SearchOutlined, HomeOutlined, AppstoreOutlined, ReloadOutlined,
} from '@ant-design/icons'
import ServiceCard from '@/components/common/ServiceCard'
import PageState from '@/components/common/PageState'
import { setFilters, setPagination } from '@/store/slices/serviceSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { useLoading } from '@/hooks/useLoading'

const { Search } = Input

const ServiceList = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { services, categories, filters, pagination } = useSelector((state) => state.service)
  const { currentCity } = useSelector((state) => state.app)
  const { loading } = useLoading(false)
  const [searchText, setSearchText] = useState(searchParams.get('keyword') || '')
  const debouncedSearch = useDebounce(searchText, 300)

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      dispatch(setFilters({ category: categoryParam }))
    }
  }, [searchParams, dispatch])

  const filteredServices = useMemo(() => {
    let result = [...services]

    if (filters.category && filters.category !== 'all') {
      result = result.filter((s) => s.category === filters.category)
    }

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword)
      )
    }

    if (filters.priceRange) {
      result = result.filter(
        (s) => s.price >= filters.priceRange[0] && s.price <= filters.priceRange[1]
      )
    }

    if (filters.sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (filters.sortBy === 'sales') {
      result.sort((a, b) => b.sales - a.sales)
    } else if (filters.sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance)
    }

    return result
  }, [services, filters, debouncedSearch])

  const paginatedServices = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    return filteredServices.slice(start, start + pagination.pageSize)
  }, [filteredServices, pagination])

  const handleCategoryChange = (e) => {
    dispatch(setFilters({ category: e.target.value }))
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handlePriceChange = (value) => {
    dispatch(setFilters({ priceRange: value }))
  }

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }))
  }

  const handlePageChange = (page, pageSize) => {
    dispatch(setPagination({ current: page, pageSize }))
  }

  const handleReset = () => {
    setSearchText('')
    dispatch(setFilters({
      category: 'all',
      priceRange: [0, 500],
      sortBy: 'default',
      searchKeyword: '',
    }))
    dispatch(setPagination({ current: 1, pageSize: 8 }))
  }

  const getCategoryName = (categoryId) => {
    if (categoryId === 'all') return '全部服务'
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : '全部服务'
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}><HomeOutlined /> 首页</span> },
              { title: <span style={{ color: '#fff' }}><AppstoreOutlined /> {getCategoryName(filters.category)}</span> },
            ]}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}
          />
          <h1 style={{ color: '#fff', fontSize: 28, margin: 0 }}>{getCategoryName(filters.category)}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, marginBottom: 0 }}>
            <span style={{ marginRight: 24 }}>📍 {currentCity}</span>
            <span>为您找到 {filteredServices.length} 个优质服务</span>
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: 40 }}>
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={[16, 20]}>
            <Col xs={24} lg={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#666', fontWeight: 500, whiteSpace: 'nowrap' }}>🔍 搜索：</span>
                <Search
                  placeholder="搜索服务名称或描述"
                  allowClear
                  enterButton
                  size="large"
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  style={{ flex: 1 }}
                />
              </div>
            </Col>
            <Col xs={24} lg={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#666', fontWeight: 500, whiteSpace: 'nowrap' }}>📋 服务类型：</span>
                <Radio.Group
                  value={filters.category}
                  onChange={handleCategoryChange}
                  optionType="button"
                  buttonStyle="solid"
                  size="large"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  {categories.slice(0, 7).map((cat) => (
                    <Radio.Button key={cat.id} value={cat.id}>
                      {cat.name}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '20px 0' }} />

          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: '#666', fontWeight: 500, whiteSpace: 'nowrap' }}>💰 价格区间：</span>
                <div style={{ flex: 1, maxWidth: 350 }}>
                  <Slider
                    range
                    min={0}
                    max={500}
                    step={10}
                    value={filters.priceRange}
                    onChange={handlePriceChange}
                    tooltip={{ formatter: (value) => `¥${value}` }}
                  />
                </div>
                <Tag color="orange" style={{ margin: 0, fontSize: 14, padding: '4px 12px' }}>
                  ¥{filters.priceRange[0]} - ¥{filters.priceRange[1]}
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                <span style={{ color: '#666', fontWeight: 500 }}>📊 排序：</span>
                <Radio.Group
                  value={filters.sortBy}
                  onChange={handleSortChange}
                  optionType="button"
                  size="large"
                >
                  <Radio.Button value="default">默认</Radio.Button>
                  <Radio.Button value="sales">销量优先</Radio.Button>
                  <Radio.Button value="rating">好评优先</Radio.Button>
                  <Radio.Button value="priceAsc">价格升序</Radio.Button>
                  <Radio.Button value="priceDesc">价格降序</Radio.Button>
                  <Radio.Button value="distance">距离最近</Radio.Button>
                </Radio.Group>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  size="large"
                >
                  重置
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#666' }}>
            共找到 <span style={{ color: '#ff6b35', fontWeight: 'bold', fontSize: 18 }}>{filteredServices.length}</span> 个服务
          </div>
          <div style={{ color: '#999', fontSize: 13 }}>
            显示第 {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, filteredServices.length)} 条
          </div>
        </div>

        <PageState loading={loading} data={paginatedServices} emptyText="暂无符合条件的服务，试试调整筛选条件吧~">
          <Row gutter={[16, 16]}>
            {paginatedServices.map((service) => (
              <Col xs={24} sm={12} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>
        </PageState>

        {filteredServices.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={filteredServices.length}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条服务`}
              size="large"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceList
