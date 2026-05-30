import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Tag, Avatar, Empty, Button, List } from 'antd'
import { PlayCircleOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { fetchTutorials, fetchInheritors } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'

const History = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { tutorials, inheritors, loading } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)

  useEffect(() => {
    dispatch(fetchTutorials())
    dispatch(fetchInheritors())
  }, [dispatch])

  const historyTutorials = (currentUser?.browseHistory || [])
    .map(id => tutorials.find(t => t.id === id))
    .filter(Boolean)

  if (loading.tutorials) {
    return <LoadingState />
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <Empty description="请先登录查看浏览记录" />
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>
          去登录
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>浏览记录</h1>
          <p>共浏览 {historyTutorials.length} 个教程</p>
        </div>
      </div>

      <div className="container">
        {historyTutorials.length > 0 ? (
          <List
            dataSource={historyTutorials}
            renderItem={tutorial => (
              <List.Item 
                key={tutorial.id}
                style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}
              >
                <Card 
                  hoverable 
                  className="card-hover"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/tutorial/${tutorial.id}`)}
                >
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                      width: 200,
                      height: 120,
                      background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${tutorial.cover}) center/cover`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      <PlayCircleOutlined style={{ fontSize: 40, color: 'white', opacity: 0.9 }} />
                      <Tag 
                        color={tutorial.level === 'beginner' ? 'green' : tutorial.level === 'intermediate' ? 'orange' : 'red'}
                        style={{ position: 'absolute', top: 8, left: 8 }}
                      >
                        {tutorial.level === 'beginner' ? '入门' : tutorial.level === 'intermediate' ? '进阶' : '高级'}
                      </Tag>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginBottom: 8 }}>{tutorial.title}</h3>
                      <p style={{ color: '#666', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>
                        {tutorial.description.substring(0, 80)}...
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar size={24} src={inheritors.find(i => i.name === tutorial.author)?.avatar} />
                          <span style={{ fontSize: 12, color: '#666' }}>{tutorial.author}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          <EyeOutlined style={{ marginRight: 4 }} />{tutorial.views}
                        </span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />{tutorial.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="还没有浏览任何教程" style={{ padding: '60px 0' }} />
        )}
      </div>
    </div>
  )
}

export default History
