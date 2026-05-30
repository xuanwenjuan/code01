import { Card, Tag, Image, Space, Typography } from 'antd'
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons'

const VideoCard = ({ video, onClick }) => {
  return (
    <Card
      hoverable
      className="pottery-card"
      onClick={() => onClick?.(video)}
      styles={{ body: { padding: 0 } }}
      cover={
        <div className="video-preview">
          <Image
            src={video.thumbnail}
            alt={video.title}
            height={180}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
          <div className="play-icon">▶</div>
          <div style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12
          }}>
            {video.duration}
          </div>
        </div>
      }
    >
      <div style={{ padding: 16 }}>
        <Typography.Title level={5} style={{ margin: '0 0 8px' }}>
          {video.title}
        </Typography.Title>
        <p style={{
          margin: '0 0 12px',
          color: '#666',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 44
        }}>
          {video.description}
        </p>
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>} style={{ color: '#999', fontSize: 13 }}>
          <span><UserOutlined style={{ marginRight: 4 }} />{video.instructor}</span>
          <span><ClockCircleOutlined style={{ marginRight: 4 }} />{video.duration}</span>
        </Space>
        <div style={{ marginTop: 12 }}>
          <Tag color={video.level === '入门' ? 'green' : video.level === '进阶' ? 'blue' : 'orange'}>
            {video.level}
          </Tag>
          <Tag color="purple">{video.technique}</Tag>
        </div>
      </div>
    </Card>
  )
}

export default VideoCard
