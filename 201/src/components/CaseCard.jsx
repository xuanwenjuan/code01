import React from 'react'
import { Card, Tag, Space, Avatar, Button } from 'antd'
import { UserOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Meta } = Card

function CaseCard({ caseItem }) {
  const navigate = useNavigate()

  return (
    <Card
      hoverable
      className="card-hover"
      cover={
        <img
          alt={caseItem.title}
          src={caseItem.coverImage}
          style={{ height: 180, objectFit: 'cover' }}
        />
      }
    >
      <Meta
        title={<span style={{ color: '#5D4037', fontWeight: 600 }}>{caseItem.title}</span>}
        description={
          <div>
            <Space style={{ marginBottom: 8 }} wrap>
              <Tag color="blue">{caseItem.dynasty}</Tag>
              <Tag icon={<UserOutlined />}>{caseItem.artist}</Tag>
            </Space>
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              color: '#666',
              marginBottom: 12
            }}>
              {caseItem.description}
            </div>
            <Space>
              <Space size={4}>
                <EyeOutlined style={{ color: '#999' }} />
                <span style={{ color: '#999', fontSize: 12 }}>{caseItem.views}</span>
              </Space>
              <Space size={4}>
                <HeartOutlined style={{ color: '#999' }} />
                <span style={{ color: '#999', fontSize: 12 }}>{caseItem.likes}</span>
              </Space>
            </Space>
          </div>
        }
      />
    </Card>
  )
}

export default CaseCard
