import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, List, Avatar, Modal, Form, Input, Radio, message, Space, Tag } from 'antd'
import { PlusOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { addAddress, updateAddress, deleteAddress } from '@/store/slices/userSlice'
import { validatePhone, validateName } from '@/utils/validation'

const Addresses = () => {
  const dispatch = useDispatch()
  const { addresses } = useSelector(state => state.user)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingAddress(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    form.setFieldsValue(address)
    setModalVisible(true)
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      onOk: () => {
        dispatch(deleteAddress(id))
        message.success('删除成功')
      }
    })
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingAddress) {
        dispatch(updateAddress({ id: editingAddress.id, ...values }))
        message.success('修改成功')
      } else {
        dispatch(addAddress(values))
        message.success('添加成功')
      }
      setModalVisible(false)
    } catch (error) {
      console.log('Submit Failed:', error)
    }
  }

  return (
    <div>
      <Card
        bordered={false}
        title="常用地址"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增地址
          </Button>
        }
      >
        {addresses.length > 0 ? (
          <List
            dataSource={addresses}
            renderItem={item => (
              <List.Item
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  marginBottom: 12,
                  padding: 16
                }}
                actions={[
                  <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                    编辑
                  </Button>,
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>
                    删除
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div>
                      <span style={{ marginRight: 12, fontWeight: 500 }}>{item.name}</span>
                      <span style={{ color: '#666', marginRight: 12 }}>{item.phone}</span>
                      {item.isDefault && <Tag color="blue">默认地址</Tag>}
                    </div>
                  }
                  description={`${item.province} ${item.city} ${item.district} ${item.detail}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            暂无常用地址
          </div>
        )}
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '新增地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="name"
              label="收货人"
              rules={[{ validator: validateName }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[{ validator: validatePhone }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="province"
              label="省份"
              rules={[{ required: true, message: '请输入省份' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="省份" />
            </Form.Item>
            <Form.Item
              name="city"
              label="城市"
              rules={[{ required: true, message: '请输入城市' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="城市" />
            </Form.Item>
            <Form.Item
              name="district"
              label="区县"
              rules={[{ required: true, message: '请输入区县' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="区县" />
            </Form.Item>
          </div>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入详细地址" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Radio>设为默认地址</Radio>
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" onClick={handleSubmit}>保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Addresses
