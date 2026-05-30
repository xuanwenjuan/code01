import React, { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Row, Col, Tabs, Empty } from 'antd'
import HeritageCard from '../components/HeritageCard'

const Category = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { heritages, categories } = useSelector(state => state.heritage)
  const [activeKey, setActiveKey] = useState(searchParams.get('type') || 'all')
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all')

  useEffect(() => {
    const type = searchParams.get('type')
    const filterParam = searchParams.get('filter')
    if (type) setActiveKey(type)
    if (filterParam) setFilter(filterParam)
  }, [searchParams])

  const handleTabChange = (key) => {
    setActiveKey(key)
    setSearchParams({ type: key })
  }

  const filteredHeritages = useMemo(() => {
    let result = [...heritages]
    
    if (activeKey !== 'all') {
      result = result.filter(h => h.category === activeKey)
    }

    if (filter === 'endangered') {
      result = result.filter(h => h.isEndangered)
    } else if (filter === 'hot') {
      result = result.filter(h => h.isHot)
    } else if (filter === 'world') {
      result = result.filter(h => h.level === '世界级')
    }

    return result
  }, [heritages, activeKey, filter])

  const tabItems = [
    { key: 'all', label: '全部' },
    ...categories.filter(c => c.id !== 'all').map(c => ({
      key: c.id,
      label: c.name
    }))
  ]

  const filterOptions = [
    { value: 'all', label: '全部' },
    { value: 'endangered', label: '濒危非遗' },
    { value: 'hot', label: '热门非遗' },
    { value: 'world', label: '世界级' }
  ]

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="section-title">非遗分类</div>
      
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          items={tabItems}
          style={{ marginBottom: 16 }}
          tabBarStyle={{ marginBottom: 0 }}
        />
        
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterOptions.map(option => (
            <span
              key={option.value}
              onClick={() => setFilter(option.value)}
              style={{
                padding: '6px 16px',
                borderRadius: 16,
                cursor: 'pointer',
                background: filter === option.value ? '#d4380d' : '#f5f5f5',
                color: filter === option.value ? 'white' : '#666',
                fontSize: 13,
                transition: 'all 0.3s'
              }}
            >
              {option.label}
            </span>
          ))}
        </div>
      </div>

      {filteredHeritages.length > 0 ? (
        <Row gutter={[24, 24]}>
          {filteredHeritages.map(heritage => (
            <Col xs={24} sm={12} lg={6} key={heritage.id}>
              <HeritageCard heritage={heritage} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无相关非遗项目" style={{ marginTop: 60 }} />
      )}
    </div>
  )
}

export default Category
