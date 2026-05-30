import React, { useState, useMemo, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Tabs,
  Tag,
  Space,
  Progress,
  List,
  Avatar,
  Button,
  Select,
  Input,
  Alert,
  Tooltip,
  Dropdown,
  Badge,
} from 'antd'
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CourseCard from '@/components/common/CourseCard'
import EmptyState from '@/components/common/EmptyState'
import ErrorMessage from '@/components/common/ErrorMessage'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const MyCourses = () => {
  const navigate = useNavigate()
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, examResults } = useSelector((state) => state.learning)
  const { currentUser, users } = useSelector((state) => state.user)
  
  const [activeTab, setActiveTab] = useState('inProgress')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      setSelectedUserId(null)
    } else {
      setSelectedUserId(currentUser?.id)
    }
  }, [currentUser, isAdmin])

  const targetUserId = selectedUserId || currentUser?.id

  const getRecords = useMemo(() => {
    try {
      return learningRecords.filter((r) => r.userId === targetUserId)
    } catch (err) {
      setError('获取学习记录失败，请刷新页面重试')
      return []
    }
  }, [learningRecords, targetUserId])

  const inProgressCourses = useMemo(() => {
    let records = getRecords.filter((r) => !r.completed)
    
    if (categoryFilter !== 'all') {
      records = records.filter((r) => {
        const course = courses.find((c) => c.id === r.courseId)
        return course?.category === categoryFilter
      })
    }
    
    if (searchKeyword) {
      records = records.filter((r) => {
        const course = courses.find((c) => c.id === r.courseId)
        return course?.title.toLowerCase().includes(searchKeyword.toLowerCase())
      })
    }
    
    return records.map((record) => {
      const course = courses.find((c) => c.id === record.courseId)
      return { ...record, course }
    }).filter((item) => item.course)
  }, [getRecords, courses, categoryFilter, searchKeyword])

  const completedCourses = useMemo(() => {
    let records = getRecords.filter((r) => r.completed)
    
    if (categoryFilter !== 'all') {
      records = records.filter((r) => {
        const course = courses.find((c) => c.id === r.courseId)
        return course?.category === categoryFilter
      })
    }
    
    if (searchKeyword) {
      records = records.filter((r) => {
        const course = courses.find((c) => c.id === r.courseId)
        return course?.title.toLowerCase().includes(searchKeyword.toLowerCase())
      })
    }
    
    return records.map((record) => {
      const course = courses.find((c) => c.id === record.courseId)
      const examResult = examResults.find(
        (e) => e.courseId === record.courseId && e.userId === targetUserId
      )
      return { ...record, course, examResult }
    }).filter((item) => item.course)
  }, [getRecords, courses, examResults, targetUserId, categoryFilter, searchKeyword])

  const getCategoryColor = (category) => {
    const colors = {
      skill: '#52c41a',
      management: '#1890ff',
      compliance: '#fa8c16',
    }
    return colors[category] || '#999'
  }

  const handleSelectUser = (userId) => {
    try {
      setSelectedUserId(userId)
      setError(null)
    } catch (err) {
      setError('切换用户失败，请重试')
    }
  }

  const handleViewCourse = (courseId) => {
    try {
      navigate(`/course/${courseId}`)
    } catch (err) {
      setError('页面跳转失败，请刷新页面后重试')
    }
  }

  const employeeOptions = isAdmin ? users.filter((u) => u.role === 'employee') : []

  const tabItems = [
    {
      key: 'inProgress',
      label: (
        <Space>
          <PlayCircleOutlined />
          学习中 ({inProgressCourses.length})
        </Space>
      ),
    },
    {
      key: 'completed',
      label: (
        <Space>
          <CheckCircleOutlined />
          已完成 ({completedCourses.length})
        </Space>
      ),
    },
  ]

  if (error) {
    return (
      <div>
        <ErrorMessage 
          message={error} 
          onRetry={() => {
            setError(null)
            setLoading(true)
            setTimeout(() => setLoading(false), 500)
          }}
        />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ marginBottom: '4px' }}>
            我的课程
          </Title>
          <Text type="secondary">
            {isAdmin ? '查看和管理员工的学习课程' : '查看和管理你已报名的课程'}
          </Text>
        </div>
        {isAdmin && (
          <Space>
            <Select
              placeholder="选择员工"
              style={{ width: 200 }}
              value={selectedUserId}
              onChange={handleSelectUser}
              allowClear
              suffixIcon={<UserOutlined />}
            >
              <Option value={null}>全部员工</Option>
              {employeeOptions.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} - {user.department}
                </Option>
              ))}
            </Select>
          </Space>
        )}
      </div>

      {isAdmin && !selectedUserId && (
        <Alert
          message="管理员视图"
          description="当前显示所有员工的学习数据汇总，可选择特定员工查看其个人学习详情。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索课程名称"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            prefix={<FilterOutlined />}
          >
            <Option value="all">全部分类</Option>
            <Option value="skill">技能类</Option>
            <Option value="management">管理类</Option>
            <Option value="compliance">合规类</Option>
          </Select>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        {activeTab === 'inProgress' && (
          <div style={{ marginTop: '16px' }}>
            {inProgressCourses.length > 0 ? (
              <Row gutter={[16, 16]}>
                {inProgressCourses.map((item) => (
                  <Col xs={24} sm={12} lg={8} key={item.courseId}>
                    <CourseCard
                      course={item.course}
                      progress={item.progress}
                      showProgress={true}
                      onClick={() => handleViewCourse(item.courseId)}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <EmptyState
                description={isAdmin ? '该员工暂无正在学习的课程' : '暂无正在学习的课程'}
                actionText="去选课"
                onAction={() => !isAdmin && navigate('/courses')}
              />
            )}
          </div>
        )}

        {activeTab === 'completed' && (
          <div style={{ marginTop: '16px' }}>
            {completedCourses.length > 0 ? (
              <List
                dataSource={completedCourses}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s',
                    }}
                    hoverable
                    actions={[
                      <Tooltip title="查看详情">
                        <Button
                          key="view"
                          type="primary"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewCourse(item.courseId)}
                        >
                          查看详情
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape="square"
                          size={80}
                          src={item.course.cover}
                          style={{ borderRadius: '6px' }}
                        />
                      }
                      title={
                        <Space wrap>
                          <Text strong style={{ fontSize: '16px' }}>
                            {item.course.title}
                          </Text>
                          <Tag color={getCategoryColor(item.course.category)}>
                            {item.course.categoryName}
                          </Tag>
                          <Badge 
                            status="success" 
                            text="已完成" 
                            style={{ color: '#52c41a' }}
                          />
                          {isAdmin && (
                            <Tooltip title="学习员工">
                              <Tag color="purple">
                                <UserOutlined /> {users.find(u => u.id === item.userId)?.name || '未知'}
                              </Tag>
                            </Tooltip>
                          )}
                        </Space>
                      }
                      description={
                        <div>
                          <Space wrap size={16} style={{ marginBottom: '8px' }}>
                            <Text type="secondary">
                              <ClockCircleOutlined /> 完成时间：{dayjs(item.completedAt).format('YYYY-MM-DD')}
                            </Text>
                            {item.examResult && (
                              <Tooltip title="考试成绩">
                                <Text type="secondary">
                                  考核成绩：
                                  <Text strong style={{ 
                                    color: item.examResult.score >= 80 ? '#52c41a' : 
                                           item.examResult.score >= 60 ? '#faad14' : '#ff4d4f' 
                                  }}>
                                    {item.examResult.score}分
                                  </Text>
                                </Text>
                              </Tooltip>
                            )}
                            <Text type="secondary">
                              学习时长：{Math.floor(item.watchedMinutes / 60)}小时{item.watchedMinutes % 60}分钟
                            </Text>
                          </Space>
                          <Progress 
                            percent={100} 
                            size="small" 
                            status="success" 
                            style={{ maxWidth: '300px' }}
                          />
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <EmptyState description={isAdmin ? '该员工暂无已完成的课程' : '暂无已完成的课程'} />
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default MyCourses
