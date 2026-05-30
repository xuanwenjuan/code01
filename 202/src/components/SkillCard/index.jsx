import React from 'react'
import { Card, Tag, Space, Typography } from 'antd'
import { EyeOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

const SkillCard = ({ skill }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/skill/${skill.id}`)
  }

  return (
    <Card
      hoverable
      className="card-hover"
      onClick={handleClick}
      cover={
        <div
          style={{
            height: '180px',
            overflow: 'hidden',
            background: `url(${skill.coverImage}) center/cover no-repeat`,
          }}
        />
      }
      actions={[
        <span key="view">
          <EyeOutlined style={{ marginRight: '4px' }} />
          {skill.viewCount}
        </span>,
        <span key="favorite">
          <HeartOutlined style={{ marginRight: '4px' }} />
          {skill.favoriteCount}
        </span>,
      ]}
    >
      <Card.Meta
        title={
          <Space>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>{skill.name}</span>
            <Tag color="gold">{skill.level}</Tag>
          </Space>
        }
        description={
          <div>
            <Space style={{ marginBottom: '8px' }}>
              <Tag color="blue">{skill.category}</Tag>
              <Tag color="green">{skill.origin}</Tag>
            </Space>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, color: '#666' }}
            >
              {skill.description}
            </Paragraph>
            <div style={{ marginTop: '8px', color: '#999', fontSize: '12px' }}>
              传承人：{skill.inheritorName}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default SkillCard
