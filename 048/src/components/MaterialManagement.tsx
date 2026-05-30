import { useState, useMemo } from 'react'
import { Table, Button, Space, message, Popconfirm, Form, Input, Select, InputNumber, Tag, Spin, Empty } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import { Material } from '@/types'
import { BusinessModal } from './BusinessModal'
import { SearchForm } from './SearchForm'

const { Option } = Select

const materialCategories = [
  { label: '传动件', value: '传动件' },
  { label: '紧固件', value: '紧固件' },
  { label: '密封件', value: '密封件' },
  { label: '轴承', value: '轴承' },
  { label: '齿轮', value: '齿轮' },
  { label: '弹簧', value: '弹簧' },
]

const units = [
  { label: '个', value: '个' },
  { label: '件', value: '件' },
  { label: '套', value: '套' },
  { label: '箱', value: '箱' },
  { label: 'KG', value: 'KG' },
]

interface SearchParams {
  keyword?: string
  category?: string
  unit?: string
  priceMin?: number
  priceMax?: number
}

interface MaterialFormData {
  code: string
  name: string
  specification: string
  material: string
  purchasePrice: number
  safetyStock: number
  category: string
  unit: string
  remark?: string
}

export const MaterialManagement = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams>({})
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase()
        const matchCode = material.code.toLowerCase().includes(keyword)
        const matchName = material.name.toLowerCase().includes(keyword)
        const matchSpec = material.specification.toLowerCase().includes(keyword)
        if (!matchCode && !matchName && !matchSpec) return false
      }
      if (searchParams.category && material.category !== searchParams.category) return false
      if (searchParams.unit && material.unit !== searchParams.unit) return false
      if (searchParams.priceMin !== undefined && material.purchasePrice < searchParams.priceMin) return false
      if (searchParams.priceMax !== undefined && material.purchasePrice > searchParams.priceMax) return false
      return true
    })
  }, [materials, searchParams])

  const paginatedMaterials = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredMaterials.slice(start, end)
  }, [filteredMaterials, pagination])

  const columns = [
    {
      title: '物料编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left' as const,
      render: (code: string) => (
        <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 4, fontFamily: 'monospace' }}>
          {code}
        </code>
      ),
    },
    {
      title: '物料名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 140,
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '采购单价',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: 110,
      sorter: (a: Material, b: Material) => a.purchasePrice - b.purchasePrice,
      render: (price: number) => (
        <span style={{ color: '#cf1322', fontWeight: 500 }}>¥{price.toFixed(2)}</span>
      ),
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      render: (stock: number, record: Material) => (
        <Space>
          <span>{stock}</span>
          {stock < 30 && <Tag color="red">库存偏低</Tag>}
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: unknown, record: Material) => (
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
            title="确定要删除这个物料吗？"
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
    setEditingMaterial(null)
    setIsModalOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMaterial(id)
    message.success('删除成功')
  }

  const handleOk = async (values: MaterialFormData) => {
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, values)
      message.success('更新成功')
    } else {
      addMaterial(values)
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

  return (
    <div>
      <SearchForm<SearchParams>
        onSearch={handleSearch}
        onReset={handleReset}
        showExtraButtons={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginLeft: 8 }}>
            新增物料
          </Button>
        }
      >
        <Form.Item name="keyword" label="关键词">
          <Input placeholder="编码/名称/规格" style={{ width: 160 }} allowClear />
        </Form.Item>
        <SearchForm.Select
          name="category"
          label="分类"
          placeholder="请选择分类"
          options={materialCategories}
        />
        <SearchForm.Select
          name="unit"
          label="单位"
          placeholder="请选择单位"
          options={units}
        />
        <Form.Item name="priceMin" label="价格区间">
          <InputNumber
            style={{ width: 100 }}
            min={0}
            precision={2}
            placeholder="最低价"
          />
        </Form.Item>
        <span style={{ padding: '0 8px' }}>-</span>
        <Form.Item name="priceMax" noStyle>
          <InputNumber
            style={{ width: 100 }}
            min={0}
            precision={2}
            placeholder="最高价"
          />
        </Form.Item>
      </SearchForm>

      <Table
        columns={columns}
        dataSource={paginatedMaterials}
        rowKey="id"
        scroll={{ x: 1100 }}
        loading={false}
        locale={{
          emptyText: <Empty description="暂无物料数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: filteredMaterials.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />

      <BusinessModal<MaterialFormData>
        title={editingMaterial ? '编辑物料' : '新增物料'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleOk}
        initialValues={editingMaterial || undefined}
        width={680}
      >
        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="code"
            label="物料编码"
            rules={[{ required: true, message: '请输入物料编码' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入物料编码" />
          </Form.Item>

          <Form.Item
            name="name"
            label="物料名称"
            rules={[{ required: true, message: '请输入物料名称' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入物料名称" />
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="specification"
            label="规格型号"
            rules={[{ required: true, message: '请输入规格型号' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入规格型号" />
          </Form.Item>

          <Form.Item
            name="material"
            label="材质参数"
            rules={[{ required: true, message: '请输入材质参数' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Input placeholder="请输入材质参数" />
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="unit"
            label="单位"
            rules={[{ required: true, message: '请选择单位' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select placeholder="请选择单位">
              {units.map((u) => (
                <Option key={u.value} value={u.value}>
                  {u.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="category"
            label="物料分类"
            rules={[{ required: true, message: '请选择物料分类' }]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <Select placeholder="请选择物料分类">
              {materialCategories.map((cat) => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Space>

        <Space wrap style={{ width: '100%' }}>
          <Form.Item
            name="purchasePrice"
            label="采购单价(元)"
            rules={[
              { required: true, message: '请输入采购单价' },
              { type: 'number', min: 0, message: '单价不能小于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入采购单价"
            />
          </Form.Item>

          <Form.Item
            name="safetyStock"
            label="安全库存阈值"
            rules={[
              { required: true, message: '请输入安全库存阈值' },
              { type: 'number', min: 0, message: '库存不能小于0' },
            ]}
            style={{ flex: 1, minWidth: 200 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="请输入安全库存阈值"
            />
          </Form.Item>
        </Space>

        <Form.Item name="remark" label="备注">
          <Input.TextArea placeholder="请输入备注信息" rows={3} />
        </Form.Item>
      </BusinessModal>
    </div>
  )
}
