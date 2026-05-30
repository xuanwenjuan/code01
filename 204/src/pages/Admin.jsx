import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Row, Col, Card, Statistic, Table, Button, Tag, 
  Empty, Result, Modal, message, Space, Tabs, Input, List
} from 'antd'
import { 
  UserOutlined, HeartOutlined, BookOutlined, 
  FileTextOutlined, CheckOutlined, CloseOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { fetchAdminData, approveWork, rejectWork, approveTutorial, rejectTutorial } from '../store/slices/dataSlice'
import { users } from '../data/mockData'
import LoadingState from '../components/LoadingState'

const { TextArea } = Input

const Admin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { adminData, loading, works, tutorials } = useSelector(state => state.data)
  const currentUser = useSelector(state => state.user.currentUser)
  const [detailModal, setDetailModal] = useState({ visible: false, data: null, type: 'work' })
  const [rejectModal, setRejectModal] = useState({ visible: false, id: null, type: 'work' })
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    dispatch(fetchAdminData())
  }, [dispatch])

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '60px 0' }}>
        <Result
          status="403"
          title="403"
          subTitle="抱歉，您没有权限访问管理后台"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          }
        />
      </div>
    )
  }

  if (loading.adminData) {
    return <LoadingState />
  }

  const stats = adminData?.statistics || {}
  const pendingWorks = adminData?.pendingWorks || []
  const pendingTutorials = adminData?.pendingTutorials || []

  const statisticCards = [
    { title: '总用户数', value: stats.totalUsers, icon: <UserOutlined style={{ color: '#1890ff' }} />, color: '#e6f7ff' },
    { title: '总作品数', value: stats.totalWorks, icon: <HeartOutlined style={{ color: '#52c41a' }} />, color: '#f6ffed' },
    { title: '总教程数', value: stats.totalTutorials, icon: <BookOutlined style={{ color: '#722ed1' }} />, color: '#f9f0ff' },
    { title: '总染材数', value: stats.totalMaterials, icon: <FileTextOutlined style={{ color: '#fa8c16' }} />, color: '#fff7e6' }
  ]

  const workColumns = [
    {
      title: '作品名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => setDetailModal({ visible: true, data: record, type: 'work' })}
        >
          {text}
        </Button>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.id, 'work')}
          >
            通过
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.id, 'work')}
          >
            拒绝
          </Button>
        </Space>
      )
    }
  ]

  const tutorialColumns = [
    {
      title: '教程名称',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => setDetailModal({ visible: true, data: record, type: 'tutorial' })}
        >
          {text}
        </Button>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.id, 'tutorial')}
          >
            通过
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.id, 'tutorial')}
          >
            拒绝
          </Button>
        </Space>
      )
    }
  ]

  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'gold' : 'green'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    {
      title: '作品数',
      key: 'works',
      render: (_, record) => (
        <span>{works.filter(w => w.authorId === record.id).length}</span>
      )
    }
  ]

  const handleApprove = (id, type) => {
    if (type === 'work') {
      dispatch(approveWork(id))
      message.success('作品已通过审核')
    } else {
      dispatch(approveTutorial(id))
      message.success('教程已通过审核')
    }
  }

  const handleReject = (id, type) => {
    setRejectModal({ visible: true, id, type })
    setRejectReason('')
  }

  const confirmReject = () => {
    const { id, type } = rejectModal
    if (type === 'work') {
      dispatch(rejectWork({ workId: id, message: rejectReason }))
      message.success('已拒绝该作品')
    } else {
      dispatch(rejectTutorial(id))
      message.success('已拒绝该教程')
    }
    setRejectModal({ visible: false, id: null, type: 'work' })
    setRejectReason('')
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>管理后台</h1>
          <p>平台数据统计与管理</p>
        </div>
      </div>

      <div className="container">
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {statisticCards.map((item, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}>
                    {item.icon}
                  </div>
                  <Statistic title={item.title} value={item.value} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card title="今日新增">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic 
                  title="新注册用户" 
                  value={stats.newUsersToday} 
                  valueStyle={{ color: '#52c41a' }}
                  style={{ marginBottom: 16 }}
                />
                <Statistic 
                  title="新提交作品" 
                  value={stats.newWorksToday} 
                  valueStyle={{ color: '#1890ff' }}
                  style={{ marginBottom: 16 }}
                />
                <Statistic 
                  title="活跃用户" 
                  value={stats.activeUsers} 
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={16}>
            <Card title="审核管理">
              <Tabs
                defaultActiveKey="works"
                items={[
                  { 
                    key: 'works', 
                    label: `待审核作品 (${pendingWorks.length})`,
                    children: pendingWorks.length > 0 ? (
                      <Table
                        dataSource={pendingWorks}
                        columns={workColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    ) : (
                      <Empty description="暂无待审核作品" />
                    )
                  },
                  { 
                    key: 'tutorials', 
                    label: `待审核教程 (${pendingTutorials.length})`,
                    children: pendingTutorials.length > 0 ? (
                      <Table
                        dataSource={pendingTutorials}
                        columns={tutorialColumns}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    ) : (
                      <Empty description="暂无待审核教程" />
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>

        <Card title="用户管理" style={{ marginBottom: 24 }}>
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="id"
            pagination={{
              pageSize: 10
            }}
          />
        </Card>
      </div>

      <Modal
        title={detailModal.type === 'work' ? '作品详情' : '教程详情'}
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null, type: 'work' })}
        footer={[
          <Button key="close" onClick={() => setDetailModal({ visible: false, data: null, type: 'work' })}>
            关闭
          </Button>,
          <Button 
            key="approve" 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => {
              handleApprove(detailModal.data.id, detailModal.type)
              setDetailModal({ visible: false, data: null, type: 'work' })
            }}
          >
            通过审核
          </Button>,
          <Button 
            key="reject" 
            danger 
            icon={<CloseOutlined />}
            onClick={() => {
              handleReject(detailModal.data.id, detailModal.type)
              setDetailModal({ visible: false, data: null, type: 'work' })
            }}
          >
            拒绝
          </Button>
        ]}
        width={600}
      >
        {detailModal.data && (
          <div>
            <h3 style={{ marginBottom: 16 }}>{detailModal.data.title}</h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              作者：{detailModal.data.author} · 提交时间：{detailModal.data.submitTime}
            </p>
            {detailModal.type === 'work' && (
              <div>
                <div style={{ 
                  width: '100%', 
                  height: 200, 
                  background: `url(${works.find(w => w.id === detailModal.data.id)?.image || 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=400&fit=crop'}) center/cover`,
                  borderRadius: 8,
                  marginBottom: 16
                }} />
                <p><strong>作品描述：</strong></p>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  {works.find(w => w.id === detailModal.data.id)?.description || '暂无描述'}
                </p>
              </div>
            )}
            {detailModal.type === 'tutorial' && (
              <div>
                <p><strong>教程简介：</strong></p>
                <p style={{ color: '#666', lineHeight: 1.8 }}>
                  {tutorials.find(t => t.id === detailModal.data.id)?.description || '暂无描述'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="审核拒绝"
        open={rejectModal.visible}
        onCancel={() => setRejectModal({ visible: false, id: null, type: 'work' })}
        footer={[
          <Button key="cancel" onClick={() => setRejectModal({ visible: false, id: null, type: 'work' })}>
            取消
          </Button>,
          <Button 
            key="confirm" 
            danger 
            onClick={confirmReject}
            disabled={!rejectReason.trim()}
          >
            确认拒绝
          </Button>
        ]}
      >
        <p style={{ marginBottom: 16 }}>请填写拒绝原因（将反馈给作者）：</p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请输入拒绝原因..."
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  )
}

export default Admin
