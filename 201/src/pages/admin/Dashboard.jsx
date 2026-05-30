import React from 'react'
import { Row, Col, Card, Statistic, Progress, List, Tag } from 'antd'
import {
  UserOutlined, PictureOutlined, EyeOutlined,
  LikeOutlined, FireOutlined, UsergroupAddOutlined
} from '@ant-design/icons'
import { pigments, users, masters } from '@/mock'

function AdminDashboard() {
  const totalViews = pigments.reduce((sum, p) => sum + p.views, 0)
  const totalLikes = pigments.reduce((sum, p) => sum + p.likes, 0)
  const hotPigments = [...pigments].sort((a, b) => b.views - a.views).slice(0, 5)
  const activeUsers = users.filter(u => u.status === 'active')

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="颜料总数"
              value={pigments.length}
              prefix={<PictureOutlined style={{ color: '#8B4513' }} />}
              valueStyle={{ color: '#8B4513' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="用户总数"
              value={users.length}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="总浏览量"
              value={totalViews}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-hover">
            <Statistic
              title="总点赞数"
              value={totalLikes}
              prefix={<LikeOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<span><FireOutlined style={{ marginRight: 8 }} />热门颜料排行</span>}>
            <List
              dataSource={hotPigments}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                        {item.chineseName}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}>
                        #{index + 1}
                      </Tag>
                      {item.name}
                    </div>
                  }
                    description={item.origin}
                  />
                  <div style={{ width: 200 }}>
                    <Progress percent={Math.round(item.views / hotPigments[0].views * 100)} size="small" />
                    <div style={{ textAlign: 'right', fontSize: 12, color: '#999' }}>
                      {item.views} 浏览
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title={<span><UsergroupAddOutlined style={{ marginRight: 8 }} />活跃用户</span>}>
            <List
              dataSource={activeUsers}
              renderItem={user => (
                <List.Item>
                  <List.Item.Meta
                avatar={<UserOutlined />}
                title={user.name}
                description={user.role === 'admin' ? <Tag color="red">管理员</Tag> : <Tag color="blue">研究员</Tag>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title={<span><UsergroupAddOutlined style={{ marginRight: 8 }} />调配师数量</span>} style={{ marginTop: 16 }}>
            <Statistic
              value={masters.length}
              suffix="位"
              valueStyle={{ color: '#8B4513', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
