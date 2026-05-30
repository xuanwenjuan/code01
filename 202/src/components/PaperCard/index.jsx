import React from 'react'
import { Card, Tag, Space, Typography } from 'antd'
import { EnvironmentOutlined, FireOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

const PaperCard = ({ paper }) => {
  return (
    <Card
      hoverable
      className="card-hover"
      cover={
        <div
          style={{
            height: '160px',
            overflow: 'hidden',
            background: `url(${paper.image}) center/cover no-repeat`,
          }}
        />
      }
    >
      <Card.Meta
        title={
          <Space>
            <span style={{ fontSize: '15px', fontWeight: '600' }}>{paper.name}</span>
            {paper.isFeatured && (
              <Tag icon={<FireOutlined />} color="red">
                精品
              </Tag>
            )}
          </Space>
        }
        description={
          <div>
            <Space style={{ marginBottom: '8px' }} wrap>
              <Tag color="blue">{paper.category}</Tag>
              <Tag color="purple">{paper.type}</Tag>
            </Space>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: '8px', color: '#666', fontSize: '13px' }}
            >
              {paper.description}
            </Paragraph>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#999', fontSize: '12px' }}>
                <EnvironmentOutlined style={{ marginRight: '4px' }} />
                {paper.origin}
              </span>
              <span style={{ color: '#8B6914', fontWeight: '600' }}>{paper.price}</span>
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default PaperCard
