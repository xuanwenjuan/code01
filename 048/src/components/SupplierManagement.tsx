import { useState, useMemo, useCallback } from 'react'
import { Table, Button, Space, message, Popconfirm, Form, Input, Select, DatePicker, InputNumber, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import { Supplier, SupplierCategory, CooperationStatus } from '@/types'
import { BusinessModal } from './BusinessModal'
import { SearchForm } from './SearchForm'
import { StatusTag } from './StatusTag'
import dayjs, { Dayjs } from 'dayjs'

const { Option } = Select

const supplierCategories: { label: SupplierCategory; value: SupplierCategory }[] = [
  { label: '五金', value: '五金' },
  { label: '塑胶', value: '塑胶' },
  { label: '电子', value: '电子' },
  { label: '冲压件', value: '冲压件' },
]

const cooperationStatuses: { label: CooperationStatus; value: CooperationStatus }[] = [
  { label: '合作中', value: '合作中' },
  { label: '已暂停', value: '已暂停' },
  { label: '待审核', value: '待审核' },
  { label: '已终止', value: '已终止' },
]

interface SearchParams {
  keyword?: string
  category?: SupplierCategory
  cooperationStatus?: CooperationStatus
  isExpiringSoon?: boolean
}

interface SupplierFormData {
  name: string
  category: SupplierCategory
  qualification: string
  contactPerson: string
  contactPhone: string
  cooperationStatus: CooperationStatus
  qualificationExpireDate: Dayjs
  remark?: string
}

export const SupplierManagement = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase()
        const matchName = supplier.name.toLowerCase().includes(keyword)
        const matchContact = supplier.contactPerson.toLowerCase().includes(keyword)
        if (!matchName && !matchContact) return false
      }
      if (searchParams.category && supplier.category !== searchParams.category) return false
      if (searchParams.cooperationStatus && supplier.cooperationStatus !== searchParams.cooperationStatus) return false
      if (searchParams.isExpiringSoon && !supplier.isExpiringSoon) return false
      return true
    })
  }, [suppliers, searchParams])

  const paginatedSuppliers = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredSuppliers.slice(start, end)
  }, [filteredSuppliers, pagination])

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      fixed: 'left' as const,
      render: (text: string, record: Supplier) => (
        <Space>
          {record.isExpiringSoon && <WarningOutlined style={{ color: '#faad14' }} title="资质即将到期" />}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: Supplier['category']) => <StatusTag status={category} />,
    },
    {
      title: '企业资质',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 140,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
    },
    {
      title: '合作状态',
      dataIndex: 'cooperationStatus',
      key: 'cooperationStatus',
      width: 100,
      render: (status: Supplier['cooperationStatus']) => <StatusTag status={status} />,
    },
    {
      title: '资质有效期',
      dataIndex: 'qualificationExpireDate',
      key: 'qualificationExpireDate',
      width: 130,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: Supplier) => (
        <Space size="small" wrap>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个供应商吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okType="danger"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingSupplier(null)
    setIsModalOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsModalOpen(true)
  }

  const handleDelete = useCallback((id: string) => {
    deleteSupplier(id)
    message.success('删除成功')
  }, [deleteSupplier])

  const handleOk = async (values: SupplierFormData) => {
    const supplierData = {
      ...values,
      qualificationExpireDate: values.qualificationExpireDate.format('YYYY-MM-DD'),
      isExpiringSoon: dayjs(values.qualificationExpireDate).diff(dayjs(), 'month') <= 3,
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData)
      message.success('更新成功')
    } else {
      addSupplier(supplierData)
      message.success('添加成功')
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

  const initialValues = editingSupplier
    ? { ...editingSupplier, qualificationExpireDate: dayjs(editingSupplier.qualificationExpireDate) }
    : undefined

  return (
    <div>
      <SearchForm<SearchParams>
        onSearch={handleSearch}
        onReset={handleReset}
        showExtraButtons={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginLeft: 8 }}>
            新增供应商
          </Button>
        }
      >
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="名称/联系人" style={{ width: 160 }} allowClear />
        </Form.Item>
        <SearchForm.Select
          name="category"
          label="类别"
          placeholder="请选择类别"
          options={supplierCategories}
        />
        <SearchForm.Select
          name="cooperationStatus"
          label="合作状态"
          placeholder="请选择状态"
          options={cooperationStatuses}
        />
        <Form.Item name="isExpiringSoon" label="状态筛选">
          <Select placeholder="选择状态" style={{ width: 140 }} allowClear>
            <Option value={true}>
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                资质即将到期
              </Space>
            </Option>
          </Select>
        </Form.Item>
      </SearchForm>

      <Table
        columns={columns}
        dataSource={paginatedSuppliers}
        rowKey="id"
        scroll={{ x: 1200 }}
        loading={false}
        locale={{
          emptyText: <Empty description="暂无供应商数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredSuppliers.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />

      <BusinessModal<SupplierFormData>
        title={editingSupplier ? '编辑供应商' : '新增供应商'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        initialValues={initialValues}
        width={680}
      >
        <Form.Item
          name="name"
          label="供应商名称"
          rules={[{ required: true, message: '请输入供应商名称' }]}
        >
          <Input placeholder="请输入供应商名称" />
        </Form.Item>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="category"
            label="供应商类别"
            rules={[{ required: true, message: '请选择类别' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select placeholder="请选择类别">
              {supplierCategories.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="qualification"
            label="企业资质"
            rules={[{ required: true, message: '请输入企业资质' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入企业资质，如ISO9001等" />
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入联系人" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="cooperationStatus"
            label="合作状态"
            rules={[{ required: true, message: '请选择合作状态' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select placeholder="请选择合作状态">
              {cooperationStatuses.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="qualificationExpireDate"
            label="资质有效期"
            rules={[{ required: true, message: '请选择资质有效期' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Space>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="请输入备注信息" rows={3} />
        </Form.Item>
      </BusinessModal>
    </div>
  )
}
