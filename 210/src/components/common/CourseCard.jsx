import React from 'react'
import { Card, Tag, Progress, Rate, Avatar, Space, Typography } from 'antd'
import {
  PlayCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const { Meta } = Card
const { Text, Title } = Typography

const categoryColors = {
  skill: '#52c41a',
  management: '#1890ff',
  compliance: '#fa8c16',
}

const CourseCard = ({ course, progress = 0, showProgress = false }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course/${course.id}`)
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
    }
    return `${mins}分钟`
  }

  return (
    <Card
      hoverable
      className="card-hover"
      onClick={handleClick}
      cover={
        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
          <img
            alt={course.title}
            src={course.cover}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '8px',
          }}>
            <Tag color={categoryColors[course.category]}>
              {course.categoryName}
            </Tag>
            {course.isHot && (
              <Tag color="red">热门</Tag>
            )}
            {course.isNew && (
              <Tag color="blue">新课</Tag>
            )}
          </div>
          <PlayCircleOutlined
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '48px',
              color: 'rgba(255,255,255,0.9)',
              opacity: 0,
              transition: 'opacity 0.3s',
            }}
            className="play-icon"
          />
          <style>{`
            .ant-card-hoverable:hover .play-icon {
              opacity: 1;
            }
          `}</style>
        </div>
      }
      actions={[
        <Space key="duration" size={4}>
          <ClockCircleOutlined style={{ color: '#999' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {formatDuration(course.duration)}
          </Text>
        </Space>,
        <Space key="students" size={4}>
          <UserOutlined style={{ color: '#999' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {course.students}人
          </Text>
        </Space>,
        <Space key="rating" size={4}>
          <StarOutlined style={{ color: '#faad14' }} />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {course.rating}
          </Text>
        </Space>,
      ]}
    >
      <Meta
        title={
          <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: '8px' }}>
            {course.title}
          </Title>
        }
        description={
          <div>
            <Text type="secondary" ellipsis={{ rows: 2 }} style={{ display: '-webkit-box', marginBottom: '12px' }}>
              {course.description}
            </Text>
            <Space size={8} style={{ marginBottom: showProgress ? '12px' : '0' }}>
              <Avatar size="small" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor}`} />
              <Text style={{ fontSize: '13px' }}>{course.instructor}</Text>
              <Tag color="geekblue" style={{ marginLeft: 'auto' }}>{course.levelName}</Tag>
            </Space>
            {showProgress && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>学习进度</Text>
                  <Text style={{ fontSize: '12px', color: '#1677ff' }}>{progress}%</Text>
                </div>
                <Progress percent={progress} size="small" showInfo={false} />
              </div>
            )}
          </div>
        }
      />
    </Card>
  )
}

export default CourseCard
