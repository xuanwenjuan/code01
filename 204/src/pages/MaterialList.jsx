import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Tag, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { fetchMaterials } from '../store/slices/dataSlice'
import { categories } from '../data/mockData'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'

const { Search } = Input
const { Meta } = Card

const MaterialList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { materials, loading } = useSelector(state => state.data)
  
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    dispatch(fetchMaterials())
  }, [dispatch])

  const filteredMaterials = materials.filter(m => {
    const matchCategory = selectedCategory === 'all' || m.category === selectedCategory
    const matchKeyword = !searchKeyword || 
      m.name.includes(searchKeyword) || 
      m.description.includes(searchKeyword)
    return matchCategory && matchKeyword
  })

  if (loading.materials) {
    return <LoadingState />
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>染材图鉴</h1>
          <p>探索各种天然染料的奥秘</p>
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <Tag.CheckableTag
                key={cat.id}
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  borderColor: selectedCategory === cat.id ? '#2d5a27' : '#d9d9d9',
                  background: selectedCategory === cat.id ? '#2d5a27' : 'white',
                  color: selectedCategory === cat.id ? 'white' : '#333',
                  cursor: 'pointer'
                }}
              >
                {cat.name}
              </Tag.CheckableTag>
            ))}
          </div>
          <Search
            placeholder="搜索染材..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map(material => (
              <Col xs={24} sm={12} md={8} lg={6} key={material.id}>
                <Card
                  hoverable
                  className="card-hover"
                  onClick={() => navigate(`/material/${material.id}`)}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <div 
                      className="dye-color-swatch"
                      style={{ background: material.color }}
                    />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{material.name}</div>
                      <Tag color="green" style={{ marginTop: 4 }}>{material.category}</Tag>
                    </div>
                  </div>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                    {material.description.substring(0, 50)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                    <span>产地：{material.origin}</span>
                    <span>{material.season}</span>
                  </div>
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <EmptyState description="没有找到匹配的染材" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  )
}

export default MaterialList
