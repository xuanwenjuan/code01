import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Row, Col, Select, Slider, Radio, Pagination, Empty, Spin, Breadcrumb } from 'antd'
import { HomeOutlined, RightOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { products, categories } from '@/mock'
import ProductCard from '@/components/ProductCard'
import { usePagination } from '@/hooks'
import './index.scss'

const { Option } = Select
const { Group, Button } = Radio

const Products = () => {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [categoryId, setCategoryId] = useState(null)
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('default')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')
    const kw = searchParams.get('keyword')

    if (category) setCategoryId(Number(category))
    if (kw) setKeyword(kw)

    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (categoryId) {
      result = result.filter(p => p.categoryId === categoryId)
    }

    if (keyword) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(keyword.toLowerCase())
      )
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    const tag = searchParams.get('tag')
    if (tag) {
      result = result.filter(p => p.tags?.includes(tag))
    }

    switch (sortBy) {
      case 'sales':
        result.sort((a, b) => b.sales - a.sales)
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'new':
        result.sort((a, b) => b.id - a.id)
        break
      default:
        break
    }

    return result
  }, [categoryId, priceRange, sortBy, keyword, searchParams])

  const {
    paginatedData,
    currentPage,
    totalItems,
    pageSize,
    goToPage
  } = usePagination(filteredProducts, 12)

  const currentCategory = categories.find(c => c.id === categoryId)

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <div className="products-page">
      <Breadcrumb className="breadcrumb" separator={<RightOutlined />}>
        <Breadcrumb.Item>
          <Link to="/"><HomeOutlined /> 首页</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">全部商品</Link>
        </Breadcrumb.Item>
        {currentCategory && (
          <Breadcrumb.Item>{currentCategory.name}</Breadcrumb.Item>
        )}
      </Breadcrumb>

      <div className="page-content">
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">商品分类</h3>
            <div className="category-list">
              <div
                className={`category-item ${!categoryId ? 'active' : ''}`}
                onClick={() => setCategoryId(null)}
              >
                全部
              </div>
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-item ${categoryId === category.id ? 'active' : ''}`}
                  onClick={() => setCategoryId(category.id)}
                >
                  <span className="icon">{category.icon}</span>
                  {category.name}
                </div>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">价格区间</h3>
            <div className="price-filter">
              <Slider
                range
                min={0}
                max={200}
                value={priceRange}
                onChange={setPriceRange}
              />
              <div className="price-range">
                <span>¥{priceRange[0]}</span>
                <span>-</span>
                <span>¥{priceRange[1]}</span>
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">排序方式</h3>
            <Select
              value={sortBy}
              onChange={setSortBy}
              style={{ width: '100%' }}
            >
              <Option value="default">综合排序</Option>
              <Option value="sales">销量优先</Option>
              <Option value="price-asc">价格从低到高</Option>
              <Option value="price-desc">价格从高到低</Option>
              <Option value="new">最新上架</Option>
            </Select>
          </div>
        </div>

        <div className="products-main">
          <div className="products-header">
            <h2 className="page-title">
              {currentCategory?.name || '全部商品'}
              <span className="count">（共{filteredProducts.length}件商品）</span>
            </h2>
          </div>

          {filteredProducts.length > 0 ? (
            <>
              <Row gutter={[16, 16]} className="products-grid">
                {paginatedData.map(product => (
                  <Col xs={12} sm={8} md={6} lg={6} xl={4} key={product.id}>
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>

              <div className="pagination-wrapper">
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={pageSize}
                  onChange={goToPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 件商品`}
                />
              </div>
            </>
          ) : (
            <Empty
              description={
                keyword ? `没有找到"${keyword}"相关商品` : '暂无商品'
              }
              className="empty-state"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Products
