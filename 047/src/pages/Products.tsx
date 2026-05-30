import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Button,
  Space,
  Tag,
  message,
  Row,
  Col,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Alert,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { productData, categoryData } from '@/mock'
import { ProductSku, ProductQueryParams, Category } from '@/types'
import ModalForm from '@/components/ModalForm'
import QueryForm from '@/components/QueryForm'
import TableContainer from '@/components/TableContainer'

interface ProductFormData {
  productName: string
  categoryId: string
  color: string
  size: string
  retailPrice: number
  activityPrice: number
  stock: number
  stockThreshold: number
  outOfStockReminder: boolean
  status: 'on_sale' | 'off_sale'
}

interface SpecCombination {
  color: string
  size: string
  price?: number
  stock?: number
}

const colorOptions = [
  { label: '红色', value: '红色' },
  { label: '蓝色', value: '蓝色' },
  { label: '绿色', value: '绿色' },
  { label: '黑色', value: '黑色' },
  { label: '白色', value: '白色' },
  { label: '金色', value: '金色' },
]

const sizeOptions = [
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: '限定版', value: '限定版' },
]

function Products() {
  const { products, setProducts, addProduct, updateProduct, deleteProduct } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductSku | null>(null)
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({})
  const [loading, setLoading] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [batchForm] = Form.useForm<{
    productName: string
    categoryId: string
    colors: string[]
    sizes: string[]
    baseRetailPrice: number
    baseActivityPrice: number
    baseStock: number
    stockThreshold: number
  }>()

  useEffect(() => {
    if (products.length === 0) {
      setLoading(true)
      setTimeout(() => {
        setProducts(productData)
        setLoading(false)
      }, 500)
    }
  }, [products.length, setProducts])

  const flattenCategories = useCallback((cats: Category[], result: Category[] = []): Category[] => {
    cats.forEach((cat) => {
      result.push(cat)
      if (cat.children) {
        flattenCategories(cat.children, result)
      }
    })
    return result
  }, [])

  const categoryOptions = useMemo(() => {
    return flattenCategories(categoryData).map((c) => ({
      label: c.name,
      value: c.id,
    }))
  }, [flattenCategories])

  const queryFields = [
    {
      name: 'productName',
      label: '商品名称',
      type: 'input' as const,
      placeholder: '请输入商品名称',
    },
    {
      name: 'categoryId',
      label: '所属分类',
      type: 'select' as const,
      placeholder: '请选择分类',
      options: categoryOptions,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '请选择状态',
      options: [
        { label: '在售', value: 'on_sale' },
        { label: '下架', value: 'off_sale' },
      ],
    },
  ]

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (queryParams.productName && !item.productName.includes(queryParams.productName)) {
        return false
      }
      if (queryParams.categoryId && item.categoryId !== queryParams.categoryId) {
        return false
      }
      if (queryParams.status && item.status !== queryParams.status) {
        return false
      }
      return true
    })
  }, [products, queryParams])

  const handleSearch = (values: ProductQueryParams) => {
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

  const handleAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleBatchAdd = () => {
    batchForm.resetFields()
    setBatchModalOpen(true)
  }

  const handleEdit = (product: ProductSku) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setLoading(true)
    setTimeout(() => {
      deleteProduct(id)
      setLoading(false)
      message.success('删除成功')
    }, 300)
  }

  const handleOk = (values: ProductFormData) => {
    const now = new Date().toLocaleString()
    const categoryName = flattenCategories(categoryData).find((c) => c.id === values.categoryId)?.name || ''

    setLoading(true)
    setTimeout(() => {
      if (editingProduct) {
        updateProduct(editingProduct.id, {
          ...values,
          categoryName,
          specs: {
            颜色: values.color,
            尺寸: values.size,
          },
          updatedAt: now,
        })
        message.success('编辑成功')
      } else {
        addProduct({
          id: Date.now().toString(),
          productId: Date.now().toString() + '-p',
          productName: values.productName,
          categoryId: values.categoryId,
          categoryName,
          specs: {
            颜色: values.color,
            尺寸: values.size,
          },
          retailPrice: values.retailPrice,
          activityPrice: values.activityPrice,
          stock: values.stock,
          stockThreshold: values.stockThreshold,
          outOfStockReminder: values.outOfStockReminder,
          status: values.status,
          createdAt: now,
          updatedAt: now,
        })
        message.success('添加成功')
      }
      setLoading(false)
      setModalOpen(false)
    }, 500)
  }

  const handleBatchOk = async () => {
    try {
      const values = await batchForm.validateFields()
      const now = new Date().toLocaleString()
      const categoryName = flattenCategories(categoryData).find((c) => c.id === values.categoryId)?.name || ''

      setLoading(true)

      const combinations: SpecCombination[] = []
      values.colors.forEach((color) => {
        values.sizes.forEach((size) => {
          combinations.push({ color, size })
        })
      })

      let successCount = 0
      combinations.forEach((spec) => {
        const existing = products.find(
          (p) =>
            p.productName === values.productName &&
            p.specs.颜色 === spec.color &&
            p.specs.尺寸 === spec.size
        )
        if (!existing) {
          addProduct({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            productId: Date.now().toString() + '-p',
            productName: values.productName,
            categoryId: values.categoryId,
            categoryName,
            specs: {
              颜色: spec.color,
              尺寸: spec.size,
            },
            retailPrice: values.baseRetailPrice,
            activityPrice: values.baseActivityPrice,
            stock: values.baseStock,
            stockThreshold: values.stockThreshold,
            outOfStockReminder: true,
            status: 'on_sale',
            createdAt: now,
            updatedAt: now,
          })
          successCount++
        }
      })

      setTimeout(() => {
        setLoading(false)
        setBatchModalOpen(false)
        if (successCount > 0) {
          message.success(`批量生成成功，新增 ${successCount} 个 SKU`)
        } else {
          message.info('所有 SKU 组合已存在')
        }
      }, 800)
    } catch (error) {
      message.error('请完善表单信息')
    }
  }

  const initialFormValues: ProductFormData | undefined = editingProduct
    ? {
        productName: editingProduct.productName,
        categoryId: editingProduct.categoryId,
        color: editingProduct.specs.颜色 || '',
        size: editingProduct.specs.尺寸 || '',
        retailPrice: editingProduct.retailPrice,
        activityPrice: editingProduct.activityPrice,
        stock: editingProduct.stock,
        stockThreshold: editingProduct.stockThreshold,
        outOfStockReminder: editingProduct.outOfStockReminder,
        status: editingProduct.status,
      }
    : undefined

  const modalConfig = {
    title: editingProduct ? '编辑商品' : '添加商品',
    width: 700,
    fields: [
      {
        name: 'productName',
        label: '商品名称',
        type: 'input' as const,
        rules: [{ required: true, message: '请输入商品名称' }],
      },
      {
        name: 'categoryId',
        label: '所属分类',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择所属分类' }],
        options: categoryOptions,
      },
      {
        name: 'color',
        label: '颜色',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择颜色' }],
        options: colorOptions,
      },
      {
        name: 'size',
        label: '尺寸',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择尺寸' }],
        options: sizeOptions,
      },
      {
        name: 'retailPrice',
        label: '零售价',
        type: 'number' as const,
        rules: [{ required: true, message: '请输入零售价' }],
      },
      {
        name: 'activityPrice',
        label: '活动价',
        type: 'number' as const,
        rules: [{ required: true, message: '请输入活动价' }],
      },
      {
        name: 'stock',
        label: '库存数量',
        type: 'number' as const,
        rules: [{ required: true, message: '请输入库存数量' }],
      },
      {
        name: 'stockThreshold',
        label: '库存阈值',
        type: 'number' as const,
        rules: [{ required: true, message: '请输入库存阈值' }],
      },
      {
        name: 'outOfStockReminder',
        label: '缺货提醒',
        type: 'switch' as const,
      },
      {
        name: 'status',
        label: '状态',
        type: 'select' as const,
        rules: [{ required: true, message: '请选择状态' }],
        options: [
          { label: '在售', value: 'on_sale' },
          { label: '下架', value: 'off_sale' },
        ],
      },
    ],
  }

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 180,
      ellipsis: true,
      fixed: 'left' as const,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
    },
    {
      title: '规格',
      key: 'specs',
      width: 150,
      render: (_: unknown, record: ProductSku) => (
        <div>
          <Tag color="blue">{record.specs.颜色}</Tag>
          <Tag color="green">{record.specs.尺寸}</Tag>
        </div>
      ),
    },
    {
      title: '零售价',
      dataIndex: 'retailPrice',
      key: 'retailPrice',
      width: 100,
      render: (price: number) => <span style={{ color: '#1890ff', fontWeight: 500 }}>¥{price}</span>,
    },
    {
      title: '活动价',
      dataIndex: 'activityPrice',
      key: 'activityPrice',
      width: 100,
      render: (price: number) => <span style={{ color: '#f5222d', fontWeight: 500 }}>¥{price}</span>,
    },
    {
      title: '库存',
      key: 'stock',
      width: 120,
      render: (_: unknown, record: ProductSku) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.stock} 件</div>
          {record.stock <= record.stockThreshold && (
            <Tag color="red" style={{ marginTop: 4 }}>
              库存预警
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '缺货提醒',
      dataIndex: 'outOfStockReminder',
      key: 'outOfStockReminder',
      width: 100,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'default'}>{value ? '开启' : '关闭'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'on_sale' ? 'success' : 'error'}>
          {status === 'on_sale' ? '在售' : '下架'}
        </Tag>
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
      width: 150,
      render: (_: unknown, record: ProductSku) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>商品SKU规格管理</h2>
        <Space>
          <Button type="default" icon={<PlusOutlined />} onClick={handleBatchAdd}>
            批量生成SKU
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加商品
          </Button>
        </Space>
      </div>

      <QueryForm<ProductQueryParams>
        fields={queryFields}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      <TableContainer<ProductSku>
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={loading}
        emptyText="暂无商品数据"
        scroll={{ x: 1300 }}
        virtual={filteredProducts.length > 100}
      />

      <ModalForm<ProductFormData>
        open={modalOpen}
        title={editingProduct ? '编辑商品' : '添加商品'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        initialValues={initialFormValues}
        config={modalConfig}
        col={2}
        width={700}
      />

      <ModalForm
        open={batchModalOpen}
        title="批量生成SKU"
        onCancel={() => setBatchModalOpen(false)}
        onOk={handleBatchOk}
        width={700}
      >
        <Form form={batchForm} layout="vertical">
          <Alert
            message="多规格联动说明"
            description="选择多个颜色和多个尺寸后，系统会自动生成所有颜色和尺寸的组合SKU。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="categoryId"
                label="所属分类"
                rules={[{ required: true, message: '请选择所属分类' }]}
              >
                <Select placeholder="请选择所属分类" options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="colors"
                label="颜色选择（多选联动）"
                rules={[{ required: true, message: '请至少选择一个颜色' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择颜色"
                  options={colorOptions}
                  maxTagCount={3}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sizes"
                label="尺寸选择（多选联动）"
                rules={[{ required: true, message: '请至少选择一个尺寸' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择尺寸"
                  options={sizeOptions}
                  maxTagCount={3}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="baseRetailPrice"
                label="基础零售价"
                rules={[{ required: true, message: '请输入基础零售价' }]}
              >
                <InputNumber placeholder="零售价" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="baseActivityPrice"
                label="基础活动价"
                rules={[{ required: true, message: '请输入基础活动价' }]}
              >
                <InputNumber placeholder="活动价" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="baseStock"
                label="基础库存"
                rules={[{ required: true, message: '请输入基础库存' }]}
              >
                <InputNumber placeholder="库存数量" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="stockThreshold"
                label="库存预警阈值"
                rules={[{ required: true, message: '请输入库存预警阈值' }]}
              >
                <InputNumber placeholder="库存阈值" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ModalForm>
    </div>
  )
}

export default Products
