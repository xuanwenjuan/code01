import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Row, Col, Pagination, Button, Space, Radio, Card, Breadcrumb, Tag } from 'antd'
import { HomeOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import ServiceCard from '@/components/Common/ServiceCard'
import EmptyState from '@/components/Common/EmptyState'
import Loading from '@/components/Common/Loading'
import { usePagination } from '@/hooks/usePagination'
import { useFilter } from '@/hooks/useFilter'
import { setFilterParams } from '@/store/slices/serviceSlice'
import { mockPriceRanges, mockSortOptions, mockCategories } from '@/mock/data'
import * as Icons from '@ant-design/icons'
import './style.css'

const ServiceList = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { services, categories, filterParams, loading } = useSelector(state => state.service)

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedPriceRange, setSelectedPriceRange] = useState([])
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  const filteredServices = useFilter(services, {
    category: selectedCategory,
    priceRange: selectedPriceRange
  }, sortBy)

  const { paginatedData, current, pageSize, total, handlePageChange } = usePagination(filteredServices, 8)

  const handleCategoryClick = (categoryId) => {
    const newCategory = selectedCategory === categoryId ? '' : categoryId
    setSelectedCategory(newCategory)
    if (newCategory) {
      setSearchParams({ category: newCategory })
    } else {
      setSearchParams({})
    }
    dispatch(setFilterParams({ category: newCategory }))
  }

  const handlePriceRangeClick = (range) => {
    setSelectedPriceRange(range)
    dispatch(setFilterParams({ priceRange: range }))
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    dispatch(setFilterParams({ sortBy: e.target.value }))
  }

  const handleReset = () => {
    setSelectedCategory('')
    setSelectedPriceRange([])
    setSortBy('default')
    setSearchParams({})
    dispatch(setFilterParams({ category: '', priceRange: [], sortBy: 'default' }))
  }

  const getCategoryName = (id) => {
    const cat = mockCategories.find(c => c.id === id)
    return cat ? cat.name : ''
  }

  const getCategoryIcon = (id) => {
    const cat = mockCategories.find(c => c.id === id)
    if (!cat) return null
    const IconComponent = Icons[cat.icon]
    return IconComponent ? <IconComponent style={{ color: cat.color }} /> : null
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="service-list-page">
      <div className="container">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item href="/">
            <HomeOutlined />
            <span>首页</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>全部服务</Breadcrumb.Item>
          {selectedCategory && (
            <Breadcrumb.Item>{getCategoryName(selectedCategory)}</Breadcrumb.Item>
          )}
        </Breadcrumb>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {selectedCategory ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getCategoryIcon(selectedCategory)}
                  {getCategoryName(selectedCategory)}
                </span>
              ) : '全部服务'}
            </h1>
            <p style={{ color: '#666', margin: '8px 0 0 0' }}>
              共找到 <span style={{ color: '#1677ff', fontWeight: 600 }}>{total}</span> 个优质服务
            </p>
          </div>
          {selectedCategory && (
            <Tag color="blue" style={{ padding: '4px 12px', fontSize: 14 }}>
              {getCategoryName(selectedCategory)}
            </Tag>
          )}
        </div>

        <Card className="filter-card" bordered={false}>
          <div className="filter-row">
            <span className="filter-label">
              <FilterOutlined style={{ marginRight: 4 }} />
              服务分类：
            </span>
            <Space wrap size={[8, 8]}>
              <Button
                type={!selectedCategory ? 'primary' : 'default'}
                onClick={() => handleCategoryClick('')}
                size="small"
              >
                全部
              </Button>
              {categories.map(cat => {
                const IconComponent = Icons[cat.icon]
                return (
                  <Button
                    key={cat.id}
                    type={selectedCategory === cat.id ? 'primary' : 'default'}
                    onClick={() => handleCategoryClick(cat.id)}
                    size="small"
                    icon={IconComponent ? <IconComponent style={{ fontSize: 12 }} /> : null}
                  >
                    {cat.name}
                  </Button>
                )
              })}
            </Space>
          </div>

          <div className="filter-row">
            <span className="filter-label">价格区间：</span>
            <Space wrap size={[8, 8]}>
              {mockPriceRanges.map(range => (
                <Button
                  key={range.label}
                  type={
                    (selectedPriceRange.length === 0 && range.value.length === 0) ||
                    (selectedPriceRange[0] === range.value[0] && selectedPriceRange[1] === range.value[1])
                      ? 'primary'
                      : 'default'
                  }
                  onClick={() => handlePriceRangeClick(range.value)}
                  size="small"
                >
                  {range.label}
                </Button>
              ))}
            </Space>
          </div>

          <div className="filter-row flex-between" style={{ paddingBottom: 0 }}>
            <Space size={[12, 8]} wrap>
              <span className="filter-label">排序方式：</span>
              <Radio.Group value={sortBy} onChange={handleSortChange} size="small">
                {mockSortOptions.map(option => (
                  <Radio.Button key={option.value} value={option.value}>
                    {option.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Space>
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined />}
              size="small"
            >
              重置筛选
            </Button>
          </div>
        </Card>

        <div className="service-grid">
          {paginatedData.length > 0 ? (
            <Row gutter={[16, 16]}>
              {paginatedData.map(service => (
                <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                  <ServiceCard service={service} />
                </Col>
              ))}
            </Row>
          ) : (
            <EmptyState description="没有找到符合条件的服务，试试其他筛选条件吧" />
          )}
        </div>

        {total > 0 && (
          <div className="pagination-wrapper">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(t) => `共 ${t} 条记录，第 ${current}/${Math.ceil(t / pageSize)} 页`}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceList
