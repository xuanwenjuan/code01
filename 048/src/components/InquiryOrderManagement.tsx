import { useState, useMemo, useCallback } from 'react'
import { Table, Button, Space, message, Form, Input, Select, InputNumber, Tag, Empty, Popconfirm, DatePicker } from 'antd'
import { PlusOutlined, CheckOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import { InquiryOrder, OrderStatus } from '@/types'
import { BusinessModal } from './BusinessModal'
import { SearchForm } from './SearchForm'
import { StatusTag } from './StatusTag'
import dayjs, { Dayjs } from 'dayjs'

const { Option } = Select

const orderStatuses: { label: OrderStatus; value: OrderStatus }[] = [
  { label: '待确认', value: '待确认' },
  { label: '已下单', value: '已下单' },
  { label: '供货中', value: '供货中' },
  { label: '已交付', value: '已交付' },
]

interface SearchParams {
  keyword?: string
  status?: OrderStatus
  supplierId?: string
  startDate?: Dayjs
  endDate?: Dayjs
}

interface InquiryOrderFormData {
  supplierId: string
  materialId: string
  quantity: number
  inquiryPrice: number
  quotedPrice?: number
  status: OrderStatus
  remark?: string
}

export const InquiryOrderManagement = () => {
  const { inquiryOrders, addInquiryOrder, updateInquiryOrder, suppliers, materials } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<InquiryOrder | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }))
  const materialOptions = materials.map((m) => ({
    label: `${m.name} - ${m.specification}`,
    value: m.id,
  }))

  const filteredOrders = useMemo(() => {
    return inquiryOrders.filter((order) => {
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase()
        const matchOrderNo = order.orderNo.toLowerCase().includes(keyword)
        const matchSupplier = order.supplierName.toLowerCase().includes(keyword)
        const matchMaterial = order.materialName.toLowerCase().includes(keyword)
        if (!matchOrderNo && !matchSupplier && !matchMaterial) return false
      }
      if (searchParams.status && order.status !== searchParams.status) return false
      if (searchParams.supplierId && order.supplierId !== searchParams.supplierId) return false
      if (searchParams.startDate && dayjs(order.createTime).isBefore(searchParams.startDate)) return false
      if (searchParams.endDate && dayjs(order.createTime).isAfter(searchParams.endDate)) return false
      return true
    })
  }, [inquiryOrders, searchParams])

  const paginatedOrders = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredOrders.slice(start, end)
  }, [filteredOrders, pagination])

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['待确认', '已下单', '供货中', '已交付']
    const index = flow.indexOf(current)
    return index < flow.length - 1 ? flow[index + 1] : null
  }

  const getPrevStatus = (current: OrderStatus): OrderStatus | null => {
    const flow: OrderStatus[] = ['待确认', '已下单', '供货中', '已交付']
    const index = flow.indexOf(current)
    return index > 0 ? flow[index - 1] : null
  }

  const columns = [
    {
      title: '询价单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      fixed: 'left' as const,
      render: (no: string) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {no}
        </Tag>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 200,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 140,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
    },
    {
      title: '询价价格',
      dataIndex: 'inquiryPrice',
      key: 'inquiryPrice',
      width: 110,
      render: (price: number | null) => (price ? `¥${price.toFixed(2)}` : '-'),
    },
    {
      title: '报价价格',
      dataIndex: 'quotedPrice',
      key: 'quotedPrice',
      width: 110,
      render: (price: number | null) =>
        price ? (
          <span style={{ color: '#cf1322', fontWeight: 500 }}>¥{price.toFixed(2)}</span>
        ) : (
          <Tag color="orange">待报价</Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OrderStatus) => <StatusTag status={status} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: InquiryOrder) => {
        const next = getNextStatus(record.status)
        const prev = getPrevStatus(record.status)
        return (
          <Space size="small" wrap>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            {next && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleStatusChange(record.id, next)}
              >
                {next === '已下单' ? '确认下单' : `流转到${next}`}
              </Button>
            )}
            {prev && (
              <Popconfirm
                title={`确定要回退到"${prev}"状态吗？`}
                onConfirm={() => handleStatusChange(record.id, prev)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger icon={<SwapOutlined />}>
                  回退
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]

  const handleAdd = () => {
    setEditingOrder(null)
    setIsModalOpen(true)
  }

  const handleEdit = (order: InquiryOrder) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const handleStatusChange = useCallback((id: string, newStatus: OrderStatus) => {
    updateInquiryOrder(id, {
      status: newStatus,
      confirmTime: newStatus === '已下单' ? new Date().toISOString() : undefined,
    })
    message.success(`状态已更新为"${newStatus}"`)
  }, [updateInquiryOrder])

  const handleOk = async (values: InquiryOrderFormData) => {
    if (editingOrder) {
      updateInquiryOrder(editingOrder.id, values)
      message.success('更新成功')
    } else {
      addInquiryOrder(values)
      message.success('创建成功')
    }
    setIsModalOpen(false)
  }

  const handleSearch = (values: SearchParams) => {
    setSearchParams(values)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const handleReset = () => {
    setSearchParams({})
    setPagination({ current: 1, pageSize: 10 })
  }

  const handleTableChange = (newPagination: { current: number; pageSize: number }) => {
    setPagination(newPagination)
  }

  const initialValues = editingOrder || { status: '待确认' as OrderStatus }

  return (
    <div>
      <SearchForm<SearchParams>
        onSearch={handleSearch}
        onReset={handleReset}
        showExtraButtons={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginLeft: 8 }}>
            发起询价
          </Button>
        }
      >
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="单号/供应商/物料" style={{ width: 180 }} allowClear />
        </Form.Item>
        <Form.Item name="supplierId" label="供应商">
          <Select placeholder="请选择供应商" style={{ width: 150 }} allowClear showSearch filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }>
            {supplierOptions.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <SearchForm.Select
          name="status"
          label="状态"
          placeholder="请选择状态"
          options={orderStatuses}
        />
        <Form.Item name="startDate" label="创建日期">
          <DatePicker placeholder="开始日期" style={{ width: 140 }} />
        </Form.Item>
        <span style={{ padding: '0 8px' }}>-</span>
        <Form.Item name="endDate" noStyle>
          <DatePicker placeholder="结束日期" style={{ width: 140 }} />
        </Form.Item>
      </SearchForm>

      <Table
        columns={columns}
        dataSource={paginatedOrders}
        rowKey="id"
        scroll={{ x: 1300 }}
        loading={false}
        locale={{
          emptyText: <Empty description="暂无询价订单" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredOrders.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />

      <BusinessModal<InquiryOrderFormData>
        title={editingOrder ? '编辑询价订单' : '发起询价'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        initialValues={initialValues}
        width={680}
      >
        <Form.Item
          name="supplierId"
          label="选择供应商"
          rules={[{ required: true, message: '请选择供应商' }]}
        >
          <Select placeholder="请选择供应商" showSearch filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }>
            {supplierOptions.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="materialId"
          label="选择物料"
          rules={[{ required: true, message: '请选择物料' }]}
        >
          <Select placeholder="请选择物料" showSearch filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }>
            {materialOptions.map((m) => (
              <Option key={m.value} value={m.value}>
                {m.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="quantity"
            label="采购数量"
            rules={[
              { required: true, message: '请输入采购数量' },
              { type: 'number', min: 1, message: '数量必须大于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="请输入采购数量" />
          </Form.Item>

          <Form.Item
            name="inquiryPrice"
            label="询价价格(元)"
            rules={[
              { required: true, message: '请输入询价价格' },
              { type: 'number', min: 0, message: '价格不能小于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入询价价格"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="quotedPrice"
          label="报价价格(元)"
          rules={[{ type: 'number', min: 0, message: '价格不能小于0' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            precision={2}
            placeholder="如已报价请填写"
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="单据状态"
          rules={[{ required: true, message: '请选择状态' }]}
        >
          <Select placeholder="请选择状态">
            {orderStatuses.map((s) => (
              <Option key={s.value} value={s.value}>
                {s.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="请输入备注信息" rows={3} />
        </Form.Item>
      </BusinessModal>
    </div>
  )
}
