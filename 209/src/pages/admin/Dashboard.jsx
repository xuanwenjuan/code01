import { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Statistic, Table, Tag, Progress } from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  EyeOutlined,
  HeartOutlined,
  BookOutlined,
  RiseOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchWorks } from '../../store/slices/worksSlice'
import { fetchTechniques, fetchVideos } from '../../store/slices/techniquesSlice'
import { mockUsers } from '../../mock/data'
import Loading from '../../components/Loading'

const { Title } = Typography

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { works, loading: worksLoading } = useSelector(state => state.works)
  const { techniques, videos, loading: techLoading } = useSelector(state => state.techniques)

  useEffect(() => {
    dispatch(fetchWorks())
    dispatch(fetchTechniques())
    dispatch(fetchVideos())
  }, [dispatch])

  const totalViews = works.reduce((sum, w) => sum + (w.views || 0), 0)
  const totalLikes = works.reduce((sum, w) => sum + (w.likes || 0), 0)

  const categoryStats = [
    { name: '器皿类', value: works.filter(w => w.category === 'qimin').length, color: '#d4380d' },
    { name: '摆件类', value: works.filter(w => w.category === 'baijian').length, color: '#389e0d' },
    { name: '文创类', value: works.filter(w => w.category === 'wenchuang').length, color: '#096dd9' }
  ]

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    }
  ]

  const workColumns = [
    {
      title: '作品名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (name, record) => (
        <Tag className={`pottery-tag ${record.category === 'qimin' ? 'tag-qimin' : record.category === 'baijian' ? 'tag-baijian' : 'tag-wenchuang'}`}>
          {name}
        </Tag>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      render: (v) => v?.toLocaleString()
    },
    {
      title: '点赞',
      dataIndex: 'likes',
      key: 'likes'
    }
  ]

  if (worksLoading || techLoading) {
    return <Loading />
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>📊 数据概览</Title>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="作品总数"
              value={works.length}
              prefix={<AppstoreOutlined style={{ color: '#8B4513' }} />}
              valueStyle={{ color: '#8B4513' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={mockUsers.length}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={totalViews}
              prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总点赞数"
              value={totalLikes}
              prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <Card title="作品分类统计">
            {categoryStats.map((item, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.name}</span>
                  <span style={{ color: item.color }}>{item.value} 件</span>
                </div>
                <Progress
                  percent={Math.round((item.value / works.length) * 100)}
                  strokeColor={item.color}
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="技法教程统计">
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, color: '#8B4513', marginBottom: 8 }}>
                    <BookOutlined />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{techniques.length}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>核心技法</div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                    <RiseOutlined />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{videos.length}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>视频教程</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="热门作品 TOP 5">
            <Table
              dataSource={[...works].sort((a, b) => b.views - a.views).slice(0, 5)}
              columns={workColumns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="用户列表">
            <Table
              dataSource={mockUsers}
              columns={userColumns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
