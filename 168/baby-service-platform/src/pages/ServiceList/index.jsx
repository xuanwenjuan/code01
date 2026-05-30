import React, { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Row, Col, Pagination, Card, Tag, Empty, Spin } from 'antd'
import {
  FilterOutlined, AppstoreOutlined, TagsOutlined,
  ArrowUpOutlined, ArrowDownOutlined, StarOutlined, EnvironmentOutlined
} from '@ant-design/icons'
import ServiceCard from '@/components/Common/ServiceCard'
import { usePagination } from '@/hooks/usePagination'

const priceRanges = [
  { label: '不限', value: [0, Infinity] },
  { label: '0-500元', value: [0, 500] },
  { label: '500-2000元', value: [500, 2000] },
  { label: '2000-5000元', value: [2000, 5000] },
  { label: '5000元以上', value: [5000, Infinity] }
]

const sortOptions = [
  { label: '综合排序', value: 'default', icon: <FilterOutlined /> },
  { label: '好评优先', value: 'rating', icon: <StarOutlined /> },
  { label: '距离最近', value: 'distance', icon: <EnvironmentOutlined /> },
  { label: '价格最低', value: 'price_asc', icon: <ArrowUpOutlined /> },
  { label: '价格最高', value: 'price_desc', icon: <ArrowDownOutlined /> }
]

const quickFilters = [
  { label: '限时特惠', field: 'originalPrice', operator: 'gt' },
  { label: '高评分', field: 'rating', operator: 'gte', value: 4.8 },
  { label: '距离近', field: 'distance', operator: 'lte', value: 3 }
]

const ServiceList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { services, categories } = useSelector(state => state.service)

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [priceRange, setPriceRange] = useState([0, Infinity])
  const [sortBy, setSortBy] = useState('default')
  const [activeQuickFilters, setActiveQuickFilters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setSelectedCategory(category)
    }
  }, [searchParams])

  const filteredServices = useMemo(() => {
    let result = [...services]

    if (selectedCategory) {
      result = result.filter(s => s.categoryId === Number(selectedCategory))
    }

    result = result.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1])

    activeQuickFilters.forEach(filter => {
      switch (filter.field) {
        case 'originalPrice':
          result = result.filter(s => s.originalPrice > s.price)
          break
        case 'rating':
          result = result.filter(s => s.rating >= filter.value)
          break
        case 'distance':
          result = result.filter(s => s.distance <= filter.value)
          break
        default:
          break
      }
    })

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'distance':
        result.sort((a, b) => a.distance - b.distance)
        break
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      default:
        result.sort((a, b) => b.sales - a.sales)
        break
    }

    return result
  }, [services, selectedCategory, priceRange, sortBy, activeQuickFilters])

  const { paginatedData, currentPage, total, pageSize, handlePageChange } = usePagination(filteredServices, 8)

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (categoryId) {
      searchParams.set('category', categoryId)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const toggleQuickFilter = (index) => {
    if (activeQuickFilters.includes(index)) {
      setActiveQuickFilters(activeQuickFilters.filter(i => i !== index))
    } else {
      setActiveQuickFilters([...activeQuickFilters, index])
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="container">
            <h1>服务列表</h1>
            <p>为您精选优质母婴服务</p>
          </div>
        </div>
        <div className="container page-content">
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>服务列表</h1>
          <p>为您精选优质母婴服务</p>
        </div>
      </div>

      <div className="container page-content">
        <Card className="card-shadow filter-card" style={{ marginBottom: 24 }}>
          <div className="filter-section">
            <div className="filter-label">
              <TagsOutlined style={{ marginRight: 8 }} />
              服务类型
            </div>
            <div className="filter-tags">
              <Tag
                className={`filter-tag ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategoryChange(null)}
              >
                全部
              </Tag>
              {categories.map(cat => (
                <Tag
                  key={cat.id}
                  className={`filter-tag ${selectedCategory == cat.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.icon} {cat.name}
                </Tag>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">
              <FilterOutlined style={{ marginRight: 8 }} />
              价格区间
            </div>
            <div className="filter-tags">
              {priceRanges.map((range, index) => (
                <Tag
                  key={index}
                  className={`filter-tag ${priceRange[0] === range.value[0] && priceRange[1] === range.value[1] ? 'active' : ''}`}
                  onClick={() => setPriceRange(range.value)}
                >
                  {range.label}
                </Tag>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">
              <AppstoreOutlined style={{ marginRight: 8 }} />
              排序方式
            </div>
            <div className="filter-tags">
              {sortOptions.map(option => (
                <Tag
                  key={option.value}
                  className={`filter-tag ${sortBy === option.value ? 'active' : ''}`}
                  onClick={() => setSortBy(option.value)}
                >
                  {option.icon} {option.label}
                </Tag>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-label">
              <StarOutlined style={{ marginRight: 8 }} />
              快速筛选
            </div>
            <div className="filter-tags">
              {quickFilters.map((filter, index) => (
                <Tag
                  key={index}
                  className={`filter-tag ${activeQuickFilters.includes(index) ? 'active' : ''}`}
                  onClick={() => toggleQuickFilter(index)}
                >
                  {filter.label}
                </Tag>
              ))}
            </div>
          </div>
        </Card>

        <div className="result-header">
          <span>
            共找到 <span className="highlight">{total}</span> 个服务
          </span>
          {activeQuickFilters.length > 0 && (
            <Tag
              className="clear-filter-tag"
              onClick={() => setActiveQuickFilters([])}
            >
              清除筛选
            </Tag>
          )}
        </div>

        {paginatedData.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {paginatedData.map(service => (
                <Col xs={24} sm={12} md={6} key={service.id}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>

            {total > pageSize && (
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            )}
          </>
        ) : (
          <Card className="card-shadow">
            <Empty
              description="没有找到符合条件的服务"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Tag
                className="clear-filter-tag"
                onClick={() => {
                  setSelectedCategory(null)
                  setPriceRange([0, Infinity])
                  setSortBy('default')
                  setActiveQuickFilters([])
                }}
              >
                清除所有筛选条件
              </Tag>
            </Empty>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ServiceList
