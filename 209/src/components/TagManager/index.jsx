import { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  ColorPicker,
  Typography
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { fetchTags, addTag, updateTag, deleteTag } from '../../store/slices/creationSlice'
import { validateRequired } from '../../utils/validators'

const { Text } = Typography

const TagManager = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const { tags, loading } = useSelector(state => state.creation)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      dispatch(fetchTags())
    }
  }, [dispatch, open])

  const handleAdd = () => {
    setEditingTag(null)
    form.resetFields()
    form.setFieldsValue({ color: '#1890ff' })
    setIsAddModalOpen(true)
  }

  const handleEdit = (tag) => {
    setEditingTag(tag)
    form.setFieldsValue({
      name: tag.name,
      color: tag.color
    })
    setIsAddModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteTag(id)).unwrap()
      message.success('删除成功')
    } catch (err) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const tagData = {
        name: values.name.trim(),
        color: values.color
      }

      if (editingTag) {
        await dispatch(updateTag({
          id: editingTag.id,
          name: tagData.name,
          color: tagData.color
        })).unwrap()
        message.success('更新成功')
      } else {
        await dispatch(addTag(tagData)).unwrap()
        message.success('添加成功')
      }
      setIsAddModalOpen(false)
      form.resetFields()
    } catch (err) {
      message.error(err?.message || '操作失败')
    }
  }

  const columns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color} style={{ fontSize: 14, padding: '4px 12px' }}>
          {text}
        </Tag>
      )
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      render: (color) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: color,
              border: '1px solid #d9d9d9'
            }}
          />
          <Text copyable>{color}</Text>
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <>
      <Modal
        title={<Space><TagOutlined /> 标签管理</Space>}
        open={open}
        onCancel={onClose}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增标签
          </Button>
        </div>
        <Table
          dataSource={tags}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 400 }}
        />
      </Modal>

      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="标签名称"
            rules={[
              validateRequired('请输入标签名称'),
              {
                min: 1,
                max: 10,
                message: '标签名称长度应为1-10个字符'
              }
            ]}
          >
            <Input placeholder="请输入标签名称" maxLength={10} showCount />
          </Form.Item>
          <Form.Item
            name="color"
            label="标签颜色"
            rules={[validateRequired('请选择颜色')]}
          >
            <ColorPicker
              showText
              format="hex"
              presets={[
                {
                  label: '推荐颜色',
                  colors: [
                    '#1890ff', '#52c41a', '#722ed1', '#fa8c16',
                    '#13c2c2', '#eb2f96', '#faad14', '#2f54eb',
                    '#f5222d', '#a0d911', '#fa541c', '#8c8c8c'
                  ]
                }
              ]}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? '保存修改' : '添加标签'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default TagManager
