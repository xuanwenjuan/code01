import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Tag, Avatar, Select, Input } from 'antd'
import { PlayCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { fetchTutorials, fetchInheritors } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'

const { Search } = Input
const { Meta } = Card

const TutorialList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tutorials, inheritors, loading } = useSelector(state => state.data)
  
  const [levelFilter, setLevelFilter] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    dispatch(fetchTutorials())
    dispatch(fetchInheritors())
  }, [dispatch])

  const filteredTutorials = tutorials.filter(t => {
    const matchLevel = levelFilter === 'all' || t.level === levelFilter
    const matchKeyword = !searchKeyword || 
      t.title.includes(searchKeyword) || 
      t.description.includes(searchKeyword) ||
      t.author.includes(searchKeyword)
    return matchLevel && matchKeyword
  })

  const levelOptions = [
    { value: 'all', label: '全部难度' },
    { value: 'beginner', label: '入门' },
    { value: 'intermediate', label: '进阶' },
    { value: 'advanced', label: '高级' }
  ]

  if (loading.tutorials) {
    return <LoadingState />
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>技艺教程</h1>
          <p>跟随传承人学习草木染的精髓</p>
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
            value={levelFilter}
            onChange={setLevelFilter}
            options={levelOptions}
            style={{ width: 150 }}
            size="large"
          />
          <Search
            placeholder="搜索教程..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          {filteredTutorials.length > 0 ? (
            filteredTutorials.map(tutorial => (
              <Col xs={24} sm={12} lg={8} key={tutorial.id}>
                <Card
                  hoverable
                  className="card-hover"
                  cover={
                    <div style={{
                      height: 220,
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${tutorial.cover}) center/cover`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative'
                    }} onClick={() => navigate(`/tutorial/${tutorial.id}`)}>
                      <PlayCircleOutlined style={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                      <Tag 
                        color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}
                        style={{ position: 'absolute', top: 12, left: 12 }}
                      >
                        {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
                      </Tag>
                      <Tag color="blue" style={{ position: 'absolute', top: 12, right: 12 }}>
                        {tutorial.duration}
                      </Tag>
                    </div>
                  }
                  onClick={() => navigate(`/tutorial/${tutorial.id}`)}
                >
                  <Meta
                    title={tutorial.title}
                    description={
                      <div>
                        <div style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                          {tutorial.description.substring(0, 60)}...
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar size={24} src={inheritors.find(i => i.name === tutorial.author)?.avatar} />
                            <span style={{ fontSize: 12, color: '#666' }}>{tutorial.author}</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#999' }}>
                            <EyeOutlined style={{ marginRight: 4 }} />{tutorial.views}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <EmptyState description="没有找到匹配的教程" />
            </Col>
          )}
        </Row>
      </div>
    </div>
  )
}

export default TutorialList
