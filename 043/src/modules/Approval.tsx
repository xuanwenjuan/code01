import { useState, useMemo, useCallback } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  Avatar,
  Badge,
  Spin,
  Empty,
  Card,
  Statistic,
  Row,
  Col
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WalletOutlined,
  LaptopOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useAppStore } from '@/store'
import ApprovalModal from '@/components/ApprovalModal'
import type { Approval } from '@/types'
import styles from './Approval.module.css'

const { Option } = Select

const ApprovalModule = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'my' | 'all'>('pending')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isModalVisible, setIsModalVisible] = useState(false)

  const {
    approvals,
    currentUser,
    selectedApproval,
    setSelectedApproval,
    updateApprovalAndNotify,
    setLoading,
    isLoading
  } = useAppStore()

  const handleApprove = useCallback((status: 'approved' | 'rejected', comment: string) => {
    if (!selectedApproval) return

    setLoading('approvalAction', true)

    setTimeout(() => {
      updateApprovalAndNotify(selectedApproval.id, status, comment)
      setLoading('approvalAction', false)
      setIsModalVisible(false)
    }, 500)
  }, [selectedApproval, updateApprovalAndNotify, setLoading])

  const handleViewDetail = useCallback((approval: Approval) => {
    setSelectedApproval(approval)
    setIsModalVisible(true)
  }, [setSelectedApproval])

  const typeIcon: Record<string, { icon: React.ReactNode; color: string }> = {
    leave: { icon: <FileTextOutlined />, color: 'blue' },
    expense: { icon: <WalletOutlined />, color: 'orange' },
    purchase: { icon: <LaptopOutlined />, color: 'purple' }
  }

  const statusConfig: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
    pending: { text: '待审批', color: 'orange', icon: <ClockCircleOutlined /> },
    approved: { text: '已通过', color: 'green', icon: <CheckOutlined /> },
    rejected: { text: '已驳回', color: 'red', icon: <CloseOutlined /> }
  }

  const typeLabels: Record<string, string> = {
    leave: '请假',
    expense: '报销',
    purchase: '采购'
  }

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'pending'
        ? approval.status === 'pending'
        : approval.applicantId === currentUser?.id
      const matchesType = filterType === 'all' || approval.type === filterType
      const matchesStatus = filterStatus === 'all' || approval.status === filterStatus
      return matchesTab && matchesType && matchesStatus
    })
  }, [approvals, activeTab, filterType, filterStatus, currentUser?.id])

  const stats = useMemo(() => ({
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
    my: approvals.filter(a => a.applicantId === currentUser?.id).length
  }), [approvals, currentUser?.id])

  const columns: ColumnsType<Approval> = [
    {
      title: '类型',
      key: 'type',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tag icon={typeIcon[record.type].icon} color={typeIcon[record.type].color} />
      )
    },
    {
      title: '标题',
      key: 'title',
      ellipsis: true,
      render: (_, record) => (
        <div className={styles.titleCell}>
          <div className={styles.approvalTitle}>{record.title}</div>
          <div className={styles.approvalDesc}>{record.description}</div>
        </div>
      )
    },
    {
      title: '申请人',
      key: 'applicant',
      width: 120,
      render: (_, record) => (
        <Space>
          <Avatar size="small" src={record.applicantAvatar} />
          <span>{record.applicantName}</span>
        </Space>
      )
    },
    {
      title: '金额',
      key: 'amount',
      width: 100,
      align: 'right',
      render: (_, record) =>
        record.amount ? `¥${record.amount.toLocaleString()}` : '-'
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Badge
          status={statusConfig[record.status].color as any}
          text={
            <Space size="small">
              {statusConfig[record.status].icon}
              {statusConfig[record.status].text}
            </Space>
          }
        />
      )
    },
    {
      title: '申请时间',
      key: 'createdAt',
      width: 160,
      render: (_, record) =>
        new Date(record.createdAt).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
          详情
        </Button>
      )
    }
  ]

  return (
    <div className={styles.container}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
            title="待我审批"
            value={stats.pending}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已通过"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已驳回"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
            title="我的申请"
            value={stats.my}
            valueStyle={{ color: '#1890ff' }}
            prefix={<FileTextOutlined />
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space className={styles.filterBar}>
          <Space>
            <Button
              type={activeTab === 'pending' ? 'primary' : 'text'}
              onClick={() => setActiveTab('pending')}
            >
              待我审批
            </Button>
            <Button
              type={activeTab === 'my' ? 'primary' : 'text'}
              onClick={() => setActiveTab('my')}
            >
              我的申请
            </Button>
            <Button
              type={activeTab === 'all' ? 'primary' : 'text'}
              onClick={() => setActiveTab('all')}
            >
              全部审批
            </Button>
          </Space>

          <Space>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="all">全部类型</Option>
              <Option value="leave">请假</Option>
              <Option value="expense">报销</Option>
              <Option value="purchase">采购</Option>
            </Select>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待审批</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已驳回</Option>
            </Select>
          </Space>
        </Space>

        <Spin spinning={isLoading['approvalList']}>
          {filteredApprovals.length === 0 ? (
            <Empty
              description="暂无审批数据"
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredApprovals}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`
              }}
            />
          )}
        </Spin>
      </Card>

      <ApprovalModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        approval={selectedApproval}
        onApprove={handleApprove}
        loading={isLoading['approvalAction']}
      />
    </div>
  )
}

export default ApprovalModule
