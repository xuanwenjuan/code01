import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Steps,
  message,
  Modal,
  Descriptions,
  Empty,
  Spin,
  Badge,
  Timeline,
} from 'antd'
import { EyeOutlined, AuditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import { afterSaleData } from '@/mock'
import { AfterSale as AfterSaleType, AfterSaleQueryParams, AfterSaleProgress } from '@/types'
import ModalForm from '@/components/ModalForm'
import QueryForm from '@/components/QueryForm'

const { Step } = Steps

type AuditStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'completed'

interface AuditFormData {
  status: AuditStatus
  auditOpinion: string
}

const statusFlowMap: Record<AuditStatus, { next: AuditStatus[]; label: string }> = {
  pending: { next: ['processing'], label: '待处理' },
  processing: { next: ['approved', 'rejected'], label: '处理中' },
  approved: { next: ['completed'], label: '已通过' },
  rejected: { next: [], label: '已拒绝' },
  completed: { next: [], label: '已完成' },
}

function AfterSales() {
  const { afterSales, setAfterSales, updateAfterSale } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedAfterSale, setSelectedAfterSale] = useState<AfterSaleType | null>(null)
  const [queryParams, setQueryParams] = useState<AfterSaleQueryParams>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (afterSales.length === 0) {
      setLoading(true)
      setTimeout(() => {
        setAfterSales(afterSaleData)
        setLoading(false)
      }, 500)
    }
  }, [afterSales.length, setAfterSales])

  const getTypeLabel = useCallback((type: string) => {
    const map: Record<string, string> = {
      return: '退货',
      exchange: '换货',
      refund: '仅退款',
    }
    return map[type] || type
  }, [])

  const getStatusLabel = useCallback((status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: '待处理', color: 'warning' },
      processing: { label: '处理中', color: 'processing' },
      approved: { label: '已通过', color: 'success' },
      rejected: { label: '已拒绝', color: 'error' },
      completed: { label: '已完成', color: 'default' },
    }
    return map[status] || { label: status, color: 'default' }
  }, [])

  const getAuditOptions = useCallback((currentStatus: AuditStatus) => {
    const statusInfo = statusFlowMap[currentStatus]
    return statusInfo.next.map((status) => ({
      label: statusFlowMap[status].label,
      value: status,
    }))
  }, [])

  const queryFields = [
    {
      name: 'orderNo',
      label: '售后单号',
      type: 'input' as const,
      placeholder: '请输入售后单号',
    },
    {
      name: 'type',
      label: '售后类型',
      type: 'select' as const,
      placeholder: '请选择类型',
      options: [
        { label: '退货', value: 'return' },
        { label: '换货', value: 'exchange' },
        { label: '仅退款', value: 'refund' },
      ],
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '待处理', value: 'pending' },
        { label: '处理中', value: 'processing' },
        { label: '已通过', value: 'approved' },
        { label: '已拒绝', value: 'rejected' },
        { label: '已完成', value: 'completed' },
      ],
    },
    {
      name: 'userName',
      label: '用户',
      type: 'input' as const,
      placeholder: '请输入用户名',
    },
  ]

  const filteredAfterSales = useMemo(() => {
    return afterSales.filter((item) => {
      if (queryParams.orderNo && !item.orderNo.includes(queryParams.orderNo)) {
        return false
      }
      if (queryParams.type && item.type !== queryParams.type) {
        return false
      }
      if (queryParams.status && item.status !== queryParams.status) {
        return false
      }
      if (queryParams.userName && !item.userName.includes(queryParams.userName)) {
        return false
      }
      return true
    })
  }, [afterSales, queryParams])

  const handleSearch = (values: AfterSaleQueryParams) => {
    setLoading(true)
    setTimeout(() => {
      setQueryParams(values)
      setLoading(false)
      message.success('查询成功')
    }, 300)
  }

  const handleReset = () => {
    setQueryParams({})
    message.info('已重置查询条件')
  }

  const handleAudit = (record: AfterSaleType) => {
    setSelectedAfterSale(record)
    setModalOpen(true)
  }

  const handleViewDetail = (record: AfterSaleType) => {
    setSelectedAfterSale(record)
    setDetailModalOpen(true)
  }

  const handleQuickAction = (record: AfterSaleType, action: 'approve' | 'reject') => {
    const now = new Date().toLocaleString()
    const newStatus: AuditStatus = action === 'approve' ? 'approved' : 'rejected'

    const newProgress: AfterSaleProgress = {
      id: Date.now().toString(),
      status: statusFlowMap[newStatus].label,
      description: action === 'approve' ? '审核通过' : '审核拒绝',
      operator: '管理员',
      time: now,
    }

    updateAfterSale(record.id, {
      status: newStatus,
      auditOpinion: action === 'approve' ? '同意售后申请' : '售后申请已拒绝',
      auditTime: now,
      progress: [...record.progress, newProgress],
    })

    message.success(action === 'approve' ? '已通过审核' : '已拒绝审核')
  }

  const handleComplete = (record: AfterSaleType) => {
    const now = new Date().toLocaleString()
    const newProgress: AfterSaleProgress = {
      id: Date.now().toString(),
      status: '已完成',
      description: '售后流程已完成',
      operator: '管理员',
      time: now,
    }

    updateAfterSale(record.id, {
      status: 'completed',
      progress: [...record.progress, newProgress],
    })

    message.success('售后已完成')
  }

  const handleOk = (values: AuditFormData) => {
    if (!selectedAfterSale) return

    const now = new Date().toLocaleString()
    const newStatus = values.status as AuditStatus

    const newProgress: AfterSaleProgress = {
      id: Date.now().toString(),
      status: statusFlowMap[newStatus].label,
      description: values.auditOpinion,
      operator: '管理员',
      time: now,
    }

    setLoading(true)
    setTimeout(() => {
      updateAfterSale(selectedAfterSale.id, {
        status: newStatus,
        auditOpinion: values.auditOpinion,
        auditTime: now,
        progress: [...selectedAfterSale.progress, newProgress],
      })
      setLoading(false)
      setModalOpen(false)
      message.success('审核成功')
    }, 500)
  }

  const modalConfig = {
    title: '售后审核',
    width: 600,
    fields: [
      {
        name: 'status',
        label: '审核操作',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择审核结果' }],
        options: selectedAfterSale
          ? getAuditOptions(selectedAfterSale.status as AuditStatus)
          : [],
      },
      {
        name: 'auditOpinion',
        label: '审核意见',
        type: 'textarea' as const,
        rules: [{ required: true, message: '请输入审核意见' }],
      },
    ],
  }

  const columns = [
    {
      title: '售后单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color="blue">{getTypeLabel(type)}</Tag>,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusInfo = getStatusLabel(status)
        return (
          <Badge status={statusInfo.color as 'success' | 'processing' | 'default' | 'error' | 'warning'} text={statusInfo.label}>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Badge>
        )
      },
    },
    {
      title: '处理进度',
      key: 'progress',
      width: 280,
      render: (_: unknown, record: AfterSaleType) => (
        <Steps size="small" current={record.progress.length - 1}>
          <Step title="提交申请" />
          {record.progress.slice(1).map((p) => (
            <Step key={p.id} title={p.status} />
          ))}
        </Steps>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 200,
      render: (_: unknown, record: AfterSaleType) => (
        <Space size="small" wrap>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" icon={<AuditOutlined />} onClick={() => handleAudit(record)}>
                审核
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleQuickAction(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleQuickAction(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleComplete(record)}>
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>订单售后处理管理</h2>
      </div>

      <QueryForm<AfterSaleQueryParams>
        fields={queryFields}
        onSearch={handleSearch}
        onReset={handleReset}
        col={4}
      />

      <Spin spinning={loading} tip="加载中...">
        <Table
          columns={columns}
          dataSource={filteredAfterSales}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            size: 'default',
            showLessItems: true,
          }}
          locale={{
            emptyText: <Empty description="暂无售后数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
          }}
          size="small"
        />
      </Spin>

      <ModalForm<AuditFormData>
        open={modalOpen}
        title="售后审核"
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        config={modalConfig}
      />

      <Modal
        open={detailModalOpen}
        title="售后详情"
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {selectedAfterSale && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }} size="small">
              <Descriptions.Item label="售后单号" span={2}>
                {selectedAfterSale.orderNo}
              </Descriptions.Item>
              <Descriptions.Item label="用户">{selectedAfterSale.userName}</Descriptions.Item>
              <Descriptions.Item label="类型">{getTypeLabel(selectedAfterSale.type)}</Descriptions.Item>
              <Descriptions.Item label="原因" span={2}>
                {selectedAfterSale.reason}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusLabel(selectedAfterSale.status).color as 'success' | 'processing' | 'default' | 'error' | 'warning' | 'blue' | 'green' | 'red'}>
                  {getStatusLabel(selectedAfterSale.status).label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedAfterSale.createdAt}</Descriptions.Item>
              {selectedAfterSale.auditOpinion && (
                <Descriptions.Item label="审核意见" span={2}>
                  {selectedAfterSale.auditOpinion}
                </Descriptions.Item>
              )}
            </Descriptions>

            <h4 style={{ marginBottom: 12 }}>商品信息</h4>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }} size="small">
              {selectedAfterSale.items.map((item) => (
                <React.Fragment key={item.id}>
                  <Descriptions.Item label="商品名称" span={2}>
                    {item.productName}
                  </Descriptions.Item>
                  <Descriptions.Item label="规格" span={2}>
                    颜色: {item.specs.颜色}, 尺寸: {item.specs.尺寸}
                  </Descriptions.Item>
                  <Descriptions.Item label="数量">{item.quantity}</Descriptions.Item>
                  <Descriptions.Item label="单价">¥{item.price}</Descriptions.Item>
                </React.Fragment>
              ))}
            </Descriptions>

            <h4 style={{ marginBottom: 12 }}>处理进度</h4>
            <Timeline>
              {selectedAfterSale.progress.map((p, index) => (
                <Timeline.Item
                  key={p.id}
                  color={index === selectedAfterSale.progress.length - 1 ? 'blue' : 'gray'}
                >
                  <div style={{ fontWeight: 500 }}>{p.status}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{p.description}</div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                    操作人: {p.operator} | 时间: {p.time}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AfterSales
