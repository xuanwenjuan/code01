import { useEffect, useState, useMemo } from 'react'
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
  Switch,
  message,
  Popconfirm,
  Badge,
  Empty,
  Spin
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Drink, DrinkCategory } from '@/types'
import { useMenuStore } from '@/stores'
import { mockApi } from '@/mock'
import CommonModal from '@/components/CommonModal'
import SearchForm, { SearchInput, SearchSelect } from '@/components/SearchForm'
import { useDebounce } from '@/hooks/useDebounce'

const { Option } = Select

interface FilterValues {
  name?: string
  categoryId?: string
  isOnSale?: boolean
}

export default function MenuManagement() {
  const { categories, drinks, setCategories, setDrinks, addDrink, updateDrink, deleteDrink, toggleDrinkSale } = useMenuStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null)
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
        const [catData, drinkData] = await Promise.all([mockApi.getCategories(), mockApi.getDrinks()])
        if (categories.length === 0) setCategories(catData)
        if (drinks.length === 0) setDrinks(drinkData)
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

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      const matchSearch = !debouncedFilters.name || drink.name.includes(debouncedFilters.name)
      const matchCategory = !debouncedFilters.categoryId || drink.categoryId === debouncedFilters.categoryId
      const matchStatus = debouncedFilters.isOnSale === undefined || drink.isOnSale === debouncedFilters.isOnSale
      return matchSearch && matchCategory && matchStatus
    })
  }, [drinks, debouncedFilters])

  const onSaleCount = useMemo(() => {
    return drinks.filter((d) => d.isOnSale).length
  }, [drinks])

  const handleToggleSale = (id: string, currentStatus: boolean) => {
    toggleDrinkSale(id)
    message.success(currentStatus ? '已下架' : '已上架')
  }

  const handleOnSaleFilter = () => {
    const newVal = !filters.isOnSale
    setFilters((prev) => ({ ...prev, isOnSale: newVal }))
    searchForm.setFieldsValue({ isOnSale: newVal })
  }

  const columns = [
    {
      title: '饮品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
      render: (text: string) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{price}</span>
    },
    {
      title: '原价',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 100,
      render: (price: number) => <span style={{ textDecoration: 'line-through', color: '#999' }}>¥{price}</span>
    },
    {
      title: '状态',
      dataIndex: 'isOnSale',
      key: 'isOnSale',
      width: 100,
      render: (isOnSale: boolean) => (
        <Badge
          status={isOnSale ? 'success' : 'error'}
          text={<Tag color={isOnSale ? 'green' : 'red'}>{isOnSale ? '在售' : '下架'}</Tag>}
        />
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: unknown, record: Drink) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleSale(record.id, record.isOnSale)}
          >
            {record.isOnSale ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确定删除此饮品？"
            onConfirm={() => {
              deleteDrink(record.id)
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
    setEditingDrink(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Drink) => {
    setEditingDrink(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      const values = await form.validateFields()
      const now = new Date().toISOString()

      if (editingDrink) {
        updateDrink({
          ...editingDrink,
          ...values,
          categoryName: categories.find((c) => c.id === values.categoryId)?.name || '',
          updateTime: now
        })
        message.success('更新成功')
      } else {
        addDrink({
          id: Date.now().toString(),
          ...values,
          categoryName: categories.find((c) => c.id === values.categoryId)?.name || '',
          specs: [
            { name: '规格', options: ['中杯', '大杯', '超大杯'] },
            { name: '甜度', options: ['无糖', '三分糖', '五分糖', '七分糖', '全糖'] },
            { name: '冰度', options: ['热饮', '常温', '少冰', '正常冰', '去冰'] }
          ],
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

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id
  }))

  return (
    <div>
      <Card>
        <Space wrap style={{ marginBottom: 16 }}>
          <Tag color={filters.isOnSale ? 'green' : 'default'} onClick={handleOnSaleFilter} style={{ cursor: 'pointer' }}>
            在售 ({onSaleCount})
          </Tag>
          <Tag color={filters.isOnSale === false ? 'red' : 'default'} onClick={() => {
            const newVal = filters.isOnSale === false ? undefined : false
            setFilters((prev) => ({ ...prev, isOnSale: newVal }))
            searchForm.setFieldsValue({ isOnSale: newVal })
          }} style={{ cursor: 'pointer' }}>
            已下架 ({drinks.length - onSaleCount})
          </Tag>
        </Space>

        <SearchForm onSearch={handleSearch} onReset={handleReset}>
          <SearchInput name="name" placeholder="搜索饮品名称" />
          <SearchSelect name="categoryId" placeholder="选择分类" options={categoryOptions} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加饮品
          </Button>
        </SearchForm>

        <Table
          columns={columns}
          dataSource={filteredDrinks}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
          loading={
            loading ? {
              indicator: <Spin size="large" />,
              tip: '数据加载中...'
            } : false
          }
          locale={{
            emptyText: <Empty description="暂无饮品数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }}
        />
      </Card>

      <CommonModal
        visible={isModalOpen}
        title={editingDrink ? '编辑饮品' : '添加饮品'}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitLoading}
        formProps={{ form }}
      >
        <Form.Item name="name" label="饮品名称" rules={[{ required: true, message: '请输入饮品名称' }]}>
          <Input placeholder="请输入饮品名称" />
        </Form.Item>
        <Form.Item name="categoryId" label="所属分类" rules={[{ required: true, message: '请选择分类' }]}>
          <Select placeholder="请选择分类">
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入售价" />
        </Form.Item>
        <Form.Item name="originalPrice" label="原价">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入原价" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea rows={3} placeholder="请输入描述" />
        </Form.Item>
        <Form.Item name="isOnSale" label="是否在售" valuePropName="checked">
          <Switch checkedChildren="在售" unCheckedChildren="下架" />
        </Form.Item>
      </CommonModal>
    </div>
  )
}
