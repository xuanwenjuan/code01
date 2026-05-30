import React, { useMemo, useState } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Table,
  Tag,
  Space,
  Avatar,
  Button,
  Select,
  Input,
  DatePicker,
  Modal,
  Tabs,
  Progress,
  Alert,
  Tooltip,
  Badge,
  List,
} from 'antd'
import {
  TeamOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  EyeOutlined,
  ExportOutlined,
  BarChartOutlined,
  RiseOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import EmptyState from '@/components/common/EmptyState'
import ErrorMessage from '@/components/common/ErrorMessage'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const LearningManagement = () => {
  const navigate = useNavigate()
  const { users } = useSelector((state) => state.user)
  const { courses } = useSelector((state) => state.course)
  const { learningRecords, examResults, certificates } = useSelector((state) => state.learning)
  
  const [selectedUser, setSelectedUser] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [error, setError] = useState(null)
  
  const [searchKeyword, setSearchKeyword] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)

  const employees = useMemo(() => {
    return users.filter((u) => u.role === 'employee')
  }, [users])

  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((e) => e.department))]
    return depts
  }, [employees])

  const employeeLearningData = useMemo(() => {
    try {
      return employees.map((employee) => {
        const userRecords = learningRecords.filter((r) => r.userId === employee.id)
        const userExamResults = examResults.filter((r) => r.userId === employee.id)
        const userCertificates = certificates.filter((c) => c.userId === employee.id)
        
        const totalMinutes = userRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
        const completedCount = userRecords.filter((r) => r.completed).length
        const inProgressCount = userRecords.filter((r) => !r.completed && r.progress > 0).length
        const avgScore = userExamResults.length > 0
          ? Math.round(userExamResults.reduce((sum, r) => sum + r.score, 0) / userExamResults.length)
          : 0
        
        return {
          ...employee,
          totalMinutes,
          totalHours: Math.floor(totalMinutes / 60),
          completedCount,
          inProgressCount,
          certificateCount: userCertificates.length,
          avgScore,
          examCount: userExamResults.length,
          passCount: userExamResults.filter((r) => r.passed).length,
        }
      })
    } catch (err) {
      setError('获取员工学习数据失败，请刷新页面重试')
      return []
    }
  }, [employees, learningRecords, examResults, certificates])

  const filteredEmployeeData = useMemo(() => {
    let filtered = [...employeeLearningData]
    
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filtered = filtered.filter((emp) => 
        emp.name.toLowerCase().includes(keyword) ||
        emp.username.toLowerCase().includes(keyword) ||
        emp.email.toLowerCase().includes(keyword)
      )
    }
    
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((emp) => emp.department === departmentFilter)
    }
    
    return filtered.sort((a, b) => b.totalMinutes - a.totalMinutes)
  }, [employeeLearningData, searchKeyword, departmentFilter])

  const platformStats = useMemo(() => {
    const totalMinutes = learningRecords.reduce((sum, r) => sum + r.watchedMinutes, 0)
    const completedCount = learningRecords.filter((r) => r.completed).length
    const passRate = examResults.length > 0
      ? Math.round((examResults.filter((r) => r.passed).length / examResults.length) * 100)
      : 0
    
    return {
      totalEmployees: employees.length,
      totalCourses: courses.length,
      totalLearningHours: Math.floor(totalMinutes / 60),
      completedCourses: completedCount,
      certificateCount: certificates.length,
      examCount: examResults.length,
      passRate,
      avgScore: examResults.length > 0
        ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examResults.length)
        : 0,
    }
  }, [employees, courses, learningRecords, certificates, examResults])

  const userDetailData = useMemo(() => {
    if (!selectedUser) return null
    
    const userRecords = learningRecords.filter((r) => r.userId === selectedUser.id)
    const userExamResults = examResults.filter((r) => r.userId === selectedUser.id)
    const userCertificates = certificates.filter((c) => c.userId === selectedUser.id)
    
    const courseDetails = userRecords.map((record) => {
      const course = courses.find((c) => c.id === record.courseId)
      const examResult = userExamResults.find((e) => e.courseId === record.courseId)
      const certificate = userCertificates.find((c) => c.courseId === record.courseId)
      
      return {
        ...record,
        course,
        examResult,
        certificate,
      }
    }).sort((a, b) => new Date(b.lastWatchedAt || b.enrolledAt) - new Date(a.lastWatchedAt || a.enrolledAt))
    
    return {
      user: selectedUser,
      courses: courseDetails,
      examResults: userExamResults,
      certificates: userCertificates,
      stats: {
        totalMinutes: userRecords.reduce((sum, r) => sum + r.watchedMinutes, 0),
        completedCount: userRecords.filter((r) => r.completed).length,
        avgScore: userExamResults.length > 0
          ? Math.round(userExamResults.reduce((sum, r) => sum + r.score, 0) / userExamResults.length)
          : 0,
      },
    }
  }, [selectedUser, learningRecords, examResults, certificates, courses])

  const handleViewDetail = (user) => {
    try {
      setSelectedUser(user)
      setDetailModalVisible(true)
      setError(null)
    } catch (err) {
      setError('打开详情失败，请重试')
    }
  }

  const handleExport = () => {
    try {
      const data = filteredEmployeeData.map((emp) => ({
        姓名: emp.name,
        部门: emp.department,
        职位: emp.position,
        学习时长: `${emp.totalHours}小时${emp.totalMinutes % 60}分钟`,
        已完成课程: emp.completedCount,
        进行中课程: emp.inProgressCount,
        获得证书: emp.certificateCount,
        考核次数: emp.examCount,
        通过次数: emp.passCount,
        平均成绩: `${emp.avgScore}分`,
      }))
      
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map((row) => Object.values(row).join(','))
      ].join('\n')
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `员工学习数据_${dayjs().format('YYYYMMDD')}.csv`
      link.click()
      
      Modal.success({
        title: '导出成功',
        content: '员工学习数据已导出为 CSV 文件',
      })
    } catch (err) {
      setError('导出数据失败，请重试')
    }
  }

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 80,
      fixed: 'left',
      render: (_, __, index) => {
        const rankIcons = ['👑', '🥈', '🥉']
        if (index < 3) {
          return <Text style={{ fontSize: '20px' }}>{rankIcons[index]}</Text>
        }
        return <Text strong>{index + 1}</Text>
      },
    },
    {
      title: '员工信息',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} size={40} />
          <div>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
              {record.department} · {record.position}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '学习时长',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 120,
      sorter: (a, b) => a.totalMinutes - b.totalMinutes,
      render: (hours, record) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#1677ff' }} />
          <Text strong>{hours}小时</Text>
          <Text type="secondary">{record.totalMinutes % 60}分钟</Text>
        </Space>
      ),
    },
    {
      title: '已完成课程',
      dataIndex: 'completedCount',
      key: 'completedCount',
      width: 120,
      sorter: (a, b) => a.completedCount - b.completedCount,
      render: (count) => (
        <Badge 
          count={count} 
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }}
        />
      ),
    },
    {
      title: '进行中',
      dataIndex: 'inProgressCount',
      key: 'inProgressCount',
      width: 100,
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count}门</Tag>
      ),
    },
    {
      title: '获得证书',
      dataIndex: 'certificateCount',
      key: 'certificateCount',
      width: 120,
      sorter: (a, b) => a.certificateCount - b.certificateCount,
      render: (count) => (
        <Space>
          <TrophyOutlined style={{ color: count > 0 ? '#faad14' : '#d9d9d9' }} />
          <Text>{count}张</Text>
        </Space>
      ),
    },
    {
      title: '平均成绩',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 120,
      sorter: (a, b) => a.avgScore - b.avgScore,
      render: (score) => (
        <Tag color={score >= 80 ? 'green' : score >= 60 ? 'orange' : score > 0 ? 'red' : 'default'}>
          {score > 0 ? `${score}分` : '暂无'}
        </Tag>
      ),
    },
    {
      title: '考核通过率',
      key: 'passRate',
      width: 120,
      render: (_, record) => {
        if (record.examCount === 0) return <Text type="secondary">暂无</Text>
        const rate = Math.round((record.passCount / record.examCount) * 100)
        return (
          <Progress 
            percent={rate} 
            size="small" 
            status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
          />
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Tooltip title="查看学习详情">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
        </Tooltip>
      ),
    },
  ]

  if (error) {
    return <ErrorMessage message={error} onRetry={() => setError(null)} />
  }

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ marginBottom: '4px' }}>
            学习管理
          </Title>
          <Text type="secondary">查看和管理所有员工的学习数据</Text>
        </div>
        <Button
          type="primary"
          icon={<ExportOutlined />}
          onClick={handleExport}
        >
          导出数据
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="员工总数"
              value={platformStats.totalEmployees}
              suffix="人"
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              平台注册员工数量
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="累计学习时长"
              value={platformStats.totalLearningHours}
              suffix="小时"
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              所有员工累计学习
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="完成课程数"
              value={platformStats.completedCourses}
              suffix="门次"
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              员工完成课程总次数
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="证书颁发数"
              value={platformStats.certificateCount}
              suffix="张"
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              平台累计颁发证书
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="考核总次数"
              value={platformStats.examCount}
              suffix="次"
              prefix={<FileTextOutlined style={{ color: '#13c2c2' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              员工参加考核次数
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="考核通过率"
              value={platformStats.passRate}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              考核通过的比例
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="stat-card">
            <Statistic
              title="平均成绩"
              value={platformStats.avgScore}
              suffix="分"
              prefix={<BarChartOutlined style={{ color: '#eb2f96' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              所有考核平均成绩
            </Text>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索员工（姓名/账号/邮箱）"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 240 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            value={departmentFilter}
            onChange={setDepartmentFilter}
            style={{ width: 160 }}
            prefix={<FilterOutlined />}
          >
            <Option value="all">全部部门</Option>
            {departments.map((dept) => (
              <Option key={dept} value={dept}>{dept}</Option>
            ))}
          </Select>
          <Button 
            onClick={() => {
              setSearchKeyword('')
              setDepartmentFilter('all')
            }}
          >
            重置筛选
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredEmployeeData}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="员工学习详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {userDetailData && (
          <div>
            <Card style={{ marginBottom: '16px' }}>
              <Space size={16}>
                <Avatar src={userDetailData.user.avatar} size={64} />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {userDetailData.user.name}
                  </Title>
                  <Text type="secondary">
                    {userDetailData.user.department} · {userDetailData.user.position}
                  </Text>
                </div>
                <Space size={16} style={{ marginLeft: 'auto' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>学习时长</Text>
                    <Text strong style={{ fontSize: '18px', color: '#1677ff' }}>
                      {userDetailData.stats.totalMinutes}分钟
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>已完成</Text>
                    <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                      {userDetailData.stats.completedCount}门
                    </Text>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>平均成绩</Text>
                    <Text strong style={{ fontSize: '18px', color: '#722ed1' }}>
                      {userDetailData.stats.avgScore}分
                    </Text>
                  </div>
                </Space>
              </Space>
            </Card>

            <Tabs
              items={[
                {
                  key: 'courses',
                  label: (
                    <Space>
                      <BookOutlined />
                      学习课程 ({userDetailData.courses.length})
                    </Space>
                  ),
                  children: (
                    <List
                      dataSource={userDetailData.courses}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            padding: '16px',
                            marginBottom: '8px',
                            background: '#fafafa',
                            borderRadius: '8px',
                          }}
                          actions={[
                            item.course && (
                              <Button
                                key="view"
                                type="link"
                                onClick={() => {
                                  navigate(`/course/${item.courseId}`)
                                  setDetailModalVisible(false)
                                }}
                              >
                                查看课程
                              </Button>
                            ),
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              item.course ? (
                                <Avatar
                                  shape="square"
                                  size={60}
                                  src={item.course.cover}
                                  style={{ borderRadius: '4px' }}
                                />
                              ) : (
                                <Avatar size={60} icon={<BookOutlined />} />
                              )
                            }
                            title={
                              <Space>
                                <Text strong>{item.course?.title || '未知课程'}</Text>
                                {item.completed && <Tag color="green">已完成</Tag>}
                                {!item.completed && item.progress > 0 && <Tag color="blue">学习中</Tag>}
                                {item.certificate && <Tag color="gold">已获证书</Tag>}
                              </Space>
                            }
                            description={
                              <Space wrap size={16}>
                                <Text type="secondary">
                                  学习进度：{item.progress}%
                                </Text>
                                <Text type="secondary">
                                  学习时长：{item.watchedMinutes}分钟
                                </Text>
                                {item.examResult && (
                                  <Text type="secondary">
                                    考核成绩：
                                    <Text strong style={{ 
                                      color: item.examResult.passed ? '#52c41a' : '#ff4d4f' 
                                    }}>
                                      {item.examResult.score}分
                                    </Text>
                                  </Text>
                                )}
                                <Progress 
                                  percent={item.progress} 
                                  size="small" 
                                  style={{ width: 150 }}
                                />
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ),
                },
                {
                  key: 'exams',
                  label: (
                    <Space>
                      <FileTextOutlined />
                      考核记录 ({userDetailData.examResults.length})
                    </Space>
                  ),
                  children: userDetailData.examResults.length > 0 ? (
                    <List
                      dataSource={userDetailData.examResults}
                      renderItem={(exam) => {
                        const course = courses.find((c) => c.id === exam.courseId)
                        return (
                          <List.Item
                            style={{
                              padding: '16px',
                              marginBottom: '8px',
                              background: exam.passed ? '#f6ffed' : '#fff2f0',
                              borderRadius: '8px',
                              border: `1px solid ${exam.passed ? '#b7eb8f' : '#ffccc7'}`,
                            }}
                          >
                            <List.Item.Meta
                              avatar={
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: exam.passed ? '#52c41a' : '#ff4d4f',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: '20px',
                                }}>
                                  {exam.passed ? '✓' : '✗'}
                                </div>
                              }
                              title={
                                <Space>
                                  <Text strong>{course?.title || '未知课程'}</Text>
                                  <Tag color={exam.passed ? 'green' : 'red'}>
                                    {exam.score}分
                                  </Tag>
                                </Space>
                              }
                              description={
                                <Space>
                                  <Text type="secondary">
                                    {exam.correctAnswers}/{exam.totalQuestions}题正确
                                  </Text>
                                  <Text type="secondary">
                                    {dayjs(exam.completedAt).format('YYYY-MM-DD HH:mm')}
                                  </Text>
                                </Space>
                              }
                            />
                          </List.Item>
                        )
                      }}
                    />
                  ) : (
                    <EmptyState description="暂无考核记录" />
                  ),
                },
                {
                  key: 'certificates',
                  label: (
                    <Space>
                      <TrophyOutlined />
                      获得证书 ({userDetailData.certificates.length})
                    </Space>
                  ),
                  children: userDetailData.certificates.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {userDetailData.certificates.map((cert) => (
                        <Col xs={24} sm={12} key={cert.id}>
                          <Card
                            className="certificate-card"
                            style={{ textAlign: 'center' }}
                            actions={[
                              <Button
                                key="view"
                                type="link"
                                onClick={() => navigate('/learning/certificates')}
                              >
                                查看全部证书
                              </Button>,
                            ]}
                          >
                            <TrophyOutlined style={{ fontSize: '40px', marginBottom: '8px' }} />
                            <Text strong style={{ display: 'block', marginBottom: '4px' }}>
                              {cert.courseName}
                            </Text>
                            <Tag color="gold">{cert.score}分</Tag>
                            <Text type="secondary" style={{ display: 'block', marginTop: '8px', fontSize: '12px' }}>
                              {dayjs(cert.issuedAt).format('YYYY-MM-DD')}
                            </Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <EmptyState description="暂无获得证书" />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default LearningManagement
