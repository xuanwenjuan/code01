import React, { useState, useEffect } from 'react'
import { 
  Card, Table, Button, Tag, Space, Typography, Modal, 
  message, Statistic, Row, Col, Avatar
} from 'antd'
import { 
  CheckOutlined, CloseOutlined, UserOutlined, 
  FileTextOutlined, EyeOutlined 
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { approveWork, rejectWork, fetchWorks } from '@/store/slices/worksSlice'
import { mockCategories } from '@/mock/data'
import StatusHandler from '@/components/StatusHandler'

const { Title } = Typography

const Admin = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentUser } = useSelector(state => state.user)
  const { users } = useSelector(state => state.user)
  const { works, status } = useSelector(state => state.works)

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      message.warning('无权限访问')
      navigate('/')
      return
    }
    dispatch(fetchWorks())
  }, [dispatch, currentUser, navigate])

  const pendingWorks = works.filter(w => w.status === 'pending')
  const approvedWorks = works.filter(w => w.status === 'approved')
  const rejectedWorks = works.filter(w => w.status === 'rejected')

  const handleApprove = (workId) => {
    Modal.confirm({
      title: '确认审核通过',
      content: '确定要通过该作品的审核吗？',
      onOk: () => {
        dispatch(approveWork(workId))
        message.success('审核通过')
      }
    })
  }

  const handleReject = (workId) => {
    Modal.confirm({
      title: '确认拒绝',
      content: '确定要拒绝该作品吗？',
      onOk: () => {
        dispatch(rejectWork(workId))
        message.success('已拒绝')
      }
    })
  }

  const workColumns = [
    {
      title: '作品',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <img src={record.images[0]} alt={text} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '品类',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => {
        const category = mockCategories.find(c => c.id === cat)
        return category ? `${category.icon} ${category.name}` : cat
      }
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (diff) => {
        const colors = { '初级': 'green', '中级': 'orange', '高级': 'red' }
        return <Tag color={colors[diff]}>{diff}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { pending: 'orange', approved: 'green', rejected: 'red' }
        const texts = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
        return <Tag color={colors[status]}>{texts[status]}</Tag>
      }
    },
    {
      title: '提交时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/works/${record.id}`)}>
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                size="small" 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button 
                size="small" 
                danger 
                icon={<CloseOutlined />} 
                onClick={() => handleReject(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  const userColumns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar) => <Avatar src={avatar} icon={<UserOutlined />} />
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
    }
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>管理后台</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="待审核作品" 
              value={pendingWorks.length} 
              valueStyle={{ color: '#faad14' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="已通过作品" 
              value={approvedWorks.length} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="已拒绝作品" 
              value={rejectedWorks.length} 
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="注册用户" 
              value={users.length} 
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="作品审核" style={{ marginBottom: 24 }}>
        <StatusHandler status={status} data={works}>
          <Table
            columns={workColumns}
            dataSource={works}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </StatusHandler>
      </Card>

      <Card title="用户管理">
        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default Admin
