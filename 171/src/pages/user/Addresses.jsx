import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Empty,
} from 'antd'
import {
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/store/slices/addressSlice'
import { phoneRegex, nameRegex } from '@/hooks/useFormValidation'

const { Option } = Select
const { TextArea } = Input

const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '陕西省']
const cityMap = {
  '北京市': ['北京市'],
  '上海市': ['上海市'],
  '广东省': ['广州市', '深圳市', '东莞市', '佛山市'],
  '浙江省': ['杭州市', '宁波市', '温州市'],
  '江苏省': ['南京市', '苏州市', '无锡市'],
  '四川省': ['成都市', '绵阳市', '德阳市'],
  '湖北省': ['武汉市', '宜昌市', '襄阳市'],
  '陕西省': ['西安市', '咸阳市', '宝鸡市'],
}

function UserAddresses() {
  const dispatch = useDispatch()
  const { currentUser } = useSelector((state) => state.user)
  const { addresses } = useSelector((state) => state.address)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [form] = Form.useForm()
  const [selectedProvince, setSelectedProvince] = useState('北京市')

  const userAddresses = addresses.filter((a) => a.userId === currentUser?.id)

  const handleAdd = () => {
    setEditingAddress(null)
    form.resetFields()
    setSelectedProvince('北京市')
    setModalVisible(true)
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    form.setFieldsValue(address)
    setSelectedProvince(address.province)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingAddress) {
        dispatch(updateAddress({ id: editingAddress.id, ...values, userId: currentUser.id }))
        message.success('地址更新成功')
      } else {
        dispatch(addAddress({ ...values, userId: currentUser.id }))
        message.success('地址添加成功')
      }
      setModalVisible(false)
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  const handleDelete = (id) => {
    dispatch(deleteAddress(id))
    message.success('地址已删除')
  }

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id))
    message.success('已设为默认地址')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>常用地址</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增地址
        </Button>
      </div>
      <Card>
        {userAddresses.length > 0 ? (
          <List
            dataSource={userAddresses}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" size="small" onClick={() => handleSetDefault(item.id)} disabled={item.isDefault}>
                    <StarOutlined style={{ color: item.isDefault ? '#faad14' : '#999' }} />
                    {item.isDefault ? ' 默认' : ' 设为默认'}
                  </Button>,
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(item)}>
                    编辑
                  </Button>,
                  <Popconfirm title="确定删除这个地址吗？" onConfirm={() => handleDelete(item.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={
                    <Space>
                      {item.contactName}
                      <span style={{ color: '#999' }}>{item.phone}</span>
                      {item.isDefault && <Tag color="blue">默认</Tag>}
                    </Space>
                  }
                  description={`${item.province} ${item.city} ${item.district} ${item.detail}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无地址" className="empty-state" />
        )}
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '新增地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="contactName"
            label="收货人姓名"
            rules={[
              { required: true, message: '请输入收货人姓名' },
              { pattern: nameRegex, message: '姓名2-20位' },
            ]}
          >
            <Input placeholder="请输入收货人姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号码"
            rules={[
              { required: true, message: '请输入手机号码' },
              { pattern: phoneRegex, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号码" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请选择省份' }]}
          >
            <Select
              placeholder="请选择省份"
              onChange={(value) => {
                setSelectedProvince(value)
                form.setFieldsValue({ city: undefined, district: undefined })
              }}
            >
              {provinces.map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select placeholder="请选择城市">
              {(cityMap[selectedProvince] || []).map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="district"
            label="区县"
            rules={[{ required: true, message: '请选择区县' }]}
          >
            <Input placeholder="请输入区县" />
          </Form.Item>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <TextArea rows={3} placeholder="请输入详细地址，如街道、门牌号等" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserAddresses
