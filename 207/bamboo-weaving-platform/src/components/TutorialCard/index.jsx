import React from 'react'
import { Card, Tag, Avatar, Space, Rate } from 'antd'
import { PlayCircleOutlined, HeartOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Meta } = Card

const TutorialCard = ({ tutorial }) => {
  const navigate = useNavigate()

  const getLevelColor = (level) => {
    const colors = { '入门': 'green', '中级': 'orange', '高级': 'red' }
    return colors[level] || 'default'
  }

  return (
    <Card
      className="card-hover"
      hoverable
      cover={
        <div style={{ position: 'relative' }}>
          <img alt={tutorial.title} src={tutorial.cover} style={{ height: 180, objectFit: 'cover', width: '100%' }} />
          <PlayCircleOutlined 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontSize: 48,
              color: 'white',
              opacity: 0.9
            }} 
          />
          {tutorial.isRecommended && (
            <Tag color="gold" style={{ position: 'absolute', top: 8, left: 8 }}>推荐</Tag>
          )}
        </div>
      }
      actions={[
        <Space key="views">
          <EyeOutlined />
          <span>{tutorial.views}</span>
        </Space>,
        <Space key="likes">
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <span>{tutorial.likes}</span>
        </Space>,
        <Space key="rating">
          <Rate disabled defaultValue={tutorial.rating} allowHalf style={{ fontSize: 12 }} />
        </Space>
      ]}
      onClick={() => navigate(`/tutorials/${tutorial.id}`)}
    >
      <Meta
        title={<span style={{ fontWeight: 500, fontSize: 16 }}>{tutorial.title}</span>}
        description={
          <div>
            <Space style={{ marginBottom: 8 }}>
              <Tag color={getLevelColor(tutorial.level)}>{tutorial.level}</Tag>
              <Tag icon={<ClockCircleOutlined />}>{tutorial.duration}</Tag>
            </Space>
            <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center' }}>
              <Avatar size={20} src={tutorial.avatar} style={{ marginRight: 4 }} />
              {tutorial.author}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default TutorialCard
