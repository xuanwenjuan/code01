import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Switch,
  Input,
  Select,
  Space,
  Image,
  Card,
  Tree,
  Tag,
  Row,
  Col,
  Grid,
  message,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { DataNode } from 'antd/es/tree'
import useStore from '../store'
import { categories as mockCategories, products as mockProducts } from '../mock'
import { Product, ProductStatus } from '../types'
import CommonModal from './CommonModal'
import CommonForm from './CommonForm'

const { Search } = Input
const { Option } = Select
const { useBreakpoint } = Grid

const ProductManagement: React.FC = () => {
  const { categories, products, setCategories, setProducts, updateProduct } = useStore()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm<Product>()
  const screens = useBreakpoint()

  useEffect(() => {
    if (categories.length === 0) {
      setCategories(mockCategories)
    }
    if (products.length === 0) {
      setProducts(mockProducts)
    }
  }, [])

  const buildCategoryTree = (data: typeof mockCategories): DataNode[] => {
    const map = new Map<string, DataNode>()
    const roots: DataNode[] = []

    data.forEach((item) => {
      map.set(item.id, { ...item, title: item.name, key: item.id })
    })

    data.forEach((item) => {
      const node = map.get(item.id)!
      if (item.parentId === null) {
        roots.push(node)
      } else {
        const parent = map.get(item.parentId)
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(node)
        }
      }
    })

    return roots
  }

  const handleStatusChange = (record: Product, checked: boolean) => {
    const newStatus: ProductStatus = checked ? 'on' : 'off'
    updateProduct({ ...record, status: newStatus })
    message.success(`商品已${newStatus === 'on' ? '上架' : '下架'}`)
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase())
    const matchCategory = !selectedCategory || p.categoryId === selectedCategory
    return matchSearch && matchCategory
  })

  const columns: ColumnsType<Product> = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      fixed: 'left',
      render: (text: string) => (
        <Image width={60} height={60} src={text} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
    },
    {
      title: '售价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (text: number) => <span style={{ color: '#1890ff', fontWeight: 500 }}>¥{text.toFixed(2)}</span>,
    },
    {
      title: '活动价',
      dataIndex: 'activityPrice',
      key: 'activityPrice',
      width: 100,
      render: (text?: number) =>
        text ? (
          <Tag color="red" style={{ margin: 0 }}>
            ¥{text.toFixed(2)}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => (
        <span style={{ color: stock < 10 ? '#ff4d4f' : stock < 50 ? '#faad14' : '#52c41a', fontWeight: 500 }}>
          {stock}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: ProductStatus, record: Product) => (
        <Space>
          <Tag color={status === 'on' ? 'green' : 'default'}>{status === 'on' ? '上架' : '下架'}</Tag>
          <Switch
            size="small"
            checked={status === 'on'}
            checkedChildren="开"
            unCheckedChildren="关"
            onChange={(checked) => handleStatusChange(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record: Product) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record)
              form.setFieldsValue(record)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleOk = async () => {
    try {
      setConfirmLoading(true)
      const values = await form.validateFields()
      if (editingProduct) {
        updateProduct({ ...editingProduct, ...values })
        message.success('商品更新成功')
      }
      setModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      setConfirmLoading(false)
    }
  }

  const showSidebar = !screens.xs

  return (
    <div>
      <Card
        title="商品管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增商品
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="搜索商品名称"
              allowClear
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="选择分类"
              style={{ width: '100%' }}
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row gutter={16}>
          {showSidebar && (
            <Col xs={0} sm={0} md={6} lg={5} xl={4}>
              <Card title="商品分类" size="small">
                <Tree
                  treeData={buildCategoryTree(categories)}
                  onSelect={(selectedKeys) => {
                    setSelectedCategory(selectedKeys[0] as string | undefined)
                  }}
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                />
              </Card>
            </Col>
          )}
          <Col xs={24} sm={24} md={18} lg={19} xl={20}>
            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
              scroll={{ x: 'max-content' }}
              size="middle"
            />
          </Col>
        </Row>
      </Card>

      <CommonModal
        title={editingProduct ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        width={600}
      >
        <CommonForm form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder="请选择分类">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入库存" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入售价" prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="activityPrice" label="活动价">
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入活动价" prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="商品描述">
                <Input.TextArea rows={4} placeholder="请输入商品描述" />
              </Form.Item>
            </Col>
          </Row>
        </CommonForm>
      </CommonModal>
    </div>
  )
}

export default ProductManagement
