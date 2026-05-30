import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Row, Col, Card, Tag, Select, Input } from 'antd'
import { HeartOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { fetchWorks } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'

const { Search } = Input
const { Meta } = Card

const WorkList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { works, loading } = useSelector(state => state.data)
  
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    dispatch(fetchWorks())
  }, [dispatch])

  const filteredWorks = works.filter(w => {
    const matchType = typeFilter === 'all' || w.type === typeFilter
    const matchKeyword = !searchKeyword || 
      w.title.includes(searchKeyword) || 
      w.description.includes(searchKeyword) ||
      w.author.includes(searchKeyword) ||
      w.material.includes(searchKeyword)
    return matchType && matchKeyword
  })

  const typeOptions = [
    { value: 'all', label: '全部作品' },
    { value: 'classic', label: '经典作品' },
    { value: 'innovation', label: '创新作品' }
  ]

  if (loading.works) {
    return <LoadingState />
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>作品展示</h1>
          <p>欣赏草木染的艺术之美</p>
        </div>
      </div>

      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            style={{ width: 150 }}
            size="large"
          />
          <Search
            placeholder="搜索作品..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {filteredWorks.length > 0 ? (
            filteredWorks.map(work => (
              <Col xs={24} sm={12} md={8} lg={6} key={work.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <div style={{
                      height: 240,
                      background: `url(${work.image}) center/cover`,
                      position: 'relative'
                    }}>
                      <Tag 
                        color={work.type === 'classic' ? 'gold' : 'purple'}
                        style={{ position: 'absolute', top: 12, left: 12 }}
                      >
                        {work.type === 'classic' ? '经典' : '创新'}
                      </Tag>
                      <div style={{ 
                        position: 'absolute', 
                        bottom: 12, 
                        right: 12,
                        display: 'flex',
                        gap: 8
                      }}>
                        {work.colors.map((color, i) => (
                          <div
                            key={i}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: color,
                              border: '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  }
                  onClick={() => navigate(`/work/${work.id}`)}
                >
                  <Meta
                    title={work.title}
                    description={
                      <div>
                        <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                          作者：{work.author} · {work.technique}
                        </div>
                        <div style={{ color: '#999', fontSize: 12, marginBottom: 8 }}>
                          染材：{work.material}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span><EyeOutlined style={{ marginRight: 4 }} />{work.views}</span>
                          <span><HeartOutlined style={{ marginRight: 4 }} />{work.likes}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <EmptyState description="没有找到匹配的作品" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  )
}

export default WorkList
