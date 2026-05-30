import React, { useEffect, useState, useCallback } from 'react'
import {
  Tree,
  Button,
  Space,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  Card,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@/store'
import { categoryData } from '@/mock'
import { Category } from '@/types'
import ModalForm from '@/components/ModalForm'

const { TreeNode } = Tree

interface CategoryFormData {
  name: string
  parentId: string | null
  sort: number
  status: 'active' | 'inactive'
}

function Categories() {
  const { categories, setCategories, addCategory, updateCategory, deleteCategory } = useAppStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(true)
      setTimeout(() => {
        setCategories(categoryData)
        setLoading(false)
      }, 500)
    }
  }, [categories.length, setCategories])

  const handleAdd = (parentId: string | null = null) => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setLoading(true)
    setTimeout(() => {
      deleteCategory(id)
      setLoading(false)
      message.success('删除成功')
    }, 300)
  }

  const flattenCategories = useCallback((cats: Category[], result: Category[] = []): Category[] => {
    cats.forEach((cat) => {
      result.push(cat)
      if (cat.children) {
        flattenCategories(cat.children, result)
      }
    })
    return result
  }, [])

  const countCategories = (cats: Category[]): { total: number; active: number; inactive: number } => {
    const flat = flattenCategories(cats)
    return {
      total: flat.length,
      active: flat.filter((c) => c.status === 'active').length,
      inactive: flat.filter((c) => c.status === 'inactive').length,
    }
  }

  const stats = countCategories(categories)

  const parentOptions = [
    { label: '顶级分类', value: null },
    ...flattenCategories(categories).map((c) => ({
      label: `${'　'.repeat(c.level - 1)}${c.name}`,
      value: c.id,
      disabled: editingCategory?.id === c.id,
    })),
  ]

  const handleOk = (values: CategoryFormData) => {
    const now = new Date().toLocaleString()
    setLoading(true)
    setTimeout(() => {
      if (editingCategory) {
        updateCategory(editingCategory.id, {
          ...values,
          updatedAt: now,
        })
        message.success('编辑成功')
      } else {
        const parentLevel = values.parentId
          ? flattenCategories(categories).find((c) => c.id === values.parentId)?.level || 0
          : 0
        addCategory({
          id: Date.now().toString(),
          name: values.name,
          parentId: values.parentId,
          level: parentLevel + 1,
          sort: values.sort,
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

  const renderTreeNodes = (data: Category[]) => {
    return data.map((item) => (
      <TreeNode
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AppstoreOutlined style={{ color: item.status === 'active' ? '#1890ff' : '#999' }} />
              <span style={{ fontWeight: 500 }}>{item.name}</span>
              <Tag color={item.status === 'active' ? 'success' : 'default'}>
                {item.status === 'active' ? '启用' : '停用'}
              </Tag>
              <Tag color="blue">Lv.{item.level}</Tag>
            </div>
            <Space>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(item.id)}>
                添加子级
              </Button>
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                编辑
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
                删除
              </Button>
            </Space>
          </div>
        }
        key={item.id}
      >
        {item.children ? renderTreeNodes(item.children) : null}
      </TreeNode>
    ))
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>文创品类分类管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(null)}>
          添加顶级分类
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={8} sm={8} md={8}>
          <Card>
            <Statistic
              title="总分类数"
              value={stats.total}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={8}>
          <Card>
            <Statistic
              title="启用分类"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={8}>
          <Card>
            <Statistic
              title="停用分类"
              value={stats.inactive}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Spin spinning={loading} tip="加载中...">
        {categories.length === 0 ? (
          <Card style={{ textAlign: 'center' }}>
            <Empty description="暂无分类数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </Card>
        ) : (
          <Card>
            <Tree showLine defaultExpandAll>
              {renderTreeNodes(categories)}
            </Tree>
          </Card>
        )}
      </Spin>

      <ModalForm<CategoryFormData>
        open={modalOpen}
        title={editingCategory ? '编辑分类' : '添加分类'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        initialValues={editingCategory || {
          name: '',
          parentId: null,
          sort: 1,
          status: 'active',
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="parentId" label="父级分类">
            <Select options={parentOptions} placeholder="请选择父级分类" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序"
                rules={[{ required: true, message: '请输入排序' }]}
              >
                <Input type="number" placeholder="请输入排序" min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="状态"
                valuePropName="checked"
                getValueFromEvent={(checked: boolean) => (checked ? 'active' : 'inactive')}
                getValueProps={(value: string) => ({ checked: value === 'active' })}
              >
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </ModalForm>
    </div>
  )
}

export default Categories
