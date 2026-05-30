import { useEffect, useState } from 'react'
import {
  Table,
  Tag,
  Select,
  Input,
  Space,
  Card,
  Button,
  Descriptions,
  Image,
  Steps,
  Divider,
  List,
  Row,
  Col,
  message,
} from 'antd'
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import useStore from '../store'
import { orders as mockOrders } from '../mock'
import { Order, OrderStatus, OrderItem } from '../types'
import CommonModal from './CommonModal'

const { Option } = Select

const orderStatusMap: Record<OrderStatus, { text: string; color: string }> = {
  pending_payment: { text: '待付款', color: 'orange' },
  pending_shipment: { text: '待发货', color: 'blue' },
  shipping: { text: '运输中', color: 'cyan' },
  completed: { text: '已完成', color: 'green' },
  refunded: { text: '已退款', color: 'red' },
}

const OrderManagement: React.FC = () => {
  const { orders, setOrders, updateOrderStatus } = useStore()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [searchText, setSearchText] = useState('')
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (orders.length === 0) {
      setOrders(mockOrders)
    }
  }, [])

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus, actionText: string) => {
    updateOrderStatus(orderId, newStatus)
    message.success(`订单${actionText}成功`)
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchStatus = statusFilter === 'all' || order.status === statusFilter
    const matchSearch =
      order.orderNo.includes(searchText) || order.buyerName.includes(searchText)
    return matchStatus && matchSearch
  })

  const columns: ColumnsType<Order> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      fixed: 'left',
      render: (text: string) => <span style={{ fontFamily: 'monospace' }}>{text}</span>,
    },
    {
      title: '商品',
      dataIndex: 'items',
      key: 'items',
      width: 260,
      render: (items: OrderItem[]) => (
        <div>
          {items.slice(0, 2).map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: index < Math.min(items.length, 2) - 1 ? 4 : 0,
              }}
            >
              <Image
                width={40}
                height={40}
                src={item.productImage}
                style={{ objectFit: 'cover', borderRadius: 4 }}
              />
              <span style={{ fontSize: 12 }} ellipsis>
                {item.productName}
              </span>
            </div>
          ))}
          {items.length > 2 && (
            <span style={{ fontSize: 12, color: '#999' }}>等{items.length}件商品</span>
          )}
        </div>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => (
        <strong style={{ color: '#ff4d4f', fontSize: 15 }}>¥{amount.toFixed(2)}</strong>
      ),
    },
    {
      title: '买家',
      dataIndex: 'buyerName',
      key: 'buyerName',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => {
        const { text, color } = orderStatusMap[status]
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {text}
          </Tag>
        )
      },
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: Order) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record)
              setDetailModalOpen(true)
            }}
          >
            详情
          </Button>
          {record.status === 'pending_payment' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'pending_shipment', '标记已付款')}
            >
              标记已付款
            </Button>
          )}
          {record.status === 'pending_shipment' && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              onClick={() => handleStatusUpdate(record.id, 'shipping', '发货')}
            >
              发货
            </Button>
          )}
          {record.status === 'shipping' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleStatusUpdate(record.id, 'completed', '完成')}
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Card title="订单管理">
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input
              placeholder="搜索订单号/买家"
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="订单状态"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter as (value: string) => void}
              allowClear
            >
              <Option value="all">全部状态</Option>
              {Object.entries(orderStatusMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.text}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条订单`,
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
      </Card>

      <CommonModal
        title="订单详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        onOk={() => setDetailModalOpen(false)}
        okText="关闭"
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="订单号" labelStyle={{ width: 80 }}>
                {selectedOrder.orderNo}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={orderStatusMap[selectedOrder.status].color}>
                  {orderStatusMap[selectedOrder.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="买家">{selectedOrder.buyerName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedOrder.buyerPhone}</Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {selectedOrder.address}
              </Descriptions.Item>
              <Descriptions.Item label="下单时间">{selectedOrder.createTime}</Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                  ¥{selectedOrder.totalAmount.toFixed(2)}
                </strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" orientationMargin="0">
              商品信息
            </Divider>
            <List
              dataSource={selectedOrder.items}
              size="small"
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <Image
                      width={60}
                      height={60}
                      src={item.productImage}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.productName}</div>
                      <div style={{ color: '#999', fontSize: 12 }}>
                        单价: ¥{item.price.toFixed(2)} x {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: 16 }}>
                      ¥{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </List.Item>
              )}
            />

            {selectedOrder.logistics && selectedOrder.logistics.length > 0 && (
              <>
                <Divider orientation="left" orientationMargin="0">
                  物流信息
                </Divider>
                <Steps
                  direction="vertical"
                  size="small"
                  current={selectedOrder.logistics.length - 1}
                  items={selectedOrder.logistics.map((item) => ({
                    title: <span style={{ fontWeight: 500 }}>{item.status}</span>,
                    description: (
                      <div style={{ fontSize: 12, color: '#666' }}>
                        <div>{item.location}</div>
                        <div>{item.time}</div>
                      </div>
                    ),
                  }))}
                />
              </>
            )}

            <Divider style={{ margin: '16px 0 8px' }} />
            <div style={{ textAlign: 'right' }}>
              {selectedOrder.status === 'pending_payment' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, 'pending_shipment', '标记已付款')
                  }}
                >
                  标记已付款
                </Button>
              )}
              {selectedOrder.status === 'pending_shipment' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, 'shipping', '发货')
                  }}
                >
                  发货
                </Button>
              )}
              {selectedOrder.status === 'shipping' && (
                <Button
                  type="primary"
                  onClick={() => {
                    handleStatusUpdate(selectedOrder.id, 'completed', '完成')
                  }}
                >
                  完成订单
                </Button>
              )}
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  )
}

export default OrderManagement
