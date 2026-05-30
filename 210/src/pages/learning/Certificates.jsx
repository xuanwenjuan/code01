import React, { useMemo, useState, useEffect } from 'react'
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  QRCode,
  Statistic,
  Select,
  Alert,
  Input,
  DatePicker,
  Tooltip,
  Avatar,
} from 'antd'
import {
  TrophyOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SearchOutlined,
  PrinterOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import EmptyState from '@/components/common/EmptyState'
import ErrorMessage from '@/components/common/ErrorMessage'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const Certificates = () => {
  const { certificates } = useSelector((state) => state.learning)
  const { courses } = useSelector((state) => state.course)
  const { currentUser, users } = useSelector((state) => state.user)
  
  const [previewCert, setPreviewCert] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [error, setError] = useState(null)

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) {
      setSelectedUserId(currentUser?.id)
    }
  }, [currentUser, isAdmin])

  const filteredCertificates = useMemo(() => {
    try {
      let filtered = certificates
      
      const targetId = selectedUserId || (isAdmin ? null : currentUser?.id)
      if (targetId) {
        filtered = filtered.filter((c) => c.userId === targetId)
      }
      
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        filtered = filtered.filter((c) => 
          c.courseName.toLowerCase().includes(keyword) ||
          c.userName.toLowerCase().includes(keyword) ||
          c.certificateNo.toLowerCase().includes(keyword)
        )
      }
      
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange
        filtered = filtered.filter((c) => {
          const issueDate = dayjs(c.issuedAt)
          return issueDate.isAfter(start.startOf('day')) && issueDate.isBefore(end.endOf('day'))
        })
      }
      
      return filtered
        .map((cert) => {
          const course = courses.find((c) => c.id === cert.courseId)
          const user = users.find((u) => u.id === cert.userId)
          return { ...cert, course, user }
        })
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
    } catch (err) {
      setError('获取证书数据失败，请刷新页面重试')
      return []
    }
  }, [certificates, courses, users, selectedUserId, searchKeyword, dateRange, isAdmin, currentUser])

  const stats = useMemo(() => {
    return {
      total: filteredCertificates.length,
      totalScore: filteredCertificates.reduce((sum, c) => sum + c.score, 0),
      avgScore: filteredCertificates.length > 0
        ? Math.round(filteredCertificates.reduce((sum, c) => sum + c.score, 0) / filteredCertificates.length)
        : 0,
      highScoreCount: filteredCertificates.filter((c) => c.score >= 90).length,
    }
  }, [filteredCertificates])

  const handlePreview = (cert) => {
    try {
      setPreviewCert(cert)
      setError(null)
    } catch (err) {
      setError('打开证书预览失败，请重试')
    }
  }

  const handleDownload = () => {
    try {
      if (!previewCert) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 800
      canvas.height = 600
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#4facfe')
      gradient.addColorStop(1, '#00f2fe')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80)
      
      ctx.strokeStyle = '#faad14'
      ctx.lineWidth = 3
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)
      
      ctx.fillStyle = '#333'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('培训合格证书', canvas.width / 2, 130)
      
      ctx.font = '20px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText('兹证明', canvas.width / 2, 200)
      
      ctx.font = 'bold 28px Arial'
      ctx.fillStyle = '#333'
      ctx.fillText(previewCert.userName, canvas.width / 2, 260)
      
      ctx.font = '18px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText('已完成', canvas.width / 2, 310)
      
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#333'
      ctx.fillText(`《${previewCert.courseName}》`, canvas.width / 2, 360)
      
      ctx.font = '16px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(`证书编号：${previewCert.certificateNo}`, canvas.width / 2, 420)
      ctx.fillText(`颁发日期：${dayjs(previewCert.issuedAt).format('YYYY年MM月DD日')}`, canvas.width / 2, 450)
      ctx.fillText(`有效期至：${dayjs(previewCert.validUntil).format('YYYY年MM月DD日')}`, canvas.width / 2, 480)
      
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = previewCert.score >= 90 ? '#52c41a' : previewCert.score >= 60 ? '#faad14' : '#ff4d4f'
      ctx.fillText(`考核成绩：${previewCert.score}分`, canvas.width / 2, 530)
      
      const link = document.createElement('a')
      link.download = `证书_${previewCert.userName}_${previewCert.courseName}_${dayjs().format('YYYYMMDD')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      Modal.success({
        title: '下载成功',
        content: `证书已保存：${link.download}`,
      })
    } catch (err) {
      setError('下载证书失败，请重试')
    }
  }

  const handlePrint = () => {
    try {
      if (!previewCert) return
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>培训合格证书 - ${previewCert.certificateNo}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
                text-align: center;
              }
              .certificate {
                border: 5px solid #faad14;
                padding: 60px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                min-height: 500px;
              }
              .inner {
                background: white;
                padding: 40px;
                border: 2px solid #faad14;
              }
              h1 { color: #333; margin-bottom: 20px; }
              .name { font-size: 32px; font-weight: bold; margin: 20px 0; }
              .course { font-size: 24px; margin: 15px 0; }
              .info { color: #666; margin: 10px 0; }
              .score { font-size: 24px; color: #52c41a; font-weight: bold; margin-top: 20px; }
              @media print {
                body { margin: 0; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="inner">
                <h1>🏆 培训合格证书</h1>
                <p>兹证明</p>
                <p class="name">${previewCert.userName}</p>
                <p>已完成</p>
                <p class="course">《${previewCert.courseName}》</p>
                <p class="info">证书编号：${previewCert.certificateNo}</p>
                <p class="info">颁发日期：${dayjs(previewCert.issuedAt).format('YYYY年MM月DD日')}</p>
                <p class="info">有效期至：${dayjs(previewCert.validUntil).format('YYYY年MM月DD日')}</p>
                <p class="score">考核成绩：${previewCert.score}分</p>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; cursor: pointer;">
                🖨️ 打印证书
              </button>
            </div>
          </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (err) {
      setError('打印证书失败，请重试')
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
            学习证书
          </Title>
          <Text type="secondary">
            {isAdmin ? '查看和管理所有员工的学习证书' : '查看和管理你获得的学习证书'}
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
          message="管理员证书视图"
          description="当前显示所有员工的证书数据，可选择特定员工查看其个人证书详情。"
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={isAdmin && !selectedUserId ? "平台证书总数" : "已获得证书"}
              value={stats.total}
              suffix="张"
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              累计颁发证书数量
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="平均分数"
              value={stats.avgScore}
              suffix="分"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              所有证书平均成绩
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="优秀证书"
              value={stats.highScoreCount}
              suffix="张"
              prefix={<TrophyOutlined style={{ color: '#722ed1' }} />}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              90分以上优秀成绩
            </Text>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Input
            placeholder="搜索证书（课程名称/员工姓名/证书编号）"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['开始日期', '结束日期']}
          />
          <Button 
            onClick={() => {
              setSearchKeyword('')
              setDateRange(null)
            }}
          >
            重置筛选
          </Button>
        </div>
      </Card>

      {filteredCertificates.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredCertificates.map((cert) => (
            <Col xs={24} sm={12} lg={8} key={cert.id}>
              <Card
                className="card-hover"
                hoverable
                cover={
                  <div 
                    className="certificate-card" 
                    style={{ 
                      height: '240px', 
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }} 
                    onClick={() => handlePreview(cert)}
                  >
                    <TrophyOutlined style={{ fontSize: '56px', marginBottom: '16px' }} />
                    <Title level={4} style={{ color: '#fff', marginBottom: '8px' }}>
                      培训合格证书
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: '16px', fontSize: '14px' }}>
                      {cert.courseName}
                    </Text>
                    <Space>
                      <Tag color={cert.score >= 90 ? 'purple' : cert.score >= 80 ? 'gold' : 'green'}>
                        {cert.score}分
                      </Tag>
                      <Tag color="green">已通过</Tag>
                    </Space>
                    {isAdmin && !selectedUserId && (
                      <Tag color="blue" style={{ marginTop: '8px' }}>
                        <UserOutlined /> {cert.userName}
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  <Tooltip title="查看证书详情">
                    <Button
                      key="preview"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(cert)}
                    >
                      查看
                    </Button>
                  </Tooltip>,
                  <Tooltip title="下载证书图片">
                    <Button
                      key="download"
                      type="link"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        setPreviewCert(cert)
                        setTimeout(() => handleDownload(), 100)
                      }}
                    >
                      下载
                    </Button>
                  </Tooltip>,
                  <Tooltip title="打印证书">
                    <Button
                      key="print"
                      type="link"
                      icon={<PrinterOutlined />}
                      onClick={() => {
                        setPreviewCert(cert)
                        setTimeout(() => handlePrint(), 100)
                      }}
                    >
                      打印
                    </Button>
                  </Tooltip>,
                ]}
              >
                <Card.Meta
                  title={cert.userName}
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <IdcardOutlined /> 证书编号：{cert.certificateNo}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <CalendarOutlined /> 颁发日期：{dayjs(cert.issuedAt).format('YYYY-MM-DD')}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined /> 有效期至：{dayjs(cert.validUntil).format('YYYY-MM-DD')}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState
          description={isAdmin && !selectedUserId ? '暂无证书数据' : '暂无证书，完成课程并通过考核后将获得证书'}
          actionText={!isAdmin ? '去学习' : null}
          onAction={!isAdmin ? () => window.location.href = '/courses' : null}
        />
      )}

      <Modal
        title="证书详情"
        open={!!previewCert}
        onCancel={() => setPreviewCert(null)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
            打印证书
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            下载证书
          </Button>,
          <Button key="close" onClick={() => setPreviewCert(null)}>
            关闭
          </Button>,
        ]}
        width={650}
      >
        {previewCert && (
          <div>
            <div
              className="certificate-card"
              style={{
                padding: '48px 32px',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <TrophyOutlined style={{ fontSize: '64px', marginBottom: '24px' }} />
              <Title level={3} style={{ color: '#fff', marginBottom: '12px' }}>
                培训合格证书
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                兹证明
              </Text>
              <Title level={4} style={{ color: '#fff', marginBottom: '16px' }}>
                {previewCert.userName}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                已完成
              </Text>
              <Title level={5} style={{ color: '#fff', marginBottom: '24px' }}>
                《{previewCert.courseName}》
              </Title>
              <Space size={16}>
                <Tag 
                  color={previewCert.score >= 90 ? 'purple' : previewCert.score >= 80 ? 'gold' : 'green'} 
                  style={{ fontSize: '14px', padding: '4px 12px' }}
                >
                  成绩：{previewCert.score}分
                </Tag>
                <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                  考核通过
                </Tag>
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    证书编号
                  </Text>
                  <Text strong copyable>{previewCert.certificateNo}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    颁发日期
                  </Text>
                  <Text strong>{dayjs(previewCert.issuedAt).format('YYYY年MM月DD日')}</Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                    有效期至
                  </Text>
                  <Text strong style={{ color: '#faad14' }}>
                    {dayjs(previewCert.validUntil).format('YYYY年MM月DD日')}
                  </Text>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <QRCode value={previewCert.certificateNo} size={80} />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '8px' }}>
                    扫码验证证书真伪
                  </Text>
                </Card>
              </Col>
            </Row>

            <Alert
              message="证书说明"
              description="本证书为本地模拟生成的培训合格证书，可用于学习记录展示，不具备法律效力。"
              type="info"
              showIcon
              style={{ marginTop: '16px' }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Certificates
