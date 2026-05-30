import React, { useMemo } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Progress,
  List,
  Tag,
  Space,
  Avatar,
  Table,
} from 'antd'
import {
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Dashboard = () => {
  const { users } = useSelector((state) => state.user)
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, certificates, examResults } = useSelector((state) => state.learning)

  const stats = useMemo(() => {
    const employeeCount = users.filter((u) => u.role === 'employee').length
    const totalMinutes = learningRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
    const completedCount = learningRecords.filter((r) => r.completed).length
    const avgScore = examResults.length > 0
      ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
      : 0

    return {
      totalUsers: users.length,
      employeeCount,
      totalCourses: courses.length,
      totalCertificates: certificates.length,
      totalLearningHours: Math.floor(totalMinutes / 60),
      completedCourses: completedCount,
      avgScore,
      totalExamResults: examResults.length,
    }
  }, [users, courses, learningRecords, certificates, examResults])

  const topCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)
      .map((course) => {
        const records = learningRecords.filter((r) => r.courseId === course.id)
        const avgProgress = records.length > 0
          ? Math.round(records.reduce((sum, r) => sum + r.progress, 0) / records.length)
          : 0
        return {
          ...course,
          avgProgress,
          learnerCount: records.length,
        }
      })
  }, [courses, learningRecords])

  const topLearners = useMemo(() => {
    const userStats = users
      .filter((u) => u.role === 'employee')
      .map((user) => {
        const userRecords = learningRecords.filter((r) => r.userId === user.id)
        const totalMinutes = userRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
        const completedCount = userRecords.filter((r) => r.completed).length
        return {
          ...user,
          totalMinutes,
          completedCount,
          courseCount: userRecords.length,
        }
      })
    return userStats.sort((a, b) => b.totalMinutes - a.totalMinutes).slice(0, 5)
  }, [users, learningRecords])

  const courseColumns = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <Avatar shape="square" size={40} src={record.cover} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '学习人数',
      dataIndex: 'learnerCount',
      key: 'learnerCount',
    },
    {
      title: '平均进度',
      dataIndex: 'avgProgress',
      key: 'avgProgress',
      render: (progress) => (
        <Progress percent={progress} size="small" style={{ width: 100 }} />
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginBottom: '4px' }}>
          数据概览
        </Title>
        <Text type="secondary">查看平台整体运营数据</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              suffix="人"
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              其中员工 {stats.employeeCount} 人
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="课程总数"
              value={stats.totalCourses}
              suffix="门"
              prefix={<BookOutlined style={{ color: '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              覆盖技能、管理、合规三大类
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="累计学习"
              value={stats.totalLearningHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              已完成课程 {stats.completedCourses} 门次
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="颁发证书"
              value={stats.totalCertificates}
              suffix="张"
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              平均成绩 {stats.avgScore} 分
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="热门课程排行">
            <Table
              columns={courseColumns}
              dataSource={topCourses}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                学习达人榜
              </Space>
            }
          >
            <List
              dataSource={topLearners}
              renderItem={(user, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: index < 3 ? '#faad14' : '#f0f0f0',
                        color: index < 3 ? '#fff' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        marginRight: '12px',
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={
                      <Space>
                        <Avatar size={32} src={user.avatar} />
                        <Text strong>{user.name}</Text>
                        <Text type="secondary">{user.department}</Text>
                      </Space>
                    }
                    description={
                      <Space size={16}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          学习 {Math.floor(user.totalMinutes / 60)}小时
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          完成 {user.completedCount}门课程
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <RiseOutlined />
            分类课程统计
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[16, 16]}>
          {['skill', 'management', 'compliance'].map((cat) => {
            const categoryCourses = courses.filter((c) => c.category === cat)
            const categoryRecords = learningRecords.filter((r) => {
              const course = courses.find((c) => c.id === r.courseId)
              return course?.category === cat
            })
            const totalMinutes = categoryRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
            const categoryName = categoryCourses[0]?.categoryName || '未知'

            return (
              <Col xs={24} sm={8} key={cat}>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Text strong>{categoryName}</Text>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">课程数</Text>
                      <Text strong>{categoryCourses.length} 门</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">学习时长</Text>
                      <Text strong>{Math.floor(totalMinutes / 60)} 小时</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">学习人次</Text>
                      <Text strong>{categoryRecords.length} 次</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>
    </div>
  )
}

export default Dashboard
