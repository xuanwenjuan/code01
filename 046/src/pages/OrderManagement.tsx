import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Descriptions,
  Badge,
  Timeline,
  Divider,
  Form,
  message,
  Empty,
  Spin,
  Progress,
  Select
} from 'antd'
import {
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons'
import { Order, OrderStatus, OrderType, OrderStatusMap, OrderTypeMap, OrderItem } from '@/types'
import { useOrderStore } from '@/stores'
import { mockApi } from '@/mock'
import CommonModal from '@/components/CommonModal'
import SearchForm, { SearchInput, SearchSelect } from '@/components/SearchForm'
import { useOrderAutoRefresh } from '@/hooks/useOrderAutoRefresh'
import { useDebounce } from '@/hooks/useDebounce'

const { Option } = Select

const typeOptions = Object.entries(OrderTypeMap).map(([value, label]) => ({
  label,
  value
}))

const statusOptions = Object.entries(OrderStatusMap).map(([value, label]) => ({
  label,
  value
}))

interface FilterValues {
  name?: string
  type?: string
  status?: string
}

export default function OrderManagement() {
  const { orders, setOrders, updateOrderStatus } = useOrderStore()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const debouncedFilters = useDebounce(filters, 300)

  const handleUpdateOrder = useCallback((id: string, status: OrderStatus) => {
    updateOrderStatus(id, status)
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => {
        if (prev) {
          return { ...prev, status, statusName: OrderStatusMap[status] }
        }
        return prev
      })
    }
  }, [updateOrderStatus, selectedOrder?.id])

  const { statusFlow, getNextStatus, getStatusProgress } = useOrderAutoRefresh(
    orders,
    handleUpdateOrder,
    autoRefreshEnabled,
    5000
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await mockApi.getOrders()
        if (orders.length === 0) setOrders(data)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSearch = (values: FilterValues) => {
    setFilters(values)
  }

  const handleReset = () => {
    setFilters({})
    searchForm.resetFields()
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchSearch = !debouncedFilters.name || 
        order.orderNo.includes(debouncedFilters.name) || 
        (order.customerName && order.customerName.includes(debouncedFilters.name))
      const matchType = !debouncedFilters.type || order.type === debouncedFilters.type
      const matchStatus = !debouncedFilters.status || order.status === debouncedFilters.status
      return matchSearch && matchType && matchStatus
    })
  }, [orders, debouncedFilters])

  const totalAmount = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0)
  }, [orders])

  const todayOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled').length
  }, [orders])

  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'completed').length
  }, [orders])

  const pendingOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'pending' || o.status === 'making' || o.status === 'ready').length
  }, [orders])

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      render: (orderNo: string) => <span style={{ fontFamily: 'monospace' }}>{orderNo}</span>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: OrderType) => <Tag color={type === 'dine_in' ? 'blue' : 'purple'}>{OrderTypeMap[type]}</Tag>
    },
    {
      title: '桌号',
      dataIndex: 'tableNo',
      key: 'tableNo',
      width: 80,
      render: (tableNo: string) => tableNo || '-'
    },
    {
      title: '顾客',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{amount}</span>
    },
    {
      title: '进度',
      dataIndex: 'status',
      key: 'progress',
      width: 150,
      render: (status: OrderStatus) => {
        const progress = getStatusProgress(status)
        return (
          <Progress
            percent={progress}
            size="small"
            status={status === 'cancelled' ? 'exception' : 'active'}
            strokeColor={status === 'completed' ? '#52c41a' : '#13c2c2'}
            showInfo={false}
          />
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Badge
          status={status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'processing'}
          text={<Tag color={status === 'cancelled' ? 'red' : status === 'completed' ? 'green' : 'blue'}>{OrderStatusMap[status]}</Tag>}
        />
      )
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Order) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status !== 'cancelled' && record.status !== 'completed' && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                const nextStatus = getNextStatus(record.status)
                if (nextStatus) {
                  handleUpdateOrder(record.id, nextStatus)
                  message.success('状态已更新')
                }
              }}
            >
              {record.status === 'pending' ? '接单' : record.status === 'making' ? '出餐' : '完成'}
            </Button>
          )}
        </Space>
      )
    }
  ]

  const handleViewDetail = (record: Order) => {
    setSelectedOrder(record)
    setIsDetailOpen(true)
  }

  const renderOrderItems = (items: OrderItem[]) => {
    return items.map((item, index) => (
      <div key={index} style={{ padding: '8px 0', borderBottom: index < items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>{item.drinkName}</span>
          <span>¥{item.price} × {item.quantity}</span>
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
          {Object.entries(item.specs).map(([k, v]) => `${k}: ${v}`).join(' | ')}
        </div>
      </div>
    ))
  }

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单"
              value={todayOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedOrders}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={pendingOrders}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="营业总额"
              value={totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={autoRefreshEnabled ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            type={autoRefreshEnabled ? 'primary' : 'default'}
          >
            {autoRefreshEnabled ? '暂停自动刷新' : '开启自动刷新'}
          </Button>
          {autoRefreshEnabled && (
            <Tag color="green">
              <Badge status="processing" />
              每 5 秒自动刷新
            </Tag>
          )}
        </Space>

        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <SearchInput name="name" placeholder="搜索订单号/顾客" />
          <SearchSelect name="type" placeholder="订单类型" options={typeOptions} />
          <SearchSelect name="status" placeholder="订单状态" options={statusOptions} />
        </SearchForm>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          loading={
            loading ? {
              indicator: <Spin size="large" />,
              tip: '数据加载中...'
            } : false
          }
          locale={{
            emptyText: <Empty description="暂无订单数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }}
        />
      </Card>

      <CommonModal
        visible={isDetailOpen}
        title="订单详情"
        onCancel={() => setIsDetailOpen(false)}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{selectedOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="订单类型">
                <Tag color={selectedOrder.type === 'dine_in' ? 'blue' : 'purple'}>{selectedOrder.typeName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="顾客姓名">{selectedOrder.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.customerPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="桌号">{selectedOrder.tableNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={selectedOrder.status === 'cancelled' ? 'red' : selectedOrder.status === 'completed' ? 'green' : 'blue'}>
                  {selectedOrder.statusName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="下单时间" span={2}>
                {selectedOrder.createTime}
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {selectedOrder.remark || '无'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">商品清单</Divider>
            <div style={{ marginBottom: 16 }}>
              {renderOrderItems(selectedOrder.items)}
              <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 600, color: '#ff4d4f', fontSize: 16 }}>
                总计：¥{selectedOrder.totalAmount}
              </div>
            </div>

            <Divider orientation="left">订单进度</Divider>
            <Timeline
              items={statusFlow.map((status, index) => ({
                color: selectedOrder.status === status ? 'green' : statusFlow.indexOf(selectedOrder.status) > index ? 'blue' : 'gray',
                children: OrderStatusMap[status],
                dot: status === selectedOrder.status ? <Badge status="processing" /> : undefined
              }))}
            />
          </div>
        )}
      </CommonModal>
    </div>
  )
}
