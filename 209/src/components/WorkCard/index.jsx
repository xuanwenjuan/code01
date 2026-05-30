import { Card, Tag, Image, Space } from 'antd'
import { HeartOutlined, EyeOutlined } from '@ant-design/icons'
import { getCategoryTagClass } from '../../utils/validators'

const WorkCard = ({ work, onClick, style }) => {
  return (
    <Card
      hoverable
      className="pottery-card"
      onClick={() => onClick?.(work)}
      cover={
        <Image
          src={work.image}
          alt={work.title}
          height={220}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      }
      style={{ ...style, marginBottom: 0 }}
    >
      <Card.Meta
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{work.title}</span>
            <span className={`pottery-tag ${getCategoryTagClass(work.category)}`}>
              {work.categoryName}
            </span>
          </div>
        }
        description={
          <div>
            <p style={{
              margin: '8px 0',
              color: '#666',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: 44
            }}>
              {work.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size="middle">
                <span style={{ color: '#8B4513', fontWeight: 600 }}>
                  ¥{work.price?.toLocaleString()}
                </span>
              </Space>
              <Space size="middle">
                <span style={{ color: '#999', fontSize: 13 }}>
                  <EyeOutlined style={{ marginRight: 4 }} />
                  {work.views}
                </span>
                <span style={{ color: '#999', fontSize: 13 }}>
                  <HeartOutlined style={{ marginRight: 4 }} />
                  {work.likes}
                </span>
              </Space>
            </div>
            <div style={{ marginTop: 8 }}>
              {work.tags?.map((tag, index) => (
                <Tag key={index} color="default" style={{ marginBottom: 4 }}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default WorkCard
