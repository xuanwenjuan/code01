import React, { useState } from 'react'
import {
  Card,
  List,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Space,
  message,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons'
import { useSelector, useDispatch } from 'react-redux'
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/store/slices/userSlice'

const { Option } = Select
const { TextArea } = Input

const Address = () => {
  const dispatch = useDispatch()
  const { addresses, currentUser } = useSelector((state) => state.user)
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
    dispatch(deleteAddress(id))
    message.success('地址已删除')
  }

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id))
    message.success('已设为默认地址')
  }

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingAddress) {
        dispatch(updateAddress({ ...editingAddress, ...values }))
        message.success('地址更新成功')
      } else {
        dispatch(addAddress({ ...values, userId: currentUser?.id, isDefault: addresses.length === 0 }))
        message.success('地址添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    })
  }

  const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '陕西省']
  const cities = {
    '北京市': ['北京市'],
    '上海市': ['上海市'],
    '广东省': ['广州市', '深圳市', '东莞市', '佛山市'],
    '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '绍兴市'],
    '四川省': ['成都市', '绵阳市', '德阳市', '宜宾市'],
    '湖北省': ['武汉市', '宜昌市', '襄阳市', '荆州市'],
    '陕西省': ['西安市', '咸阳市', '宝鸡市', '渭南市']
  }
  const districts = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '通州区', '顺义区', '房山区']

  const [selectedProvince, setSelectedProvince] = useState(editingAddress?.province || '')
  const [selectedCity, setSelectedCity] = useState(editingAddress?.city || '')

  const handleProvinceChange = (value) => {
    setSelectedProvince(value)
    setSelectedCity('')
    form.setFieldsValue({ city: '' })
  }

  return (
    <div className="address-page">
      <div className="section-container">
        <div className="page-header">
          <h1 className="page-title">常用地址</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加新地址
          </Button>
        </div>

        <Card>
          {addresses.length > 0 ? (
            <List
              dataSource={addresses}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className="address-item"
                  actions={[
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(item)}
                    >
                      编辑
                    </Button>,
                    item.isDefault ? (
                      <span className="default-tag">默认地址</span>
                    ) : (
                      <Button type="link" onClick={() => handleSetDefault(item.id)}>
                        设为默认
                      </Button>
                    ),
                    <Popconfirm
                      title="确认删除该地址？"
                      onConfirm={() => handleDelete(item.id)}
                    >
                      <Button type="link" danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<EnvironmentOutlined className="address-icon" />}
                    title={
                      <div className="address-title">
                        <span className="contact-name">
                          <UserOutlined /> {item.name}
                        </span>
                        <span className="contact-phone">
                          <PhoneOutlined /> {item.phone}
                        </span>
                      </div>
                    }
                    description={
                      <p className="address-detail">
                        {item.province} {item.city} {item.district} {item.detail}
                      </p>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div className="empty-address">
              <p>暂无常用地址，请添加新地址</p>
            </div>
          )}
        </Card>

        <Modal
          title={editingAddress ? '编辑地址' : '添加新地址'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSubmit}
          okText={editingAddress ? '保存' : '添加'}
          width={600}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="name"
                label="收货人姓名"
                rules={[
                  { required: true, message: '请输入收货人姓名' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z]{2,}$/, message: '请输入正确的姓名' }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入收货人姓名" />
              </Form.Item>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
                style={{ flex: 1 }}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Form.Item
                name="province"
                label="省份"
                rules={[{ required: true, message: '请选择省份' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="请选择省份" onChange={handleProvinceChange}>
                  {provinces.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="city"
                label="城市"
                rules={[{ required: true, message: '请选择城市' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="请选择城市" disabled={!selectedProvince}>
                  {(cities[selectedProvince] || []).map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <Form.Item
              name="district"
              label="区县"
              rules={[{ required: true, message: '请选择区县' }]}
            >
              <Select placeholder="请选择区县">
                {districts.map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="detail"
              label="详细地址"
              rules={[
                { required: true, message: '请输入详细地址' },
                { min: 5, message: '详细地址至少5个字符' }
              ]}
            >
              <TextArea rows={3} placeholder="请输入详细地址，如街道、门牌号等" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default Address
