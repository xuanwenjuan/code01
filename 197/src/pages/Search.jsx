import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Row, Col, Empty } from 'antd'
import HeritageCard from '../components/HeritageCard'

const Search = () => {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('keyword') || ''
  const { heritages } = useSelector(state => state.heritage)

  const searchResults = useMemo(() => {
    if (!keyword) return []
    const lowerKeyword = keyword.toLowerCase()
    return heritages.filter(h =>
      h.name.toLowerCase().includes(lowerKeyword) ||
      h.description.toLowerCase().includes(lowerKeyword) ||
      h.categoryName.toLowerCase().includes(lowerKeyword) ||
      h.origin.toLowerCase().includes(lowerKeyword)
    )
  }, [heritages, keyword])

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="section-title">
        搜索结果: "{keyword}"
        <span style={{ fontSize: 14, color: '#999', fontWeight: 'normal' }}>
          共找到 {searchResults.length} 条结果
        </span>
      </div>

      {searchResults.length > 0 ? (
        <Row gutter={[24, 24]}>
          {searchResults.map(heritage => (
            <Col xs={24} sm={12} lg={6} key={heritage.id}>
              <HeritageCard heritage={heritage} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="未找到相关非遗项目" style={{ marginTop: 60 }} />
      )}
    </div>
  )
}

export default Search
