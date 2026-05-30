import React from 'react'
import { Card, Tag, Avatar, Space } from 'antd'
import { HeartOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { mockCategories } from '@/mock/data'

const { Meta } = Card

const WorkCard = ({ work }) => {
  const navigate = useNavigate()
  const category = mockCategories.find(c => c.id === work.category)

  const getDifficultyColor = (diff) => {
    const colors = { '初级': 'green', '中级': 'orange', '高级': 'red' }
    return colors[diff] || 'default'
  }

  return (
    <Card
      className="card-hover"
      hoverable
      cover={<img alt={work.title} src={work.images[0]} style={{ height: 200, objectFit: 'cover' }} />}
      actions={[
        <Space key="likes">
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <span>{work.likes}</span>
        </Space>,
        <Space key="views">
          <EyeOutlined />
          <span>{work.views}</span>
        </Space>
      ]}
      onClick={() => navigate(`/works/${work.id}`)}
    >
      <Meta
        title={<span style={{ fontWeight: 500 }}>{work.title}</span>}
        description={
          <div>
            <Space style={{ marginBottom: 8 }}>
              {category && <Tag color="green">{category.name}</Tag>}
              <Tag color={getDifficultyColor(work.difficulty)}>{work.difficulty}</Tag>
            </Space>
            <div style={{ fontSize: 12, color: '#888' }}>
              <Avatar size={20} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${work.author}`} style={{ marginRight: 4 }} />
              {work.author} · {work.createTime}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default WorkCard
