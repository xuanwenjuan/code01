import { useState, useMemo, useCallback } from 'react'
import { Table, Button, Space, message, Form, Input, Select, InputNumber, DatePicker, Tag, Empty, Popconfirm } from 'antd'
import { PlusOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import { DeliveryRecord, QualityResult, SettlementStatus } from '@/types'
import { BusinessModal } from './BusinessModal'
import { SearchForm } from './SearchForm'
import { StatusTag } from './StatusTag'
import dayjs, { Dayjs } from 'dayjs'

const { Option } = Select

const qualityResults: { label: QualityResult; value: QualityResult }[] = [
  { label: '合格', value: '合格' },
  { label: '不合格', value: '不合格' },
  { label: '待检验', value: '待检验' },
]

const settlementStatuses: { label: SettlementStatus; value: SettlementStatus }[] = [
  { label: '待对账', value: '待对账' },
  { label: '对账中', value: '对账中' },
  { label: '已结算', value: '已结算' },
  { label: '已逾期', value: '已逾期' },
]

interface SearchParams {
  keyword?: string
  supplierId?: string
  settlementStatus?: SettlementStatus
  qualityResult?: QualityResult
  startDate?: Dayjs
  endDate?: Dayjs
}

interface DeliveryFormData {
  supplierId: string
  materialId: string
  quantity: number
  deliveryDate: Dayjs
  qualityResult: QualityResult
  settlementAmount: number
  settlementStatus: SettlementStatus
  remark?: string
}

export const DeliveryManagement = () => {
  const { deliveryRecords, addDeliveryRecord, updateDeliveryRecord, suppliers, materials } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const supplierOptions = suppliers.map((s) => ({ label: s.name, value: s.id }))
  const materialOptions = materials.map((m) => ({
    label: `${m.name} - ${m.specification}`,
    value: m.id,
  }))

  const filteredRecords = useMemo(() => {
    return deliveryRecords.filter((record) => {
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase()
        const matchOrderNo = record.deliveryNo.toLowerCase().includes(keyword)
        const matchSupplier = record.supplierName.toLowerCase().includes(keyword)
        const matchMaterial = record.materialName.toLowerCase().includes(keyword)
        if (!matchOrderNo && !matchSupplier && !matchMaterial) return false
      }
      if (searchParams.supplierId && record.supplierId !== searchParams.supplierId) return false
      if (searchParams.settlementStatus && record.settlementStatus !== searchParams.settlementStatus) return false
      if (searchParams.qualityResult && record.qualityResult !== searchParams.qualityResult) return false
      if (searchParams.startDate && dayjs(record.deliveryDate).isBefore(searchParams.startDate)) return false
      if (searchParams.endDate && dayjs(record.deliveryDate).isAfter(searchParams.endDate)) return false
      return true
    })
  }, [deliveryRecords, searchParams])

  const paginatedRecords = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredRecords.slice(start, end)
  }, [filteredRecords, pagination])

  const columns = [
    {
      title: '送货单号',
      dataIndex: 'deliveryNo',
      key: 'deliveryNo',
      width: 160,
      fixed: 'left' as const,
      render: (no: string) => (
        <Tag color="cyan" style={{ fontFamily: 'monospace' }}>
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
      title: '送货日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '质检结果',
      dataIndex: 'qualityResult',
      key: 'qualityResult',
      width: 100,
      render: (result: QualityResult) => <StatusTag status={result} />,
    },
    {
      title: '对账金额',
      dataIndex: 'settlementAmount',
      key: 'settlementAmount',
      width: 120,
      render: (amount: number) => (
        <span style={{ color: '#cf1322', fontWeight: 500 }}>¥{amount.toFixed(2)}</span>
      ),
    },
    {
      title: '结算状态',
      dataIndex: 'settlementStatus',
      key: 'settlementStatus',
      width: 100,
      render: (status: SettlementStatus) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: DeliveryRecord) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.settlementStatus !== '已结算' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSettle(record.id)}
            >
              标记已结算
            </Button>
          )}
          {record.settlementStatus === '已结算' && (
            <Popconfirm
              title="确定要撤销结算吗？"
              onConfirm={() => handleUnSettle(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<SwapOutlined />}>
                撤销结算
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record: DeliveryRecord) => {
    setEditingRecord(record)
    setIsModalOpen(true)
  }

  const handleSettle = useCallback((id: string) => {
    updateDeliveryRecord(id, { settlementStatus: '已结算' })
    message.success('已标记为已结算')
  }, [updateDeliveryRecord])

  const handleUnSettle = useCallback((id: string) => {
    updateDeliveryRecord(id, { settlementStatus: '对账中' })
    message.success('已撤销结算')
  }, [updateDeliveryRecord])

  const handleOk = async (values: DeliveryFormData) => {
    if (editingRecord) {
      updateDeliveryRecord(editingRecord.id, {
        ...values,
        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
      })
      message.success('更新成功')
    } else {
      addDeliveryRecord({
        ...values,
        deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
      })
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

  const initialValues = editingRecord
    ? { ...editingRecord, deliveryDate: dayjs(editingRecord.deliveryDate) }
    : { qualityResult: '待检验' as QualityResult, settlementStatus: '待对账' as SettlementStatus }

  return (
    <div>
      <SearchForm<SearchParams>
        onSearch={handleSearch}
        onReset={handleReset}
        showExtraButtons={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginLeft: 8 }}>
            新增送货
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
          name="settlementStatus"
          label="结算状态"
          placeholder="请选择状态"
          options={settlementStatuses}
        />
        <SearchForm.Select
          name="qualityResult"
          label="质检结果"
          placeholder="请选择结果"
          options={qualityResults}
        />
        <Form.Item name="startDate" label="送货日期">
          <DatePicker placeholder="开始日期" style={{ width: 140 }} />
        </Form.Item>
        <span style={{ padding: '0 8px' }}>-</span>
        <Form.Item name="endDate" noStyle>
          <DatePicker placeholder="结束日期" style={{ width: 140 }} />
        </Form.Item>
      </SearchForm>

      <Table
        columns={columns}
        dataSource={paginatedRecords}
        rowKey="id"
        scroll={{ x: 1350 }}
        loading={false}
        locale={{
          emptyText: <Empty description="暂无送货记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredRecords.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />

      <BusinessModal<DeliveryFormData>
        title={editingRecord ? '编辑送货记录' : '新增送货记录'}
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
            label="送货数量"
            rules={[
              { required: true, message: '请输入送货数量' },
              { type: 'number', min: 1, message: '数量必须大于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="请输入送货数量" />
          </Form.Item>

          <Form.Item
            name="deliveryDate"
            label="送货日期"
            rules={[{ required: true, message: '请选择送货日期' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="qualityResult"
            label="质检结果"
            rules={[{ required: true, message: '请选择质检结果' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select placeholder="请选择质检结果">
              {qualityResults.map((r) => (
                <Option key={r.value} value={r.value}>
                  {r.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="settlementAmount"
            label="对账金额(元)"
            rules={[
              { required: true, message: '请输入对账金额' },
              { type: 'number', min: 0, message: '金额不能小于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入对账金额"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="settlementStatus"
          label="结算状态"
          rules={[{ required: true, message: '请选择结算状态' }]}
        >
          <Select placeholder="请选择结算状态">
            {settlementStatuses.map((s) => (
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
