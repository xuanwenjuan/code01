import React, { useState, useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Tabs,
  List,
  Avatar,
  Progress,
  Badge,
  Space,
  Tag,
  Button,
} from 'antd'
import {
  BookOutlined,
  ClockCircleOutlined,
  FireOutlined,
  BellOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CourseCard from '@/components/common/CourseCard'
import EmptyState from '@/components/common/EmptyState'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Home = () => {
  const navigate = useNavigate()
  const { courses } = useSelector((state) => state.course)
  const { learningRecords } = useSelector((state) => state.learning)
  const { currentUser } = useSelector((state) => state.user)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { key: 'all', label: '全部课程', icon: <BookOutlined /> },
    { key: 'skill', label: '技能类', icon: <TrophyOutlined /> },
    { key: 'management', label: '管理类', icon: <BookOutlined /> },
    { key: 'compliance', label: '合规类', icon: <ClockCircleOutlined /> },
  ]

  const filteredCourses = useMemo(() => {
    if (activeCategory === 'all') return courses
    return courses.filter((c) => c.category === activeCategory)
  }, [courses, activeCategory])

  const hotCourses = useMemo(() => {
    return courses.filter((c) => c.isHot).slice(0, 4)
  }, [courses])

  const myLearningRecords = useMemo(() => {
    return learningRecords
      .filter((r) => r.userId === currentUser?.id && !r.completed)
      .sort((a, b) => new Date(b.lastWatchedAt || b.enrolledAt) - new Date(a.lastWatchedAt || a.enrolledAt))
      .slice(0, 5)
  }, [learningRecords, currentUser])

  const getCourseById = (courseId) => courses.find((c) => c.id === courseId)

  const getTotalStats = () => {
    const myRecords = learningRecords.filter((r) => r.userId === currentUser?.id)
    const completed = myRecords.filter((r) => r.completed).length
    const totalMinutes = myRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
    const inProgress = myRecords.filter((r) => !r.completed && r.progress > 0).length
    return { completed, totalMinutes, inProgress }
  }

  const stats = getTotalStats()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>
          欢迎回来，{currentUser?.name}！
        </Title>
        <Text type="secondary">开始今天的学习，不断提升自己</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">已完成课程</div>
              </div>
              <TrophyOutlined style={{ fontSize: '40px', color: '#faad14' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-number">{Math.floor(stats.totalMinutes / 60)}</div>
                <div className="stat-label">累计学习(小时)</div>
              </div>
              <ClockCircleOutlined style={{ fontSize: '40px', color: '#52c41a' }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-number">{stats.inProgress}</div>
                <div className="stat-label">正在学习</div>
              </div>
              <BookOutlined style={{ fontSize: '40px', color: '#1890ff' }} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: '#ff4d4f' }} />
                <span>热门课程推荐</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/courses')}>
                查看更多 <ArrowRightOutlined />
              </Button>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              {hotCourses.map((course) => (
                <Col xs={24} sm={12} key={course.id}>
                  <CourseCard course={course} />
                </Col>
              ))}
            </Row>
          </Card>

          <Card
            title={
              <Space>
                <BookOutlined />
                <span>课程分类浏览</span>
              </Space>
            }
          >
            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              items={categories.map((cat) => ({
                key: cat.key,
                label: (
                  <Space>
                    {cat.icon}
                    {cat.label}
                  </Space>
                ),
              }))}
            />
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <Col xs={24} sm={12} lg={8} key={course.id}>
                    <CourseCard course={course} />
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <EmptyState description="该分类下暂无课程" />
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <Badge dot color="red" offset={[4, 0]}>
                  <BellOutlined />
                </Badge>
                <span>待学课程提醒</span>
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            {myLearningRecords.length > 0 ? (
              <List
                dataSource={myLearningRecords}
                renderItem={(record) => {
                  const course = getCourseById(record.courseId)
                  if (!course) return null
                  return (
                    <List.Item
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={60}
                            src={course.cover}
                            style={{ borderRadius: '6px' }}
                          />
                        }
                        title={
                          <Text strong ellipsis style={{ display: 'block' }}>
                            {course.title}
                          </Text>
                        }
                        description={
                          <div>
                            <Space size={8} style={{ marginBottom: '8px' }}>
                              <Tag color="blue">{course.categoryName}</Tag>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                上次学习：{record.lastWatchedAt ? dayjs(record.lastWatchedAt).format('MM-DD HH:mm') : '未开始'}
                              </Text>
                            </Space>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  学习进度
                                </Text>
                                <Text style={{ fontSize: '12px', color: '#1677ff' }}>
                                  {record.progress}%
                                </Text>
                              </div>
                              <Progress percent={record.progress} size="small" showInfo={false} />
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            ) : (
              <EmptyState description="暂无待学课程" actionText="去选课" onAction={() => navigate('/courses')} />
            )}
          </Card>

          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>学习日历</span>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', color: '#1677ff', marginBottom: '8px' }}>
                {dayjs().format('D')}
              </div>
              <Text type="secondary">{dayjs().format('YYYY年MM月')}</Text>
              <div style={{ marginTop: '16px', padding: '12px', background: '#e6f7ff', borderRadius: '6px' }}>
                <Text type="primary">今日已学习：{Math.floor(stats.totalMinutes / 60)}小时{stats.totalMinutes % 60}分钟</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
