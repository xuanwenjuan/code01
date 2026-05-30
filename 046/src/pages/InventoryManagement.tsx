import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Progress,
  Alert,
  Badge,
  Empty,
  Spin
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { InventoryRecord, InventoryCategory, InventoryCategoryMap } from '@/types'
import { useInventoryStore } from '@/stores'
import { mockApi } from '@/mock'
import CommonModal from '@/components/CommonModal'
import SearchForm, { SearchInput, SearchSelect } from '@/components/SearchForm'
import { useDebounce } from '@/hooks/useDebounce'

const { Option } = Select

const categoryOptions = Object.entries(InventoryCategoryMap).map(([value, label]) => ({
  label,
  value
}))

const unitOptions = [
  { label: '毫升 (ml)', value: 'ml' },
  { label: '克 (g)', value: 'g' },
  { label: '个', value: '个' },
  { label: '包', value: '包' },
  { label: '盒', value: '盒' },
  { label: '杯', value: '杯' }
]

interface FilterValues {
  name?: string
  category?: string
  lowStock?: boolean
  expiring?: boolean
}

export default function InventoryManagement() {
  const { records, setRecords, addRecord, updateRecord, deleteRecord, updateQuantity } = useInventoryStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null)
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const debouncedFilters = useDebounce(filters, 300)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await mockApi.getInventory()
        if (records.length === 0) setRecords(data)
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

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchSearch = !debouncedFilters.name || record.name.includes(debouncedFilters.name)
      const matchCategory = !debouncedFilters.category || record.category === debouncedFilters.category
      const matchLowStock = !debouncedFilters.lowStock || record.isLowStock
      const matchExpiring = !debouncedFilters.expiring || record.isExpiring
      return matchSearch && matchCategory && matchLowStock && matchExpiring
    })
  }, [records, debouncedFilters])

  const lowStockCount = useMemo(() => {
    return records.filter((r) => r.isLowStock).length
  }, [records])

  const expiringCount = useMemo(() => {
    return records.filter((r) => r.isExpiring).length
  }, [records])

  const totalValue = useMemo(() => {
    return records.reduce((sum, r) => sum + r.quantity, 0)
  }, [records])

  const handleQuantityChange = useCallback((id: string, quantity: number) => {
    updateQuantity(id, quantity)
    message.success('库存已更新')
  }, [updateQuantity])

  const handleLowStockFilter = () => {
    const newVal = !filters.lowStock
    setFilters((prev) => ({ ...prev, lowStock: newVal }))
    searchForm.setFieldsValue({ lowStock: newVal })
  }

  const handleExpiringFilter = () => {
    const newVal = !filters.expiring
    setFilters((prev) => ({ ...prev, expiring: newVal }))
    searchForm.setFieldsValue({ expiring: newVal })
  }

  const getRowClassName = (record: InventoryRecord) => {
    if (record.isExpiring) return 'table-row-danger'
    if (record.isLowStock) return 'table-row-warning'
    return ''
  }

  const columns = [
    {
      title: '原料名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: InventoryRecord) => (
        <Space>
          {text}
          {record.isLowStock && <WarningOutlined style={{ color: '#faad14' }} title="库存不足" />}
          {record.isExpiring && <ClockCircleOutlined style={{ color: '#ff4d4f' }} title="即将过期" />}
        </Space>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
      render: (text: string) => <Tag color="geekblue">{text}</Tag>
    },
    {
      title: '库存数量',
      key: 'quantity',
      width: 200,
      render: (_: unknown, record: InventoryRecord) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: record.isLowStock ? '#ff4d4f' : '#52c41a' }}>
              {record.quantity} {record.unit}
            </span>
            <span style={{ fontSize: 12, color: '#999' }}>预警: {record.warningThreshold}</span>
          </div>
          <Progress
            percent={Math.min(100, (record.quantity / record.warningThreshold) * 50)}
            size="small"
            status={record.isLowStock ? 'exception' : 'active'}
            strokeColor={record.isLowStock ? '#ff4d4f' : '#52c41a'}
            showInfo={false}
          />
        </div>
      )
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string, record: InventoryRecord) => (
        <span style={{ color: record.isExpiring ? '#ff4d4f' : undefined, fontWeight: record.isExpiring ? 600 : undefined }}>
          {date}
        </span>
      )
    },
    {
      title: '状态',
      key: 'status',
      width: 120,
      render: (_: unknown, record: InventoryRecord) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          {record.isLowStock && (
            <Tag color="orange" style={{ margin: 0, width: 'fit-content' }}>
              库存不足
            </Tag>
          )}
          {record.isExpiring && (
            <Tag color="red" style={{ margin: 0, width: 'fit-content' }}>
              即将过期
            </Tag>
          )}
          {!record.isLowStock && !record.isExpiring && <Tag color="green">正常</Tag>}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: InventoryRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <InputNumber
            size="small"
            min={0}
            value={record.quantity}
            onChange={(value) => {
              if (value !== null) {
                handleQuantityChange(record.id, value)
              }
            }}
            style={{ width: 80 }}
          />
          <Popconfirm
            title="确定删除此原料？"
            onConfirm={() => {
              deleteRecord(record.id)
              message.success('删除成功')
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: InventoryRecord) => {
    setEditingRecord(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      const values = await form.validateFields()
      const now = new Date().toISOString()

      if (editingRecord) {
        updateRecord({
          ...editingRecord,
          ...values,
          categoryName: InventoryCategoryMap[values.category],
          isLowStock: values.quantity <= values.warningThreshold,
          updateTime: now
        })
        message.success('更新成功')
      } else {
        addRecord({
          id: Date.now().toString(),
          ...values,
          categoryName: InventoryCategoryMap[values.category],
          isExpiring: false,
          isLowStock: values.quantity <= values.warningThreshold,
          createTime: now,
          updateTime: now
        })
        message.success('添加成功')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div>
      {(lowStockCount > 0 || expiringCount > 0) && (
        <Alert
          message="库存预警"
          description={
            <Space>
              {lowStockCount > 0 && (
                <span style={{ color: '#faad14' }}>有 {lowStockCount} 种原料库存不足</span>
              )}
              {expiringCount > 0 && (
                <span style={{ color: '#ff4d4f' }}>有 {expiringCount} 种原料即将过期</span>
              )}
            </Space>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="原料种类"
              value={records.length}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="库存不足"
              value={lowStockCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="即将过期"
              value={expiringCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Tag
            icon={<FilterOutlined />}
            color={filters.lowStock ? 'orange' : 'default'}
            onClick={handleLowStockFilter}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            库存不足 ({lowStockCount})
          </Tag>
          <Tag
            icon={<FilterOutlined />}
            color={filters.expiring ? 'red' : 'default'}
            onClick={handleExpiringFilter}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            即将过期 ({expiringCount})
          </Tag>
        </Space>

        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <SearchInput name="name" placeholder="搜索原料名称" />
          <SearchSelect name="category" placeholder="选择分类" options={categoryOptions} />
          <Button type={filters.lowStock ? 'primary' : 'default'} onClick={handleLowStockFilter}>
            只看库存不足
          </Button>
          <Button type={filters.expiring ? 'primary' : 'default'} danger onClick={handleExpiringFilter}>
            只看即将过期
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加原料
          </Button>
        </SearchForm>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          rowClassName={getRowClassName}
          loading={
            loading ? {
              indicator: <Spin size="large" />,
              tip: '数据加载中...'
            } : false
          }
          locale={{
            emptyText: <Empty description="暂无原料数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }}
        />
      </Card>

      <CommonModal
        visible={isModalOpen}
        title={editingRecord ? '编辑原料' : '添加原料'}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        formProps={{ form }}
      >
        <Form.Item name="name" label="原料名称" rules={[{ required: true, message: '请输入原料名称' }]}>
          <Input placeholder="请输入原料名称" />
        </Form.Item>
        <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select placeholder="请选择分类">
            {categoryOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="quantity" label="库存数量" rules={[{ required: true, message: '请输入库存数量' }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存数量" />
        </Form.Item>
        <Form.Item name="unit" label="单位" rules={[{ required: true, message: '请选择单位' }]}>
          <Select placeholder="请选择单位">
            {unitOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="warningThreshold" label="预警阈值" rules={[{ required: true, message: '请输入预警阈值' }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="低于此数量时预警" />
        </Form.Item>
        <Form.Item name="expiryDate" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
          <Input type="date" />
        </Form.Item>
      </CommonModal>
    </div>
  )
}
