import React, { useState, useEffect } from 'react'
import {
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Card,
  Row,
  Col,
  Modal,
  Form,
  message,
  DatePicker,
  Popconfirm,
  Descriptions
} from 'antd'
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ExportOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrders, fetchOrderDetail, updateOrderStatus, handleException } from '../../store/slices/orderSlice.js'
import { orderStatusMap } from '../../mock/index.js'
import StatusPage from '../../components/StatusPage/index.jsx'
import OrderDetailModal from '../../components/OrderDetailModal/index.jsx'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { TextArea } = Input

const OrderManagement = () => {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector(state => state.orders)
  const { userInfo } = useSelector(state => state.auth)
  
  const [detailModal, setDetailModal] = useState({ open: false, order: null })
  const [statusModal, setStatusModal] = useState({ open: false, order: null })
  const [exceptionModal, setExceptionModal] = useState({ open: false, order: null })
  const [statusForm] = Form.useForm()
  const [exceptionForm] = Form.useForm()
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    pageSize: 10,
  })

  useEffect(() => {
    loadOrders()
  }, [filters])

  const loadOrders = () => {
    const params = { ...filters }
    if (userInfo?.role === 'dispatcher') {
      params.dispatcherId = userInfo.id
    }
    dispatch(fetchOrders(params))
  }

  const handleViewDetail = async (orderId) => {
    try {
      const result = await dispatch(fetchOrderDetail(orderId)).unwrap()
      setDetailModal({ open: true, order: result })
    } catch (err) {
      message.error('获取订单详情失败')
    }
  }

  const handleOpenStatusModal = (order) => {
    setStatusModal({ open: true, order })
    statusForm.resetFields()
  }

  const handleOpenExceptionModal = (order) => {
    setExceptionModal({ open: true, order })
    exceptionForm.resetFields()
  }

  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields()
      await dispatch(updateOrderStatus({
        orderId: statusModal.order.id,
        status: values.status,
        operator: userInfo.name,
        action: orderStatusMap[values.status]?.label || '状态更新',
        remark: values.remark,
      })).unwrap()
      
      message.success('状态更新成功')
      setStatusModal({ open: false, order: null })
      statusForm.resetFields()
      loadOrders()
    } catch (err) {
      message.error(err || '更新失败')
    }
  }

  const handleException = async () => {
    try {
      const values = await exceptionForm.validateFields()
      await dispatch(handleException({
        orderId: exceptionModal.order.id,
        handleResult: values.handleResult,
        newStatus: values.newStatus,
        operator: userInfo.name,
      })).unwrap()
      
      message.success('异常处理成功')
      setExceptionModal({ open: false, order: null })
      exceptionForm.resetFields()
      loadOrders()
    } catch (err) {
      message.error(err || '处理失败')
    }
  }

  const handleExport = () => {
    const data = orders.list || []
    const header = '订单编号,客户名称,货物类型,起始地,目的地,状态,创建时间,调度员\n'
    const csvContent = header + data.map(row => 
      `${row.orderNo},${row.customerName},${row.goodsType},${row.originCity},${row.destCity},${orderStatusMap[row.status]?.label},${dayjs(row.createTime).format('YYYY-MM-DD HH:mm')},${row.dispatcherName || '-'}`
    ).join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `订单导出_${dayjs().format('YYYYMMDDHHmmss')}.csv`
    link.click()
    message.success('导出成功')
  }

  const handleCancelOrder = (order) => {
    dispatch(updateOrderStatus({
      orderId: order.id,
      status: 'cancelled',
      operator: userInfo.name,
      action: '取消订单',
      remark: '手动取消订单',
    })).then(() => {
      message.success('订单已取消')
      loadOrders()
    })
  }

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      fixed: 'left',
      render: (text) => <a onClick={() => handleViewDetail(text)}>{text}</a>,
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '货物信息',
      key: 'goods',
      width: 140,
      render: (_, record) => (
        <div>
          <div>{record.goodsType}</div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {record.weight}吨 / {record.volume}m³
          </div>
        </div>
      ),
    },
    {
      title: '起始地',
      dataIndex: 'originCity',
      key: 'originCity',
      width: 100,
    },
    {
      title: '目的地',
      dataIndex: 'destCity',
      key: 'destCity',
      width: 100,
    },
    {
      title: '调度员',
      dataIndex: 'dispatcherName',
      key: 'dispatcherName',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const info = orderStatusMap[status]
        return <Tag color={info?.color}>{info?.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          {record.status !== 'completed' && record.status !== 'cancelled' && (
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleOpenStatusModal(record)}
            >
              更新状态
            </Button>
          )}
          {record.status === 'exception' && (
            <Button
              type="link"
              icon={<WarningOutlined />}
              size="small"
              danger
              onClick={() => handleOpenExceptionModal(record)}
            >
              处理异常
            </Button>
          )}
          {record.status === 'pending' && (
            <Popconfirm
              title="确定取消该订单吗？"
              onConfirm={() => handleCancelOrder(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small" icon={<CloseCircleOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const statusOptions = [
    { value: 'transporting', label: '运输中', disabled: true },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ]

  if (error) {
    return <StatusPage type="error" message="加载失败" description={error} />
  }

  return (
    <div>
      <Card
        title="订单管理"
        bordered={false}
        extra={
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
            disabled={!orders.list || orders.list.length === 0}
          >
            导出订单
          </Button>
        }
      >
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <Select
            placeholder="订单状态"
            style={{ width: 120 }}
            allowClear
            value={filters.status || undefined}
            onChange={(v) => setFilters({ ...filters, status: v, page: 1 })}
          >
            {Object.entries(orderStatusMap).map(([key, value]) => (
              <Option key={key} value={key}>{value.label}</Option>
            ))}
          </Select>
          <Input
            placeholder="订单号"
            prefix={<SearchOutlined />}
            style={{ width: 160 }}
            allowClear
            value={filters.orderNo || ''}
            onChange={(e) => setFilters({ ...filters, orderNo: e.target.value })}
            onPressEnter={() => setFilters({ ...filters, page: 1 })}
          />
          <Input
            placeholder="客户名称"
            style={{ width: 160 }}
            allowClear
            value={filters.customerName || ''}
            onChange={(e) => setFilters({ ...filters, customerName: e.target.value })}
            onPressEnter={() => setFilters({ ...filters, page: 1 })}
          />
          <Select
            placeholder="起始城市"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => setFilters({ ...filters, originCity: v, page: 1 })}
          >
            {['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'].map(city => (
              <Option key={city} value={city}>{city}</Option>
            ))}
          </Select>
          <Select
            placeholder="目的城市"
            style={{ width: 120 }}
            allowClear
            onChange={(v) => setFilters({ ...filters, destCity: v, page: 1 })}
          >
            {['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'].map(city => (
              <Option key={city} value={city}>{city}</Option>
            ))}
          </Select>
          <RangePicker
            style={{ width: 260 }}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates, page: 1 })}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilters({
                status: '',
                page: 1,
                pageSize: 10,
                orderNo: '',
                customerName: '',
                originCity: '',
                destCity: '',
                dateRange: null,
              })
            }}
          >
            重置
          </Button>
        </div>

        <Table
          dataSource={orders.list || []}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: orders.total || 0,
            onChange: (page, pageSize) => setFilters({ ...filters, page, pageSize }),
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="更新订单状态"
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, order: null })}
        footer={
          <Space>
            <Button onClick={() => setStatusModal({ open: false, order: null })}>取消</Button>
            <Button type="primary" onClick={handleUpdateStatus} loading={loading}>
              确认
            </Button>
          </Space>
        }
      >
        {statusModal.order && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <span>订单号：</span>
              <strong>{statusModal.order.orderNo}</strong>
            </div>
            <Form form={statusForm} layout="vertical">
              <Form.Item
                name="status"
                label="新状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择新状态">
                  {statusOptions
                    .filter(opt => !opt.disabled || opt.value !== 'transporting')
                    .map(opt => (
                      <Option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
              <Form.Item name="remark" label="备注">
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <Modal
        title="异常订单处理"
        open={exceptionModal.open}
        onCancel={() => setExceptionModal({ open: false, order: null })}
        width={600}
        footer={
          <Space>
            <Button onClick={() => setExceptionModal({ open: false, order: null })}>取消</Button>
            <Button type="primary" onClick={handleException} loading={loading}>
              提交处理
            </Button>
          </Space>
        }
      >
        {exceptionModal.order && (
          <div>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="订单号">{exceptionModal.order.orderNo}</Descriptions.Item>
              <Descriptions.Item label="异常原因">{exceptionModal.order.exceptionReason}</Descriptions.Item>
            </Descriptions>
            <Form form={exceptionForm} layout="vertical">
              <Form.Item
                name="newStatus"
                label="处理后状态"
                rules={[{ required: true, message: '请选择处理后状态' }]}
              >
                <Select placeholder="请选择">
                  <Option value="transporting">继续运输</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="cancelled">取消订单</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="handleResult"
                label="处理结果"
                rules={[
                  { required: true, message: '请输入处理结果' },
                  { min: 5, message: '处理结果至少5个字符' }
                ]}
              >
                <TextArea rows={4} placeholder="请详细描述处理结果" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      <OrderDetailModal
        open={detailModal.open}
        order={detailModal.order}
        loading={loading}
        onClose={() => setDetailModal({ open: false, order: null })}
        onUpdateStatus={(data) => dispatch(updateOrderStatus(data)).then(() => loadOrders())}
        userInfo={userInfo}
      />
    </div>
  )
}

export default OrderManagement
