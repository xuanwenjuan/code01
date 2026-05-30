import React, { useMemo, useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  List,
  Tag,
  Space,
  Avatar,
  Statistic,
  Table,
  Select,
  Alert,
  Tooltip,
  Badge,
  Divider,
} from 'antd'
import {
  ClockCircleOutlined,
  BookOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
  FireOutlined,
  CrownOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import EmptyState from '@/components/common/EmptyState'
import ErrorMessage from '@/components/common/ErrorMessage'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const Statistics = () => {
  const navigate = useNavigate()
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, examResults, certificates } = useSelector((state) => state.learning)
  const { currentUser, users } = useSelector((state) => state.user)
  
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [error, setError] = useState(null)

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) {
      setSelectedUserId(currentUser?.id)
    }
  }, [currentUser, isAdmin])

  const getTargetUserId = () => selectedUserId || (isAdmin ? null : currentUser?.id)

  const getFilteredRecords = useMemo(() => {
    try {
      const targetId = getTargetUserId()
      if (targetId) {
        return learningRecords.filter((r) => r.userId === targetId)
      }
      return learningRecords
    } catch (err) {
      setError('获取学习记录失败，请刷新页面重试')
      return []
    }
  }, [learningRecords, selectedUserId, isAdmin, currentUser])

  const getFilteredExamResults = useMemo(() => {
    const targetId = getTargetUserId()
    if (targetId) {
      return examResults.filter((r) => r.userId === targetId)
    }
    return examResults
  }, [examResults, selectedUserId, isAdmin, currentUser])

  const getFilteredCertificates = useMemo(() => {
    const targetId = getTargetUserId()
    if (targetId) {
      return certificates.filter((c) => c.userId === targetId)
    }
    return certificates
  }, [certificates, selectedUserId, isAdmin, currentUser])

  const stats = useMemo(() => {
    const totalMinutes = getFilteredRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
    const completedCount = getFilteredRecords.filter((r) => r.completed).length
    const inProgressCount = getFilteredRecords.filter((r) => !r.completed && r.progress > 0).length
    const avgScore = getFilteredExamResults.length > 0
      ? Math.round(getFilteredExamResults.reduce((sum, r) => sum + r.score, 0) / getFilteredExamResults.length)
      : 0
    const totalCourses = courses.length
    const completionRate = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0

    return {
      totalRecords: getFilteredRecords.length,
      completedCount,
      inProgressCount,
      totalMinutes,
      totalHours: Math.floor(totalMinutes / 60),
      certificateCount: getFilteredCertificates.length,
      avgScore,
      completionRate,
    }
  }, [getFilteredRecords, getFilteredExamResults, getFilteredCertificates, courses])

  const categoryStats = useMemo(() => {
    const statsMap = {}
    getFilteredRecords.forEach((record) => {
      const course = courses.find((c) => c.id === record.courseId)
      if (course) {
        if (!statsMap[course.category]) {
          statsMap[course.category] = {
            name: course.categoryName,
            count: 0,
            minutes: 0,
            completed: 0,
          }
        }
        statsMap[course.category].count++
        statsMap[course.category].minutes += record.watchedMinutes
        if (record.completed) statsMap[course.category].completed++
      }
    })
    return Object.values(statsMap)
  }, [getFilteredRecords, courses])

  const employeeRanking = useMemo(() => {
    if (!isAdmin) return []
    
    const employeeStats = users
      .filter((u) => u.role === 'employee')
      .map((user) => {
        const userRecords = learningRecords.filter((r) => r.userId === user.id)
        const userExamResults = examResults.filter((r) => r.userId === user.id)
        const userCertificates = certificates.filter((c) => c.userId === user.id)
        
        const totalMinutes = userRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
        const completedCount = userRecords.filter((r) => r.completed).length
        const avgScore = userExamResults.length > 0
          ? Math.round(userExamResults.reduce((sum, r) => sum + r.score, 0) / userExamResults.length)
          : 0
        
        return {
          id: user.id,
          name: user.name,
          department: user.department,
          avatar: user.avatar,
          totalMinutes,
          totalHours: Math.floor(totalMinutes / 60),
          completedCount,
          certificateCount: userCertificates.length,
          avgScore,
        }
      })
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
    
    return employeeStats
  }, [isAdmin, users, learningRecords, examResults, certificates])

  const recentActivity = useMemo(() => {
    const activities = []
    const targetId = getTargetUserId()
    
    const recordsToProcess = targetId 
      ? getFilteredRecords 
      : learningRecords.slice(0, 20)
    
    recordsToProcess.forEach((record) => {
      const course = courses.find((c) => c.id === record.courseId)
      const user = users.find((u) => u.id === record.userId)
      if (course && record.lastWatchedAt) {
        activities.push({
          type: 'learn',
          time: record.lastWatchedAt,
          title: isAdmin && !targetId 
            ? `${user?.name || '未知'} 学习了《${course.title}》`
            : `学习了《${course.title}》`,
          progress: record.progress,
          userName: user?.name,
        })
      }
    })
    
    const examsToProcess = targetId
      ? getFilteredExamResults
      : examResults.slice(0, 20)
    
    examsToProcess.forEach((result) => {
      const course = courses.find((c) => c.id === result.courseId)
      const user = users.find((u) => u.id === result.userId)
      if (course) {
        activities.push({
          type: result.passed ? 'pass' : 'fail',
          time: result.completedAt,
          title: isAdmin && !targetId
            ? `${user?.name || '未知'} 完成《${course.title}》考核，得分 ${result.score} 分`
            : `完成《${course.title}》考核，得分 ${result.score} 分`,
          userName: user?.name,
        })
      }
    })
    
    const certsToProcess = targetId
      ? getFilteredCertificates
      : certificates.slice(0, 20)
    
    certsToProcess.forEach((cert) => {
      const user = users.find((u) => u.id === cert.userId)
      activities.push({
        type: 'certificate',
        time: cert.issuedAt,
        title: isAdmin && !targetId
          ? `${user?.name || '未知'} 获得《${cert.courseName}》证书`
          : `获得《${cert.courseName}》证书`,
        userName: user?.name,
      })
    })
    
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15)
  }, [getFilteredRecords, getFilteredExamResults, getFilteredCertificates, 
      courses, users, selectedUserId, isAdmin, learningRecords, 
      examResults, certificates])

  const scoreColumns = [
    {
      title: '课程名称',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text, record) => (
        <Text strong>{text}</Text>
      ),
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : 'red'}>
          {score}分
        </Tag>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: '结果',
      dataIndex: 'passed',
      key: 'passed',
      render: (passed) => (
        <Tag color={passed ? 'green' : 'red'}>
          {passed ? '通过' : '未通过'}
        </Tag>
      ),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => new Date(a.completedAt) - new Date(b.completedAt),
    },
  ]

  if (isAdmin) {
    scoreColumns.splice(1, 0, {
      title: '员工',
      dataIndex: 'userName',
      key: 'userName',
      render: (name) => (
        <Space>
          <Avatar size={24} icon={<UserOutlined />} />
          <Text>{name}</Text>
        </Space>
      ),
    })
  }

  const scoreTableData = getFilteredExamResults.map((result) => {
    const course = courses.find((c) => c.id === result.courseId)
    const user = users.find((u) => u.id === result.userId)
    return {
      ...result,
      courseName: course?.title || '未知课程',
      userName: user?.name || '未知',
    }
  })

  const rankingColumns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      render: (_, __, index) => {
        const rankIcons = ['👑', '🥈', '🥉']
        if (index < 3) {
          return <Text style={{ fontSize: '20px' }}>{rankIcons[index]}</Text>
        }
        return <Text strong>{index + 1}</Text>
      },
    },
    {
      title: '员工',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size={32} />
          <div>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
              {record.department}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '学习时长',
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <Text strong>{hours}小时</Text>
          <Text type="secondary">({record.totalMinutes}分钟)</Text>
        </Space>
      ),
      sorter: (a, b) => a.totalMinutes - b.totalMinutes,
      defaultSortOrder: 'descend',
    },
    {
      title: '完成课程',
      dataIndex: 'completedCount',
      key: 'completedCount',
      render: (count) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
        />
      ),
      sorter: (a, b) => a.completedCount - b.completedCount,
    },
    {
      title: '获得证书',
      dataIndex: 'certificateCount',
      key: 'certificateCount',
      render: (count) => (
        <Space>
          <TrophyOutlined style={{ color: count > 0 ? '#faad14' : '#d9d9d9' }} />
          <Text>{count}张</Text>
        </Space>
      ),
      sorter: (a, b) => a.certificateCount - b.certificateCount,
    },
    {
      title: '平均成绩',
      dataIndex: 'avgScore',
      key: 'avgScore',
      render: (score) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : score > 0 ? 'red' : 'default'}>
          {score > 0 ? `${score}分` : '暂无'}
        </Tag>
      ),
      sorter: (a, b) => a.avgScore - b.avgScore,
    },
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'learn':
        return <BookOutlined style={{ color: '#1890ff' }} />
      case 'pass':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'fail':
        return <CheckCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'certificate':
        return <TrophyOutlined style={{ color: '#faad14' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setError(null)} />
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ marginBottom: '4px' }}>
            学习统计
          </Title>
          <Text type="secondary">
            {isAdmin ? '查看平台学习数据和员工学习排行' : '查看你的学习数据和成长轨迹'}
          </Text>
        </div>
        {isAdmin && (
          <Select
            placeholder="选择员工"
            style={{ width: 200 }}
            value={selectedUserId}
            onChange={setSelectedUserId}
            allowClear
            suffixIcon={<UserOutlined />}
          >
            <Option value={null}>全部员工</Option>
            {users.filter(u => u.role === 'employee').map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name} - {user.department}
              </Option>
            ))}
          </Select>
        )}
      </div>

      {isAdmin && !selectedUserId && (
        <Alert
          message="管理员统计视图"
          description="当前显示平台整体学习数据统计，可选择特定员工查看个人学习详情。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={isAdmin && !selectedUserId ? "平台累计学习" : "累计学习"}
              value={stats.totalHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              共 {stats.totalMinutes} 分钟
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={isAdmin && !selectedUserId ? "平台完成课程" : "已完成课程"}
              value={stats.completedCount}
              suffix="门"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              正在学习 {stats.inProgressCount} 门
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={isAdmin && !selectedUserId ? "平台颁发证书" : "获得证书"}
              value={stats.certificateCount}
              suffix="张"
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {isAdmin && !selectedUserId ? '累计颁发' : '继续加油！'}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={isAdmin && !selectedUserId ? "平台平均成绩" : "平均成绩"}
              value={stats.avgScore}
              suffix="分"
              prefix={<RiseOutlined style={{ color: '#722ed1' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getFilteredExamResults.length} 次考核
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>学习分类统计</span>
              </Space>
            }
            extra={
              <Tooltip title="课程完成率">
                <Tag color="blue">
                  完成率：{stats.completionRate}%
                </Tag>
              </Tooltip>
            }
          >
            {categoryStats.length > 0 ? (
              <List
                dataSource={categoryStats}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.name}</Text>
                          <Tag color="blue">{item.count}门课程</Tag>
                          <Tag color="green">{item.completed}门已完成</Tag>
                        </Space>
                      }
                      description={`累计学习 ${Math.floor(item.minutes / 60)}小时${item.minutes % 60}分钟`}
                    />
                    <Progress
                      percent={stats.totalMinutes > 0 ? Math.round((item.minutes / stats.totalMinutes) * 100) : 0}
                      size="small"
                      style={{ width: 120 }}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <EmptyState description="暂无学习数据" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <FireOutlined />
                <span>最近学习动态</span>
              </Space>
            }
          >
            {recentActivity.length > 0 ? (
              <List
                dataSource={recentActivity}
                renderItem={(activity) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {getActivityIcon(activity.type)}
                        </div>
                      }
                      title={activity.title}
                      description={dayjs(activity.time).format('YYYY-MM-DD HH:mm')}
                    />
                    {activity.progress !== undefined && (
                      <Tag color={activity.progress >= 80 ? 'green' : activity.progress >= 50 ? 'orange' : 'blue'}>
                        {activity.progress}%
                      </Tag>
                    )}
                  </List.Item>
                )}
              />
            ) : (
              <EmptyState description="暂无学习动态" />
            )}
          </Card>
        </Col>
      </Row>

      {isAdmin && !selectedUserId && (
        <Card 
          title={
            <Space>
              <CrownOutlined style={{ color: '#faad14' }} />
              <span>员工学习排行榜</span>
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Table
            columns={rankingColumns}
            dataSource={employeeRanking}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>考试成绩记录</span>
          </Space>
        }
      >
        {scoreTableData.length > 0 ? (
          <Table
            columns={scoreColumns}
            dataSource={scoreTableData}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        ) : (
          <EmptyState description="暂无考试成绩" />
        )}
      </Card>
    </div>
  )
}

export default Statistics
